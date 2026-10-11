// Command polyfills-browserstack runs the polyfill-library browser test suite
// on BrowserStack, replacing the WebdriverIO harness in remotetest.js. The test
// pages are still served by test/polyfills/server.js; this command only drives
// browsers.
//
// Only the W3C WebDriver protocol is used: capabilities go out as alwaysMatch
// and commands use the W3C routes, with no JSON Wire Protocol fallback.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/Masterminds/semver/v3"
	"github.com/mrhenry/polyfill-library/scripts/browsercmp"
	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
	"github.com/mrhenry/polyfill-library/scripts/polyfillmeta"
	"github.com/mrhenry/polyfill-library/scripts/testserver"
)

const (
	// serverPort is the port test/polyfills/server.js listens on.
	serverPort = 9876

	projectName = "polyfill-library"

	// concurrency is how many BrowserStack sessions run at once, used when the
	// account plan cannot be read.
	concurrency = 4

	// testBrowserTimeout is how long one browser may run without making
	// progress. Measured runs finish well under two minutes.
	testBrowserTimeout = 10 * time.Minute

	// pollTick is how often test progress is read from the page.
	pollTick = time.Second

	// sessionStartTimeout bounds a single New Session call. Measured session
	// creation took 6 to 32 seconds.
	sessionStartTimeout = 2 * time.Minute

	// maxAttempts is how many times a browser whose session could not start is
	// retried.
	maxAttempts = 3

	// retryDelay is the pause between attempts that failed to start a session.
	retryDelay = 30 * time.Second

	// replacementDelay is the pause before requesting a replacement session, so
	// BrowserStack can release the discarded machine. Browsers with a small pool
	// (IE 10 especially) queue the replacement otherwise.
	replacementDelay = 15 * time.Second

	// sessionReplacements bounds how many sessions one job may discard after a
	// navigation was accepted but never acted on.
	sessionReplacements = 3

	// passPause is the pause between the combination pass and the individual
	// pass. The two jobs for one browser+version otherwise claim the same
	// machine back to back, and a machine a job has just released is not
	// ready for the next request immediately.
	passPause = 5 * time.Second

	// testServerStartTimeout bounds how long to wait for the JavaScript test
	// server to accept connections. CI starts it beside this process, so the
	// two race.
	testServerStartTimeout = 20 * time.Second

	testServerProbeTimeout = 500 * time.Millisecond

	// testServerProbeInterval is the pause between probes while waiting for the
	// server to start.
	testServerProbeInterval = 250 * time.Millisecond
)

type options struct {
	browserFilter            string
	versionRanges            string
	modifiedOnly             bool
	testMode                 pagecontract.Mode
	director                 bool
	testPolyfillCombinations bool

	// list prints the selected browsers and exits, without creating sessions.
	list bool

	// maxConcurrency overrides how many sessions run at once.
	maxConcurrency int

	// concurrencyExplicit records that -concurrency was passed, so the account
	// plan does not override an operator's choice.
	concurrencyExplicit bool

	// feature is the comma separated polyfill subset to test, derived from the
	// change set.
	feature string

	// testEverything disables per browser polyfill gating.
	testEverything bool
}

// parseArgs reads the positional flags the CI workflows pass, plus -list for a
// dry run and -concurrency to change the session limit.
func parseArgs(args []string) options {
	o := options{testMode: pagecontract.ModeAll, testEverything: true, maxConcurrency: concurrency}

	for i := 0; i < len(args); i++ {
		arg := args[i]

		switch {
		case arg == "test-modified-only":
			o.modifiedOnly = true
		case arg == "director":
			o.director = true
		case arg == "test-polyfill-combinations":
			o.testPolyfillCombinations = true
		case arg == "-list":
			o.list = true
		case arg == "-concurrency" && i+1 < len(args):
			i++

			if n, err := strconv.Atoi(args[i]); err == nil && n > 0 {
				o.maxConcurrency = n
				o.concurrencyExplicit = true
			}
		case strings.HasPrefix(arg, "browser="):
			value := strings.TrimPrefix(arg, "browser=")
			o.browserFilter, o.versionRanges, _ = strings.Cut(value, "/")
		case arg == string(pagecontract.ModeAll), arg == string(pagecontract.ModeControl), arg == string(pagecontract.ModeTargeted):
			o.testMode = pagecontract.Mode(arg)
		}
	}

	return o
}

