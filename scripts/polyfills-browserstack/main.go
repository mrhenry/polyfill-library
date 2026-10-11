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
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/Masterminds/semver/v3"
	"github.com/mrhenry/polyfill-library/scripts/browsercmp"
	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
	"github.com/mrhenry/polyfill-library/scripts/polyfillmeta"
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

	// replacementDelay is the pause before a replacement session is requested,
	// giving BrowserStack a moment to release the discarded machine. Browsers
	// with a small pool (IE 10 especially) queue the replacement otherwise.
	replacementDelay = 15 * time.Second

	// sessionReplacements bounds how many times one job discards a session that
	// accepted a navigation but never acted on it. Replacements are reported
	// for every job, so a run that leans on them stays visible.
	sessionReplacements = 3

	// testServerStartTimeout bounds how long to wait for the JavaScript test
	// server to accept connections. CI starts it beside this process, so the
	// two race.
	testServerStartTimeout = 20 * time.Second

	testServerProbeTimeout = 500 * time.Millisecond

	// testServerProbeInterval is the pause between probes while waiting for the
	// server to start.
	testServerProbeInterval = 250 * time.Millisecond
)

// mode is a test configuration, selected by a positional flag.
type mode string

const (
	modeAll      mode = "all"
	modeControl  mode = "control"
	modeTargeted mode = "targeted"
)

type options struct {
	browserFilter            string
	versionRanges            string
	modifiedOnly             bool
	testMode                 mode
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
	o := options{testMode: modeAll, testEverything: true, maxConcurrency: concurrency}

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
		case arg == string(modeAll), arg == string(modeControl), arg == string(modeTargeted):
			o.testMode = mode(arg)
		}
	}

	return o
}

// job is one browser session. The value is immutable once built; progress is
// held behind a pointer so jobs can be copied cheaply when polyfill
// combinations expand the matrix.
type job struct {
	name    string
	browser browserstack.Browser

	// preferred is the platform requested on the first session, when the
	// browser has one. Later sessions omit it so BrowserStack can pick any
	// platform, which is what makes a retry relax the preference.
	preferred    browserstack.Browser
	hasPreferred bool

	testMode             mode
	url                  string
	expectedPage         string
	trace                string
	shard                int
	polyfillCombinations bool

	state *jobState
}

// jobState is the mutable, concurrently accessed progress of one job.
type jobState struct {
	mu       sync.Mutex
	state    string
	results  *pagecontract.Summary
	progress *pagecontract.Results
	err      error
	duration time.Duration

	// replacements counts sessions discarded because their browser never issued
	// its navigation. Reported rather than dropped so the run's health stays
	// visible.
	replacements int
}

func newJobState() *jobState {
	return &jobState{state: "ready"}
}

func (s *jobState) setState(state string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.state = state
}

// summarisePaths renders the requests a job made, which is usually enough to
// show that a script never arrived.
func summarisePaths(paths []string) string {
	if len(paths) == 0 {
		return "nothing"
	}

	unique := map[string]bool{}
	order := make([]string, 0, len(paths))

	for _, path := range paths {
		if !unique[path] {
			unique[path] = true

			order = append(order, path)
		}
	}

	return strings.Join(order, ", ")
}

func plural(n int) string {
	if n == 1 {
		return ""
	}

	return "s"
}

func (s *jobState) setReplacementCount(n int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.replacements = n
}

func (s *jobState) setError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.err = err
	s.state = "error"
}

func (s *jobState) recordProgress(progress *pagecontract.Results) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.progress = progress
	s.state = "running"
}

func (s *jobState) complete(results *pagecontract.Summary, duration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.results = results
	s.duration = duration
	s.state = "complete"
}

func (s *jobState) snapshot() (state string, results *pagecontract.Summary, progress *pagecontract.Results, duration time.Duration, replacements int, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.state, s.results, s.progress, s.duration, s.replacements, s.err
}

func (s *jobState) failed() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.err != nil || s.results == nil || s.results.Failed > 0
}