func main() {
	if err := run(parseArgs(os.Args[1:])); err != nil {
		slog.Error("run failed", "error", err)
		os.Exit(1)
	}
}

func run(opts options) error {
	repo := repoRoot()

	// The whole run is bounded by the CI job timeout; this context only carries
	// interruption.
	runnerCtx, stopSignals := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stopSignals()

	// A dry run only lists browsers, so it needs neither a test server nor
	// credentials, and must not spend the startup budget waiting for them.
	testServer := testserver.New(testServerURL)

	if !opts.list {
		if err := ensureTestServer(runnerCtx, repo, testServer); err != nil {
			return err
		}
	}

	credentials := browserstack.Credentials{
		UserName:  os.Getenv("BROWSERSTACK_USERNAME"),
		AccessKey: os.Getenv("BROWSERSTACK_ACCESS_KEY"),
	}
	if !opts.list && !credentials.Valid() {
		return errors.New("BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set in the environment to run tests on BrowserStack")
	}

	metas, err := polyfillmeta.Load(repo)
	if err != nil {
		return err
	}

	if opts.modifiedOnly {
		files := modifiedFiles()

		modified := metas.ModifiedPolyfillsWithTests(files)
		opts.testEverything = modified.TestEverything

		if !modified.TestEverything {
			affectedNames := make([]string, 0, len(modified.AffectedPolyfills))
			for name := range modified.AffectedPolyfills {
				affectedNames = append(affectedNames, name)
			}

			sort.Strings(affectedNames)

			opts.feature = strings.Join(affectedNames, ",")
		}

		slog.Info("polyfills under test",
			"count", len(names(opts.feature)), "testEverything", opts.testEverything)
	}

	browserList, err := browserstack.LoadBrowserList(filepath.Join(repo, "test/polyfills/browsers.toml"))
	if err != nil {
		return err
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(repo, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		return err
	}

	affected := affectedBrowsers(metas, opts)

	entries := selectBrowsers(browserList.Browsers, opts, affected)
	if len(entries) == 0 {
		slog.Info("nothing to test")
		return nil
	}

	slog.Info("browsers selected", "count", len(entries), "browsers", strings.Join(entries, ", "))

	if opts.list {
		return nil
	}

	runID := newRunID()
	slog.Info("run id",
		"id", runID, "hint", "appears as trace=<run><seq>-<browser> in the test server log")

	jobs := buildJobs(entries, browserstack.NewIndex(stackList.Browsers), opts, runID)
	if len(jobs) == 0 {
		slog.Info("nothing to test")
		return nil
	}

	client := browserstack.New(browserstack.Config{Credentials: credentials})

	closeTunnel, err := client.OpenTunnel(runnerCtx)
	if err != nil {
		return err
	}

	defer func() {
		if err := closeTunnel(); err != nil {
			slog.Warn("closing the tunnel", "error", err)
		}
	}()

	slog.Info("tunnel ready")

	// The binary reports ready before BrowserStack routes local sessions, so
	// wait for it to actually be usable.
	if err := client.WaitForTunnel(runnerCtx); err != nil {
		return err
	}

	sessionName := fmt.Sprintf("Polyfill Library: %s", runID)

	// The gate admits each start against the account's free capacity; the local
	// concurrency limit only bounds this process.
	gate := newCapacityGate(client)

	r := newRunner(browserstackDial(client, credentials), testServer, gate, sessionName)

	s := newScheduler(r, concurrencyFor(runnerCtx, gate, opts))

	failed := s.run(runnerCtx, jobs)

	if err := writeResults(repo, opts, jobs); err != nil {
		slog.Error("writing results", "error", err)
	}

	if failed > 0 {
		reportFailures(jobs, opts)

		return errors.New("failures detected")
	}

	return nil
}

func names(feature string) []string {
	if feature == "" {
		return nil
	}

	return strings.Split(feature, ",")
}

// affectedBrowsers collects the polyfill browser targets that gate which
// browsers need testing.
func affectedBrowsers(metas *polyfillmeta.Collection, opts options) []*polyfillmeta.Meta {
	if opts.testEverything {
		return nil
	}

	var out []*polyfillmeta.Meta
	for _, feature := range names(opts.feature) {
		if meta, ok := metas.Meta(feature); ok {
			out = append(out, meta)
		}
	}

	return out
}

// selectBrowsers applies the browser filter and the polyfill gating.
func selectBrowsers(all []string, opts options, affected []*polyfillmeta.Meta) []string {
	out := make([]string, 0, len(all))

	for _, entry := range all {
		if !matchesBrowserFilter(entry, opts) {
			continue
		}

		// An unknown family is new and needs mapping or exclusion, not a
		// silent skip.
		if !browserua.KnownEntry(entry) {
			slog.Warn("skipping browser: family is not targeted by the polyfill library",
				"browser", entry, "family", browserua.FamilyOf(entry))

			continue
		}

		ua := browserua.New(browserua.FromBrowserEntry(entry))

		// Below-baseline versions cannot be tested.
		if ua.IsUnknown() {
			continue
		}

		if !opts.testEverything && !neededForAny(ua, affected) {
			continue
		}

		out = append(out, entry)
	}

	return out
}

// matchesBrowserFilter implements browser=<family>[/<version ranges>].
func matchesBrowserFilter(entry string, opts options) bool {
	if opts.browserFilter == "" {
		return true
	}

	family, version, _ := strings.Cut(entry, "/")
	if family != opts.browserFilter {
		return false
	}

	if opts.versionRanges == "" {
		return true
	}

	coerced, err := semver.NewVersion(browsercmp.Coerce(version))
	if err != nil {
		return false
	}

	constraint, err := semver.NewConstraint(opts.versionRanges)
	if err != nil {
		return false
	}

	return constraint.Check(coerced)
}

// neededForAny reports whether any polyfill under test targets this browser.
func neededForAny(ua *browserua.UA, affected []*polyfillmeta.Meta) bool {
	for _, meta := range affected {
		rangeStr, ok := meta.Browsers[ua.Family()]
		if ok && ua.Satisfies(rangeStr) {
			return true
		}
	}

	return false
}

func buildJobs(entries []string, index *browserstack.Index, opts options, runID string) []*job {
	baseURL := fmt.Sprintf("http://bs-local.com:%d", serverPort)
	baseRequest := opts.request()

	jobs := make([]*job, 0, len(entries))

	for _, entry := range entries {
		browser, ok := index.Lookup(entry)
		if !ok {
			slog.Warn("skipping browser: not found in browserstackBrowsers.toml", "browser", entry)

			continue
		}

		base := job{
			name:         entry,
			browser:      browser,
			testMode:     opts.testMode,
			expectedPage: baseRequest.ExpectedPage(),
			trace:        nextTrace(runID, entry),
			state:        newJobState(),
		}

		// Real devices need os/os_version on every session, so they are left
		// untouched.
		if browser.Device == "" {
			if browserstack.HasPreference(entry) {
				base.preferred = browser
				base.hasPreferred = true
			}

			base.browser.OS = ""
			base.browser.OSVersion = ""
		}

		// Slow browsers are split in two during a full run, so one cannot
		// monopolise it.
		if needsShard(entry) && opts.testEverything {
			for shard := 1; shard <= 2; shard++ {
				sharded := base
				sharded.shard = shard
				sharded.trace = nextTrace(runID, fmt.Sprintf("%s#%d", entry, shard))

				request := baseRequest
				request.Shard = shard
				request.Trace = sharded.trace

				sharded.url = request.URL(baseURL)
				// A shared state let shards overwrite each other, hiding a
				// failing shard behind a passing one.
				sharded.state = newJobState()
				jobs = append(jobs, &sharded)
			}

			continue
		}

		request := baseRequest
		request.Trace = base.trace
		base.url = request.URL(baseURL)
		jobs = append(jobs, &base)
	}

	if opts.testPolyfillCombinations {
		var expanded []*job
		for _, j := range jobs {
			combined := *j
			combined.polyfillCombinations = true
			combined.trace = nextTrace(runID, j.name+"#combined")

			request := baseRequest
			request.Shard = j.shard
			request.PolyfillCombinations = true
			request.Trace = combined.trace

			combined.url = request.URL(baseURL)
			combined.state = newJobState()

			expanded = append(expanded, j, &combined)
		}

		jobs = expanded
	}

	// Combination runs before individual, then oldest browser first, then
	// shard. The scheduler runs the combination group as its own pass and
	// drives each browser's jobs in order, one session at a time.
	sort.SliceStable(jobs, func(i, k int) bool {
		a, b := jobs[i], jobs[k]

		if a.polyfillCombinations != b.polyfillCombinations {
			return a.polyfillCombinations
		}

		if a.name != b.name {
			return browsercmp.EntryLess(a.name, b.name)
		}

		return a.shard < b.shard
	})

	return jobs
}

// request is the base page request every job of this run shares. A job refines
// it with its shard, combination and trace.
func (o options) request() pagecontract.Request {
	return pagecontract.Request{
		Mode:     o.testMode,
		Director: o.director,
		Feature:  o.feature,
	}
}

// needsShard reports whether an entry is sharded during a full run.
func needsShard(entry string) bool {
	return entry == "ie/9.0" || entry == "ie/10.0" || strings.HasPrefix(entry, "ios/11")
}

// concurrencyFor decides how many sessions may run at once. The account plan is
// the real ceiling, and this process may not be its only user, so -concurrency
// holds back.
func concurrencyFor(ctx context.Context, gate *capacityGate, opts options) int {
	if opts.concurrencyExplicit {
		return opts.maxConcurrency
	}

	if allowance := gate.maxAllowance(ctx); allowance > 0 {
		return allowance
	}

	slog.Warn("could not read the account plan, using the default concurrency",
		"concurrency", opts.maxConcurrency)

	return opts.maxConcurrency
}

// pageLoadTimeout bounds how long the test page has to start once its request
// has arrived. Reaching it means the page was fetched and never ran, so it is
// waiting on assets rather than on the tunnel.
const pageLoadTimeout = 90 * time.Second

// arrivalGrace bounds how long a navigation is given to produce its first
// request before the session is treated as dead. Healthy navigations block for
// 1 to 24 seconds; dead ones return in under a second without issuing any.
const arrivalGrace = 8 * time.Second

// ErrNoBrowserRequest marks a session that accepted a navigation but whose
// browser never issued one. The same session never recovers, so it is replaced.
var ErrNoBrowserRequest = errors.New("the browser never issued its navigation")

// noBrowserRequestError carries what the test server did see, which is usually
// only BrowserStack's own probe of the session URL.
type noBrowserRequestError struct {
	trace string
	stats testserver.Stats

	// navigateFor is how long Navigate took to return: dead sessions return in
	// under a second, healthy ones take at least 1.7.
	navigateFor time.Duration
}

func (e *noBrowserRequestError) Error() string {
	return fmt.Sprintf(
		"the browser never issued its navigation: Navigate returned after %s without the browser having "+
			"requested anything in the following %s, and the test server only saw %d non-GET request(s) "+
			"(BrowserStack's own probe). The failure is between the remote machine and this server, "+
			"not in the page or the suite",
		e.navigateFor.Round(time.Millisecond), arrivalGrace, e.stats.Requests)
}

func (e *noBrowserRequestError) Unwrap() error {
	return ErrNoBrowserRequest
}

// bs-local.com only resolves while the tunnel is running, so the harness
// reaches the test server on this machine directly.
const testServerURL = "http://127.0.0.1:9876"

// pageLoadFailure reports why the page never started. The browser's request did
// arrive, so this is a page or asset problem, not a session one; listing what
// arrived makes the difference diagnosable.
func pageLoadFailure(ctx context.Context, client *testserver.Client, name, trace string, last pagecontract.State, expected string) error {
	described := fmt.Sprintf("%s: %s", name, last.Describe(expected))

	statsCtx, cancel := context.WithTimeout(ctx, testserver.StatsTimeout)
	defer cancel()

	stats, err := client.Stats(statsCtx, trace)
	if err != nil {
		// Keeping the browser's own description must not be skipped just
		// because the two cases cannot be told apart.
		return fmt.Errorf("%s (%s; the test server could not be asked what this job requested: %w)", described, trace, err)
	}

	return fmt.Errorf("%s (%s; the page was fetched but never started, and the browser only ever asked for %s)",
		described, trace, stats.PathsSummary())
}

// sessionLabel names a BrowserStack session so it can be matched to a test
// server log line. The trace ties the two together without the clocks having to
// agree.
func sessionLabel(batchName string, j *job, browser browserstack.Browser) string {
	platform := ""
	if browser.OS != "" {
		platform = fmt.Sprintf(" - %s %s", browser.OS, browser.OSVersion)
	}

	return fmt.Sprintf("%s: %s - %s - %s - %s%s",
		batchName, j.name, combinationName(j.polyfillCombinations), shardName(j.shard),
		j.trace, platform)
}

// combinationName labels individual versus combined runs.
func combinationName(combined bool) string {
	if combined {
		return "interop"
	}

	return "individual"
}

func shardName(shard int) string {
	if shard > 0 {
		return fmt.Sprint(shard)
	}

	return "1"
}

// writeResults records results in the shape test/polyfills/compat.js reads.
func writeResults(repo string, opts options, jobs []*job) error {
	results := map[string]map[string]map[string]*pagecontract.Summary{}

	record := func(j *job) {
		status := j.state.status()
		jobResults, replacements := status.results, status.replacements
		if jobResults == nil {
			return
		}

		if replacements > 0 {
			jobResults.SessionReplacements = replacements
		}

		key := browserua.New(browserua.FromBrowserEntry(j.name)).Normalize()

		family, version, _ := strings.Cut(key, "/")

		if results[family] == nil {
			results[family] = map[string]map[string]*pagecontract.Summary{}
		}

		if results[family][version] == nil {
			results[family][version] = map[string]*pagecontract.Summary{}
		}

		mode := string(j.testMode)

		// A sharded browser reports both shards under one family/version/mode;
		// merging keeps the first shard's suites rather than overwriting them.
		results[family][version][mode] = mergeSummaries(results[family][version][mode], jobResults)
	}

	for _, j := range jobs {
		record(j)
	}

	name := fmt.Sprintf("results-%s.json", opts.testMode)
	if opts.browserFilter != "" {
		name = fmt.Sprintf("results-%s-%s.json", opts.testMode, opts.browserFilter)
	}

	path := filepath.Join(repo, "test/polyfills", name)

	encoded, err := json.Marshal(results)
	if err != nil {
		return err
	}

	return os.WriteFile(path, encoded, 0o644)
}

// mergeSummaries folds two summaries recorded under the same browser and mode
// together, which is what a sharded browser produces: two sessions, one entry.
// The suite lists are unions, and the result is a new summary.
func mergeSummaries(a, b *pagecontract.Summary) *pagecontract.Summary {
	if a == nil {
		return b
	}

	if b == nil {
		return a
	}

	failingSuites := map[string]bool{}
	for _, suite := range a.FailingSuites {
		failingSuites[suite] = true
	}

	for _, suite := range b.FailingSuites {
		failingSuites[suite] = true
	}

	suites := make([]string, 0, len(failingSuites))
	for suite := range failingSuites {
		suites = append(suites, suite)
	}

	sort.Strings(suites)

	assets := b.Assets
	if assets == nil {
		assets = a.Assets
	}

	return &pagecontract.Summary{
		Passed:              a.Passed + b.Passed,
		Failed:              a.Failed + b.Failed,
		FailingTests:        append(append([]pagecontract.FailingTest{}, a.FailingTests...), b.FailingTests...),
		FailingSuites:       suites,
		TestedSuites:        append(append([]string{}, a.TestedSuites...), b.TestedSuites...),
		Assets:              assets,
		SessionReplacements: a.SessionReplacements + b.SessionReplacements,
	}
}

// reportFailures lists everything that failed, with a URL to reproduce it.
func reportFailures(jobs []*job, opts options) {
	origin := fmt.Sprintf("http://bs-local.com:%d", serverPort)

	fmt.Println("\nFailures:")

	for _, j := range jobs {
		status := j.state.status()
		results, err := status.results, status.err

		if results == nil || results.Failed == 0 {
			if err != nil || status.state != "complete" {
				fmt.Printf(" • %s (%s): %v\n", j.name, j.testMode, firstNonNil(err, "no results"))
			}

			continue
		}

		fmt.Printf(" - %s:\n", j.name)

		for _, test := range results.FailingTests {
			request := pagecontract.Request{
				Mode:                 opts.testMode,
				Director:             opts.director,
				Feature:              opts.feature,
				Shard:                j.shard,
				PolyfillCombinations: j.polyfillCombinations,
				Trace:                j.trace,
			}

			fmt.Printf("    -> %s\n", test.Name)
			fmt.Printf("       %s\n", request.ReproduceURL(origin, test.FailingSuite))
			fmt.Printf("       %s\n", test.Message)
		}
	}
}

func firstNonNil(err error, fallback string) string {
	if err != nil {
		return err.Error()
	}

	return fallback
}

// repoRoot locates the repository root by walking up until the test tree is
// found, so the command works both from the repo root and via go run.
func repoRoot() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}

	rel := filepath.Join("test", "polyfills", "server.js")

	for {
		if _, err := os.Stat(filepath.Join(dir, rel)); err == nil {
			return dir
		}

		parent := filepath.Dir(dir)
		if parent == dir {
			return "."
		}

		dir = parent
	}
}