// configForLog is the test configuration column in the progress output.
func (j *job) configForLog() string {
	combined := "        "
	if j.polyfillCombinations {
		combined = "combined"
	}

	shard := ""
	if j.shard > 0 {
		shard = fmt.Sprintf(" / shard %d", j.shard)
	}

	return fmt.Sprintf("%-8s / %s%s", string(j.testMode), combined, shard)
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
	if !opts.list {
		if err := ensureTestServer(runnerCtx, repo); err != nil {
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

	// The tunnel binary reports itself ready seconds before BrowserStack will
	// route a session through it, so wait for it to actually be usable.
	if err := client.WaitForTunnel(runnerCtx); err != nil {
		return err
	}

	sessionName := fmt.Sprintf("Polyfill Library: %s", runID)

	// The gate admits each session start against the account's current free
	// capacity; the local concurrency limit only bounds this process.
	gate := newCapacityGate(client)

	r := newRunner(browserstackDial(client, credentials), testServerURL, gate, sessionName)

	failed := execute(runnerCtx, r, jobs, concurrencyFor(runnerCtx, gate, opts))

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

		// A family the library does not target is a new BrowserStack family
		// that needs mapping or exclusion, not a version to skip silently.
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
			expectedPage: opts.expectedPage(),
			trace:        nextTrace(runID, entry),
			state:        newJobState(),
		}

		// Real devices need their os/os_version on every session, so they are
		// left untouched.
		if browser.Device == "" {
			if browserstack.HasPreference(entry) {
				base.preferred = browser
				base.hasPreferred = true
			}

			base.browser.OS = ""
			base.browser.OSVersion = ""
		}

		// Slow browsers are split in two when the whole suite runs, so a
		// single browser cannot monopolise the run.
		if needsShard(entry) && opts.testEverything {
			for shard := 1; shard <= 2; shard++ {
				sharded := base
				sharded.shard = shard
				sharded.trace = nextTrace(runID, fmt.Sprintf("%s#%d", entry, shard))
				sharded.url = testURL(baseURL, opts, shard, false, sharded.trace)
				// Sharing base.state let the shards overwrite each other,
				// hiding a failing shard behind a passing one.
				sharded.state = newJobState()
				jobs = append(jobs, &sharded)
			}

			continue
		}

		base.url = testURL(baseURL, opts, 0, false, base.trace)
		jobs = append(jobs, &base)
	}

	if opts.testPolyfillCombinations {
		var expanded []*job
		for _, j := range jobs {
			combined := *j
			combined.polyfillCombinations = true
			combined.trace = nextTrace(runID, j.name+"#combined")
			combined.url = testURL(baseURL, opts, j.shard, true, combined.trace)
			combined.state = newJobState()

			expanded = append(expanded, j, &combined)
		}

		jobs = expanded
	}

	// Individual runs before combined ones, then by shard, then oldest browser
	// first.
	sort.SliceStable(jobs, func(i, k int) bool {
		a, b := jobs[i], jobs[k]

		if a.polyfillCombinations != b.polyfillCombinations {
			return !a.polyfillCombinations
		}

		as, bs := a.shard, b.shard
		if as == 0 {
			as = 1
		}

		if bs == 0 {
			bs = 1
		}

		if as != bs {
			return as < bs
		}

		return browsercmp.EntryLess(a.name, b.name)
	})

	return jobs
}

// needsShard reports whether an entry is sharded during a full run.
func needsShard(entry string) bool {
	return entry == "ie/9.0" || entry == "ie/10.0" || strings.HasPrefix(entry, "ios/11")
}

// browserFor returns the platform for a session, relaxing the pinned one after
// the first attempt so a retry can land on any platform.
func (j *job) browserFor(sessionIndex int) browserstack.Browser {
	if sessionIndex == 0 && j.hasPreferred {
		return j.preferred
	}

	return j.browser
}

// testURL builds the URL a browser loads.
func testURL(baseURL string, opts options, shard int, polyfillCombinations bool, trace string) string {
	path := "/test"
	if opts.director {
		path = "/"
	}

	values := url.Values{}
	values.Set("includePolyfills", includePolyfillsFor(opts.testMode))
	values.Set("always", alwaysFor(opts.testMode))

	if opts.feature != "" {
		values.Set("feature", opts.feature)
	}

	if polyfillCombinations {
		values.Set("polyfillCombinations", "yes")
	}

	if shard > 0 {
		values.Set("shard", fmt.Sprint(shard))
	}

	// Carried through to every sub-resource the page requests, so each request
	// in the test server log can be attributed to this job.
	if trace != "" {
		values.Set("trace", trace)
	}

	return baseURL + path + "?" + values.Encode()
}

func includePolyfillsFor(m mode) string {
	if m == modeControl {
		return "no"
	}

	return "yes"
}

func alwaysFor(m mode) string {
	if m == modeAll || m == modeControl {
		return "yes"
	}

	return "no"
}

// concurrencyFor decides how many sessions may run at once.
//
// The account plan's parallel allowance is the real ceiling, and this process is
// not necessarily its only user, so -concurrency is the way to hold back.
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

// execute runs every job, at most concurrency at a time, and never runs two
// sessions for the same browser at once.
func execute(ctx context.Context, r *runner, jobs []*job, maxConcurrency int) int {
	if maxConcurrency < 1 {
		maxConcurrency = 1
	}

	ticker := time.NewTicker(pollTick)

	stopProgress := make(chan struct{})
	progressDone := make(chan struct{})

	printer := &progressPrinter{}

	go func() {
		defer close(progressDone)

		for {
			select {
			case <-ticker.C:
				printer.print(jobs)
			case <-stopProgress:
				return
			case <-ctx.Done():
				return
			}
		}
	}()

	var (
		sem    = make(chan struct{}, maxConcurrency)
		slots  = &browserSlots{inflight: map[string]bool{}}
		wg     sync.WaitGroup
		failed int
	)

	for _, j := range jobs {
		wg.Add(1)

		go func(j *job) {
			defer wg.Done()

			// Claim the per-browser slot before the concurrency slot, so a job
			// waiting behind another session of the same browser does not hold a
			// global slot that a different browser could be using.
			if !slots.acquire(ctx, j.name) {
				return
			}

			defer slots.release(j.name)

			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				return
			}

			r.runJob(ctx, j)
		}(j)
	}

	wg.Wait()

	ticker.Stop()
	close(stopProgress)

	<-progressDone

	printer.print(jobs)

	for _, j := range jobs {
		if j.state.failed() {
			failed++
		}
	}

	return failed
}

// browserSlots serialises work per browser so a single browser is never
// driven by two sessions at once.
type browserSlots struct {
	mu       sync.Mutex
	inflight map[string]bool
}

// acquire claims the slot for name, blocking until it is free. It reports
// whether the slot was claimed: a cancelled context returns false so the
// caller does not release a slot it never held.
func (s *browserSlots) acquire(ctx context.Context, name string) bool {
	for {
		s.mu.Lock()
		if !s.inflight[name] {
			s.inflight[name] = true
			s.mu.Unlock()

			return true
		}
		s.mu.Unlock()

		select {
		case <-ctx.Done():
			return false
		case <-time.After(time.Second):
		}
	}
}

func (s *browserSlots) release(name string) {
	s.mu.Lock()
	delete(s.inflight, name)
	s.mu.Unlock()
}

// expectedPage names the page identity the harness asked for.
func (o options) expectedPage() string {
	if o.director {
		return "director"
	}

	return "runner"
}

// pageLoadTimeout bounds how long the test page has to start, once its request
// has arrived. Reaching it means the page was fetched and never ran, so it is
// waiting on assets rather than on the tunnel. The oldest browsers load the
// full suite slowly, so this stays generous.
const pageLoadTimeout = 90 * time.Second

// traceStatsTimeout bounds the question asked of the test server, a local
// process that either answers immediately or is gone.
const traceStatsTimeout = 5 * time.Second

// arrivalGrace bounds how long a navigation is given to produce its first
// request before the session is treated as dead.
//
// Healthy navigations block for 1 to 24 seconds; dead ones return in under a
// second without issuing any. Measured across 50 sessions, 8s misclassified
// none of the 42 healthy ones.
const arrivalGrace = 8 * time.Second

// serverClient talks to the test server running on this machine.
var serverClient = &http.Client{Timeout: traceStatsTimeout}

// traceStats is what the test server recorded for one job.
type traceStats struct {
	Requests int `json:"requests"`
	// Gets counts only the browser's own requests. BrowserStack probes the
	// session URL with a HEAD carrying the same trace, so Requests alone cannot
	// distinguish "never navigated" from "navigated".
	Gets  int      `json:"gets"`
	Paths []string `json:"paths"`
}