// ensureTestServer waits for the JavaScript test server to become reachable. It
// polls because CI launches the server beside this process, so a single probe
// can lose the race.
func ensureTestServer(ctx context.Context, repo string, client *testserver.Client) error {
	if _, err := os.Stat(filepath.Join(repo, "test/polyfills/server.js")); err != nil {
		return fmt.Errorf("cannot find test/polyfills/server.js - run from the repository root: %w", err)
	}

	if err := client.EnsureReachable(ctx, testServerStartTimeout, testServerProbeInterval); err != nil {
		return fmt.Errorf("test server is not reachable on port %d - start it with `node ./test/polyfills/server.js &`: %w", serverPort, err)
	}

	return nil
}

// modifiedFiles resolves which files changed. MODIFIED_FILES_FILE takes
// precedence, so a privileged workflow can hand the list over. A git failure is
// reported as "no changes", which tests everything; testing more is safe.
func modifiedFiles() []string {
	if path := os.Getenv("MODIFIED_FILES_FILE"); path != "" {
		raw, err := os.ReadFile(path)
		if err != nil {
			slog.Warn("could not read MODIFIED_FILES_FILE, testing everything", "error", err)

			return nil
		}

		return splitLines(string(raw))
	}

	baseBranch := "main"
	if os.Getenv("GITHUB_ACTIONS") != "" {
		baseBranch = "upstream/main"
	}

	// exec.Command does not run a shell, so the merge base is resolved first
	// rather than passing "$(git merge-base ...)" literally.
	mergeBase := strings.TrimSpace(runGit("merge-base", "--fork-point", baseBranch))
	if mergeBase == "" {
		mergeBase = baseBranch
	}

	diff := runGit("diff", "--name-only", mergeBase)
	if diff == "" {
		slog.Warn("could not diff against the base branch, testing everything", "base", mergeBase)
	}

	return splitLines(diff)
}

// runGit runs a git command and returns its stdout, or "" on failure.
func runGit(args ...string) string {
	cmd := exec.Command("git", append([]string{"--no-pager"}, args...)...)

	output, err := cmd.Output()
	if err != nil {
		return ""
	}

	return string(output)
}

func splitLines(s string) []string {
	var out []string

	for _, line := range strings.Split(s, "\n") {
		line = strings.TrimRight(line, "\r")
		if line != "" {
			out = append(out, line)
		}
	}

	return out
}