// inspectTraceParam is how the harness asks the test server about a trace. It is
// deliberately not the parameter browsers send, so a poll is never recorded as
// one of the requests it is measuring.
const inspectTraceParam = "inspect-trace"

// ErrNoBrowserRequest marks a session that accepted a navigation but whose
// browser never issued one. The same session never recovers, so it is replaced.
var ErrNoBrowserRequest = errors.New("the browser never issued its navigation")

// noBrowserRequestError carries what the test server did see, which is usually
// only BrowserStack's own probe of the session URL.
type noBrowserRequestError struct {
	trace string
	stats traceStats

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

// waitForFirstRequest reports whether the browser's own request reached the
// test server.
//
// A session can look healthy while its browser has issued nothing, and nothing
// in the session can tell the difference. Only the browser's GETs carry a trace
// that came from a navigation, which is why this waits for a GET rather than
// any request.
func waitForFirstRequest(ctx context.Context, baseURL, trace string, budget time.Duration) (traceStats, bool, error) {
	deadline := time.Now().Add(budget)

	for {
		stats, err := fetchTraceStats(ctx, baseURL, trace)
		if err != nil {
			return stats, false, err
		}

		if stats.Gets > 0 {
			return stats, true, nil
		}

		if time.Now().After(deadline) {
			return stats, false, nil
		}

		select {
		case <-ctx.Done():
			return stats, false, ctx.Err()
		case <-time.After(200 * time.Millisecond):
		}
	}
}

// bs-local.com only resolves while the tunnel is running, so the harness
// reaches the test server on this machine directly.
const testServerURL = "http://127.0.0.1:9876"

// fetchTraceStats asks the test server what a trace requested. It is the only
// witness to whether a navigation arrived at all.
func fetchTraceStats(ctx context.Context, baseURL, trace string) (traceStats, error) {
	var stats traceStats

	target := fmt.Sprintf("%s/__trace-stats?%s=%s",
		baseURL, inspectTraceParam, url.QueryEscape(trace))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return stats, err
	}

	res, err := serverClient.Do(req)
	if err != nil {
		return stats, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return stats, fmt.Errorf("trace stats returned %d", res.StatusCode)
	}

	if err := json.NewDecoder(res.Body).Decode(&stats); err != nil {
		return stats, err
	}

	return stats, nil
}

// pageLoadFailure reports why the page never started.
//
// Reaching here means the browser's request did arrive, so this is always a
// page that was fetched but never ran: a page or asset problem rather than a
// session one. Listing what arrived makes the difference diagnosable.
func pageLoadFailure(name, trace string, last pagecontract.State, expected, baseURL string) error {
	described := fmt.Sprintf("%s: %s", name, last.Describe(expected))

	ctx, cancel := context.WithTimeout(context.Background(), traceStatsTimeout)
	defer cancel()

	stats, err := fetchTraceStats(ctx, baseURL, trace)
	if err != nil {
		// Not being able to tell the two cases apart must not hide the
		// original failure, so the browser's own description is kept.
		return fmt.Errorf("%s (%s; the test server could not be asked what this job requested: %w)", described, trace, err)
	}

	return fmt.Errorf("%s (%s; the page was fetched but never started, and the browser only ever asked for %s)",
		described, trace, summarisePaths(stats.Paths))
}

// sessionLabel names a BrowserStack session so it can be matched to a line in
// the test server log. The trace ties the two together without depending on the
// two clocks agreeing, and the platform is shown when one is requested.
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

// progressPrinter renders the job board, remembering the last block printed so
// a run of several hundred jobs polling every second does not reprint an
// unchanged screenful.
type progressPrinter struct {
	last string
}

func (p *progressPrinter) print(jobs []*job) {
	lines := []string{strings.Repeat("-", 80)}

	queued := 0

	for _, j := range jobs {
		state, results, progress, duration, replacements, err := j.state.snapshot()

		message := ""

		switch state {
		case "complete":
			if results != nil && results.Failed > 0 {
				message = fmt.Sprintf("✘ %d tests, %d failures", results.Passed+results.Failed, results.Failed)
			} else if results != nil {
				message = fmt.Sprintf("✓ %d tests", results.Passed)
			}

			if duration > 0 {
				message += fmt.Sprintf("  %d seconds to complete", int(duration.Seconds()))
			}

			if replacements > 0 {
				message += fmt.Sprintf("  (%d session%s replaced)", replacements, plural(replacements))
			}
		case "error":
			message = fmt.Sprintf("⚠️  %v [trace %s]", err, j.trace)
		case "ready":
			queued++
		case "running":
			if progress != nil {
				message = fmt.Sprintf("%d/%d", progress.RunnerCompletedCount, progress.RunnerCount)
			}
		default:
			message = state
		}

		if message != "" {
			lines = append(lines, fmt.Sprintf(" • Browser: %-15s Test config: %-32s %s",
				j.name, j.configForLog(), message))
		}
	}

	if queued > 0 {
		lines = append(lines, fmt.Sprintf(" + %d job(s) queued", queued))
	}

	out := strings.Join(lines, "\n") + "\n"
	if out == p.last {
		return
	}

	p.last = out

	fmt.Print(out)
}

// writeResults records results in the shape test/polyfills/compat.js reads.
func writeResults(repo string, opts options, jobs []*job) error {
	results := map[string]map[string]map[string]*pagecontract.Summary{}

	record := func(j *job) {
		_, jobResults, _, _, replacements, _ := j.state.snapshot()
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

		// A sharded browser reports both shards under one family/version/mode,
		// so they are merged rather than overwritten; otherwise the first
		// shard's suites would be lost from the results file.
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
//
// The result is a new summary, and the suite lists are unions.
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
	baseURL := fmt.Sprintf("http://bs-local.com:%d/test", serverPort)

	fmt.Println("\nFailures:")

	for _, j := range jobs {
		state, results, _, _, _, err := j.state.snapshot()

		if results == nil || results.Failed == 0 {
			if err != nil || state != "complete" {
				fmt.Printf(" • %s (%s): %v\n", j.name, j.testMode, firstNonNil(err, "no results"))
			}

			continue
		}

		fmt.Printf(" - %s:\n", j.name)

		for _, test := range results.FailingTests {
			values := url.Values{}
			values.Set("includePolyfills", includePolyfillsFor(opts.testMode))
			values.Set("always", alwaysFor(opts.testMode))
			values.Set("feature", test.FailingSuite)

			fmt.Printf("    -> %s\n", test.Name)
			fmt.Printf("       %s?%s\n", baseURL, values.Encode())
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

// ensureTestServer waits for the JavaScript test server to become reachable.
//
// It polls rather than probing once because CI launches the server in the
// background beside this process, so a single probe can lose the race.
func ensureTestServer(ctx context.Context, repo string) error {
	if _, err := os.Stat(filepath.Join(repo, "test/polyfills/server.js")); err != nil {
		return fmt.Errorf("cannot find test/polyfills/server.js - run from the repository root: %w", err)
	}

	target := testServerURL + "/test?includePolyfills=yes&always=no"

	deadline := time.Now().Add(testServerStartTimeout)

	var lastErr error

	for {
		probeCtx, cancel := context.WithTimeout(ctx, testServerProbeTimeout)
		lastErr = probeTestServer(probeCtx, target)
		cancel()

		if lastErr == nil {
			return nil
		}

		if time.Now().After(deadline) {
			return fmt.Errorf("test server is not reachable on port %d - start it with `node ./test/polyfills/server.js &`: %w", serverPort, lastErr)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(testServerProbeInterval):
		}
	}
}

// probeTestServer makes one reachability request against the test server.
func probeTestServer(ctx context.Context, target string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return err
	}

	res, err := serverClient.Do(req)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("test server returned %d for %s", res.StatusCode, target)
	}

	return nil
}

// modifiedFiles resolves which files changed.
//
// MODIFIED_FILES_FILE takes precedence, so a privileged workflow can hand the
// list over from an unprivileged build job.
//
// A git failure is not fatal: the result is reported as "no changes", which
// makes the run test everything. Testing more is safe.
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

	// The merge base has to be resolved first: exec.Command does not run a
	// shell, so "$(git merge-base ...)" would be passed through literally.
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
