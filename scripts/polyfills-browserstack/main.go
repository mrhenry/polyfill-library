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
	"log"
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
	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/polyfillmeta"
)

const (
	// serverPort is the port test/polyfills/server.js listens on.
	serverPort = 9876

	projectName = "polyfill-library"

	// concurrency is how many BrowserStack sessions run at once. Four matches
	// BrowserStack's default Automate parallel allowance.
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

// mode is a test configuration, matching the JavaScript harness' mode flags.
type mode string

const (
	modeAll      mode = "all"
	modeControl  mode = "control"
	modeTargeted mode = "targeted"
)

// options mirrors the JavaScript harness' argv contract so the CI workflow
// needs as little change as possible.
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

// parseArgs reads the same positional flags the JavaScript harness accepted,
// plus -list for a dry run and -concurrency to change the session limit.
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

// pageResults mirrors the object the test page writes to
// window.global_test_results and window.global_test_progress.
type pageResults struct {
	State                string          `json:"state"`
	Passed               int             `json:"passed"`
	Failed               int             `json:"failed"`
	Total                int             `json:"total"`
	Tests                []failingTest   `json:"tests"`
	FailingSuites        map[string]bool `json:"failingSuites"`
	TestedSuites         []string        `json:"testedSuites"`
	RunnerCompletedCount int             `json:"runnerCompletedCount"`
	RunnerCount          int             `json:"runnerCount"`

	// Assets is the page's record of which scripts loaded or failed.
	Assets map[string]any `json:"assets"`
}

type failingTest struct {
	Name         string `json:"name"`
	Result       bool   `json:"result"`
	Message      string `json:"message"`
	Stack        string `json:"stack"`
	FailingSuite string `json:"failingSuite"`
}

// testSummary is the shape written to the results file.
type testSummary struct {
	Passed        int           `json:"passed"`
	Failed        int           `json:"failed"`
	FailingTests  []failingTest `json:"failingTests"`
	FailingSuites []string      `json:"failingSuites"`
	TestedSuites  []string      `json:"testedSuites"`

	// Assets is the page's own record of which scripts loaded or failed.
	Assets map[string]any `json:"assets,omitempty"`

	// SessionReplacements counts sessions this job discarded because their
	// browser never issued its navigation. Omitted when zero.
	SessionReplacements int `json:"sessionReplacements,omitempty"`
}

func (r *pageResults) summary() *testSummary {
	failingSuites := make([]string, 0, len(r.FailingSuites))
	for suite := range r.FailingSuites {
		failingSuites = append(failingSuites, suite)
	}

	sort.Strings(failingSuites)

	if r.Tests == nil {
		r.Tests = []failingTest{}
	}

	return &testSummary{
		Passed:        r.Passed,
		Failed:        r.Failed,
		FailingTests:  r.Tests,
		FailingSuites: failingSuites,
		TestedSuites:  r.TestedSuites,
		Assets:        r.Assets,
	}
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
	results  *testSummary
	failure  *pageResults
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

func (s *jobState) recordProgress(progress *pageResults) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.failure = progress
	s.state = "running"
}

func (s *jobState) complete(results *testSummary, duration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.results = results
	s.duration = duration
	s.state = "complete"
}

func (s *jobState) snapshot() (state string, results *testSummary, failure *pageResults, err error, duration time.Duration, replacements int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.state, s.results, s.failure, s.err, s.duration, s.replacements
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
		log.Println("error:", err)
		os.Exit(1)
	}
}

func run(opts options) error {
	repo := repoRoot()

	// The whole run is bounded by the CI job timeout; this context only carries
	// interruption.
	runnerCtx, stopSignals := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stopSignals()

	if err := ensureTestServer(runnerCtx, repo); err != nil && !opts.list {
		return err
	}

	credentials := browserstack.Credentials{
		UserName:  os.Getenv("BROWSERSTACK_USERNAME"),
		AccessKey: os.Getenv("BROWSERSTACK_ACCESS_KEY"),
	}
	if !credentials.Valid() {
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
			names := make([]string, 0, len(modified.AffectedPolyfills))
			for name := range modified.AffectedPolyfills {
				names = append(names, name)
			}

			sort.Strings(names)

			opts.feature = strings.Join(names, ",")
		}

		log.Printf("polyfills under test : %d (testEverything=%t)", len(names(opts.feature)), opts.testEverything)
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
		log.Println("nothing to test")
		return nil
	}

	log.Printf("browsers (%d): %s", len(entries), strings.Join(entries, ", "))

	if opts.list {
		return nil
	}

	runID := newRunID()
	log.Printf("run id : %s (appears as trace=<run><seq>-<browser> in the test server log)", runID)

	jobs := buildJobs(entries, browserstack.NewIndex(stackList.Browsers), opts, runID)
	if len(jobs) == 0 {
		log.Println("nothing to test")
		return nil
	}

	client := browserstack.New(browserstack.Config{Credentials: credentials})

	closeTunnel, err := client.OpenTunnel(runnerCtx)

	defer closeTunnel()

	if err != nil {
		return err
	}

	log.Println("tunnel ready")

	// The tunnel binary reports itself ready seconds before BrowserStack will
	// route a session through it, so wait for it to actually be usable.
	if err := client.WaitForTunnel(runnerCtx); err != nil {
		return err
	}

	sessionName := fmt.Sprintf("Polyfill Library: %s", runID)

	// The gate admits each session start against the account's current free
	// capacity; the local concurrency limit only bounds this process.
	gate := newCapacityGate(client)
	failed := execute(runnerCtx, client, credentials, jobs, sessionName, gate, concurrencyFor(runnerCtx, gate, opts))

	if err := writeResults(repo, opts, jobs); err != nil {
		log.Println("writing results:", err)
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

// selectBrowsers applies the browser filter and the polyfill gating, in the
// same order as the JavaScript harness.
func selectBrowsers(all []string, opts options, affected []*polyfillmeta.Meta) []string {
	var out []string

	for _, entry := range all {
		if !matchesBrowserFilter(entry, opts) {
			continue
		}

		// A family the library does not target is a new BrowserStack family
		// that needs mapping or exclusion, not a version to skip silently.
		if !browserua.KnownEntry(entry) {
			log.Printf("skipping %s : browser family %q is not targeted by the polyfill library", entry, browserua.FamilyOf(entry))

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

	coerced, err := semver.NewVersion(coerce(version))
	if err != nil {
		return false
	}

	constraint, err := semver.NewConstraint(opts.versionRanges)
	if err != nil {
		return false
	}

	return constraint.Check(coerced)
}

// coerce turns "32.0" or "13" into a semver version, as semver.coerce does.
func coerce(version string) string {
	parts := strings.SplitN(version, ".", 3)

	out := make([]string, 0, 3)

	for _, part := range parts {
		digits := leadingDigits(part)
		if digits == "" {
			break
		}

		out = append(out, digits)
	}

	for len(out) < 3 {
		out = append(out, "0")
	}

	return strings.Join(out, ".")
}

func leadingDigits(s string) string {
	end := 0
	for end < len(s) && s[end] >= '0' && s[end] <= '9' {
		end++
	}

	return s[:end]
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

	var jobs []*job

	for _, entry := range entries {
		browser, ok := index.Lookup(entry)
		if !ok {
			log.Printf("skipping %s : not found in browserstackBrowsers.toml", entry)
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

		// A desktop platform is only requested on the first session, and only
		// when the entry pins one. Real devices need their os/os_version on
		// every session, so they are left untouched.
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
				// Each shard is a separate session and needs its own progress,
				// results and error; sharing base.state let them overwrite each
				// other, hiding a failing shard behind a passing one.
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

	// Individual runs before combined ones, then by shard, then by name.
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

		return a.name < b.name
	})

	return jobs
}

// needsShard reports whether an entry is sharded during a full run.
func needsShard(entry string) bool {
	return entry == "ie/8.0" || entry == "ie/9.0" || entry == "ie/10.0" || strings.HasPrefix(entry, "ios/11")
}

// browserFor returns the platform for a session. The pinned platform is only
// requested on the first session; later sessions omit it so BrowserStack can
// place the browser on any platform.
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
// The account plan's parallel allowance is the real ceiling, and this process
// is not necessarily its only user. Leaving one slot free turns the most common
// cause of a queued session start into spare capacity instead of a timeout. An
// explicit -concurrency is respected as-is.
func concurrencyFor(ctx context.Context, gate *capacityGate, opts options) int {
	if opts.concurrencyExplicit {
		return opts.maxConcurrency
	}

	allowance := gate.maxAllowance(ctx)
	if allowance == 0 {
		log.Printf("could not read the account plan, using concurrency %d", opts.maxConcurrency)

		return opts.maxConcurrency
	}

	if opts.maxConcurrency <= allowance {
		return opts.maxConcurrency
	}

	log.Printf("account allows %d parallel sessions, capping concurrency at %d", allowance+gate.headroom, allowance)

	return allowance
}

// execute runs every job, at most concurrency at a time, and never runs two
// sessions for the same browser at once.
func execute(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, jobs []*job, sessionName string, gate *capacityGate, maxConcurrency int) int {
	if maxConcurrency < 1 {
		maxConcurrency = 1
	}

	ticker := time.NewTicker(pollTick)

	stopProgress := make(chan struct{})
	progressDone := make(chan struct{})

	go func() {
		defer close(progressDone)

		for {
			select {
			case <-ticker.C:
				printProgress(jobs)
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

			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				return
			}

			slots.acquire(ctx, j.name)
			defer slots.release(j.name)

			runJob(ctx, client, credentials, j, sessionName, gate)
		}(j)
	}

	wg.Wait()

	ticker.Stop()
	close(stopProgress)

	<-progressDone

	printProgress(jobs)

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

func (s *browserSlots) acquire(ctx context.Context, name string) {
	for {
		s.mu.Lock()
		if !s.inflight[name] {
			s.inflight[name] = true
			s.mu.Unlock()

			return
		}
		s.mu.Unlock()

		select {
		case <-ctx.Done():
			return
		case <-time.After(time.Second):
		}
	}
}

func (s *browserSlots) release(name string) {
	s.mu.Lock()
	delete(s.inflight, name)
	s.mu.Unlock()
}

// action is what runJob should do after an attempt fails.
type action int

const (
	// actionFail gives up and records the error.
	actionFail action = iota
	// actionRetryStart retries the whole attempt after a pause.
	actionRetryStart
	// actionReplaceSession discards the session and starts again immediately.
	actionReplaceSession
)

// nextAction decides how to recover from a failed attempt.
//
// A session whose browser never issued its navigation, whose renderer crashed,
// or that stopped answering is not usable again, so it is replaced rather than
// retried. A session that could not start is usually a tunnel still
// registering, and is worth waiting out.
func nextAction(err error, replacements int) action {
	switch {
	case errors.Is(err, ErrNoBrowserRequest),
		errors.Is(err, browserstack.ErrPageCrash),
		errors.Is(err, browserstack.ErrCommandTimeout):
		if replacements >= sessionReplacements {
			return actionFail
		}

		return actionReplaceSession
	case browserstack.IsSessionStartFailure(err):
		return actionRetryStart
	default:
		return actionFail
	}
}

// runJob drives one browser to completion.
func runJob(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, j *job, batchName string, gate *capacityGate) {
	var lastErr error

	replacements := 0
	sessions := 0

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		if ctx.Err() != nil {
			return
		}

		if attempt > 1 {
			j.state.setState(fmt.Sprintf("retrying browser -- attempt %d", attempt))

			select {
			case <-ctx.Done():
				return
			case <-time.After(retryDelay):
			}
		}

		lastErr = runJobOnce(ctx, client, credentials, j, batchName, gate, sessions)
		sessions++

		if lastErr == nil {
			return
		}

		switch nextAction(lastErr, replacements) {
		case actionFail:
			if browserstack.IsSessionStartFailure(lastErr) {
				log.Printf("%s: %v", j.name, lastErr)
			}

			j.state.setError(lastErr)

			return

		case actionRetryStart:
			log.Printf("%s: %v", j.name, lastErr)

		case actionReplaceSession:
			replacements++

			j.state.setReplacementCount(replacements)
			j.state.setState("session unusable, replacing it")

			log.Printf("%s: %v (replacing the session)", j.name, lastErr)

			// Give BrowserStack a moment to release the discarded machine;
			// otherwise browsers with a small pool queue the replacement and
			// that queue becomes a start timeout.
			select {
			case <-ctx.Done():
				return
			case <-time.After(replacementDelay):
			}

			// A replacement is the same job, not one of three goes at it.
			attempt--
		}
	}

	j.state.setError(lastErr)
}

func runJobOnce(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, j *job, batchName string, gate *capacityGate, sessionIndex int) error {
	j.state.setState("waiting for account capacity")

	// Hold the session back while the account has no free parallel slot, rather
	// than requesting one that will queue and time out.
	if err := gate.wait(ctx); err != nil {
		return err
	}

	j.state.setState("connecting to browser")

	sessionCtx, cancelSession := context.WithTimeout(ctx, sessionStartTimeout)

	browser := j.browserFor(sessionIndex)

	sessionName := sessionLabel(batchName, j, browser)

	caps := browserstack.CapabilitiesFor(
		browser,
		sessionName,
		projectName,
		// One tunnel per process, so no local identifier is needed.
		"",
	)

	session, err := browserstack.NewSession(sessionCtx, client.HTTPClient(), browserstack.Hub(), caps, credentials)
	cancelSession()

	if err != nil {
		gate.release()

		// Tagged so the retry policy knows this is a session start, however it
		// failed, rather than a broken page or suite.
		return fmt.Errorf("%w: %w", browserstack.ErrSessionStart, err)
	}

	// Always release the BrowserStack session, even when a later step fails,
	// and free the reserved capacity once it is gone.
	defer func() {
		deleteCtx, cancelDelete := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
		defer cancelDelete()

		if err := session.Delete(deleteCtx); err != nil {
			log.Printf("%s: deleting session: %v", j.name, err)
		}

		gate.release()
	}()

	j.state.setState("initializing browser")

	navigatedAt := time.Now()

	if err := session.Navigate(ctx, j.url); err != nil {
		return err
	}

	navigateFor := time.Since(navigatedAt)

	// Establish that the browser actually asked for something before spending
	// the page load budget waiting for a page that was never requested.
	stats, arrived, err := waitForFirstRequest(ctx, testServerURL(), j.trace, arrivalGrace)
	if err != nil {
		return fmt.Errorf("%s: asking the test server what this job requested: %w", j.name, err)
	}

	if !arrived {
		return &noBrowserRequestError{trace: j.trace, stats: stats, navigateFor: navigateFor}
	}

	// Fail fast when the page never arrives, or is not the page requested.
	// Polling for results alone cannot tell "still running" from "never
	// loaded", and sniffing for globals cannot tell the director page from the
	// runner page because the director keeps mocha inside an iframe.
	if err := waitForPageLoad(ctx, session, j, j.expectedPage); err != nil {
		return err
	}

	j.state.setState("polling for results")

	return pollForResults(ctx, session, j)
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
// Healthy navigations block for 1 to 24 seconds and their requests are already
// recorded by the time Navigate returns; dead ones return in under a second
// without issuing any. Measured across 50 sessions, 8s misclassified none of
// the 42 healthy ones.
const arrivalGrace = 8 * time.Second

// serverClient talks to the test server running on this machine.
var serverClient = &http.Client{Timeout: traceStatsTimeout}

// pageState is the readiness contract the test pages publish, as read back
// over the WebDriver execute command.
type pageState struct {
	// Page is the identity the page declares: "director" or "runner".
	Page string
	// Started is true once the page has begun its work.
	Started bool

	ReadyState   string
	Href         string
	Title        string
	SuiteSize    *int
	ExpectedRuns *int

	// Assets is the page's own record of which scripts loaded, failed to load,
	// and threw while evaluating.
	Assets map[string]any
}

// check decides whether the page has started, and reports a mismatch between
// the page served and the page requested.
//
// The pages declare their own identity because the director page keeps mocha
// inside an iframe, so `typeof mocha` is always "undefined" there.
func (p pageState) check(expected string) (bool, error) {
	// A page that declares itself as something else means the harness is
	// driving the wrong page, so fail rather than waiting out the timeout.
	if p.Page != "" && p.Page != expected {
		return false, fmt.Errorf(
			"loaded the %q page but the %q page was requested : harness and test page disagree",
			p.Page, expected)
	}

	return p.Page == expected && p.Started, nil
}

// describe renders the state for an error message, including the page's own
// asset diagnostics so a failure names what broke.
func (p pageState) describe(expected string) string {
	return fmt.Sprintf(
		"the %q page never started (readyState=%q, page=%q, started=%t, url=%q, title=%q)%s",
		expected, p.ReadyState, p.Page, p.Started, p.Href, p.Title, describeAssets(p.Assets))
}

func parsePageState(value any) pageState {
	fields, _ := value.(map[string]any)

	state := pageState{}

	state.Page, _ = fields["page"].(string)
	state.Started, _ = fields["started"].(bool)
	state.ReadyState, _ = fields["readyState"].(string)
	state.Href, _ = fields["href"].(string)
	state.Title, _ = fields["title"].(string)

	if n, ok := fields["suiteSize"].(float64); ok {
		size := int(n)
		state.SuiteSize = &size
	}

	if n, ok := fields["expectedRuns"].(float64); ok {
		runs := int(n)
		state.ExpectedRuns = &runs
	}

	if a, ok := fields["assets"].(map[string]any); ok {
		state.Assets = a
	}

	return state
}

// waitForPageLoad polls until the test page has declared its identity and
// started.
func waitForPageLoad(ctx context.Context, session *browserstack.Session, j *job, expected string) error {
	deadline := time.Now().Add(pageLoadTimeout)

	var last pageState

	for {
		value, err := session.ExecuteScript(ctx, pageStateScript, nil)
		if err != nil {
			return err
		}

		last = parsePageState(value)

		ready, err := last.check(expected)
		if err != nil {
			return fmt.Errorf("%s: %w", j.name, err)
		}

		if ready {
			j.state.setState("page loaded")

			return nil
		}

		if time.Now().After(deadline) {
			return j.pageLoadFailure(last, expected)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

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

// testServerURL addresses the test server on this machine directly.
// bs-local.com only resolves while the tunnel is running.
func testServerURL() string {
	return fmt.Sprintf("http://127.0.0.1:%d", serverPort)
}

// fetchTraceStats asks the test server what a trace requested. It is the only
// witness to whether a navigation arrived at all.
func fetchTraceStats(ctx context.Context, baseURL, trace string) (traceStats, error) {
	var stats traceStats

	// Address this machine directly rather than bs-local.com, which only
	// resolves while the tunnel is running.
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
func (j *job) pageLoadFailure(last pageState, expected string) error {
	return pageLoadFailure(j.name, j.trace, last, expected, fmt.Sprintf("http://127.0.0.1:%d", serverPort))
}

func pageLoadFailure(name, trace string, last pageState, expected, baseURL string) error {
	described := fmt.Sprintf("%s: %s", name, last.describe(expected))

	ctx, cancel := context.WithTimeout(context.Background(), traceStatsTimeout)
	defer cancel()

	stats, err := fetchTraceStats(ctx, baseURL, trace)
	if err != nil {
		// Not being able to tell the two cases apart must not hide the
		// original failure, so the browser's own description is kept.
		return fmt.Errorf("%s (%s; the test server could not be asked what this job requested: %v)", described, trace, err)
	}

	return fmt.Errorf("%s (%s; the page was fetched but never started, and the browser only ever asked for %s)",
		described, trace, summarisePaths(stats.Paths))
}

func (p pageState) String() string {
	suite := "n/a"
	if p.SuiteSize != nil {
		suite = fmt.Sprint(*p.SuiteSize)
	}

	runs := "n/a"
	if p.ExpectedRuns != nil {
		runs = fmt.Sprint(*p.ExpectedRuns)
	}

	return fmt.Sprintf("page %q ready (suite size %s, expected runs %s, assets %s)",
		p.Page, suite, runs, describeAssets(p.Assets))
}

// describeAssets renders the page's own diagnostics, so a failure names the
// asset that broke instead of only saying the page stalled.
func describeAssets(assets map[string]any) string {
	if assets == nil {
		return ""
	}

	parts := []string{}

	if failed, ok := assets["failed"].([]any); ok && len(failed) > 0 {
		parts = append(parts, "assets that failed to load: "+joinAny(failed))
	}

	if errs, ok := assets["errors"].([]any); ok && len(errs) > 0 {
		parts = append(parts, "script errors: "+joinAny(errs))
	}

	if loaded, ok := assets["loaded"].([]any); ok && len(loaded) > 0 {
		parts = append(parts, "assets that loaded: "+joinAny(loaded))
	}

	if len(parts) == 0 {
		return ""
	}

	return " ; " + strings.Join(parts, " ; ")
}

func joinAny(values []any) string {
	out := make([]string, 0, len(values))
	for _, v := range values {
		out = append(out, fmt.Sprint(v))
	}

	return strings.Join(out, ", ")
}

// pageStateScript reads the contract the test pages publish. Every field it
// touches is written by test-runner.handlebars or test-director.handlebars, so
// a rename there fails here rather than silently reading undefined.
const pageStateScript = `
	return {
		page: typeof window.global_test_page === 'string' ? window.global_test_page : null,
		started: window.global_test_started === true,
		suiteSize: typeof window.global_test_suite_size === 'number' ? window.global_test_suite_size : null,
		expectedRuns: typeof window.global_test_expected_runs === 'number' ? window.global_test_expected_runs : null,
		readyState: document.readyState,
		href: String(document.location ? document.location.href : ''),
		title: String(document.title || ''),
		assets: window.global_test_assets || null
	};`

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

// pollProgressScript reads whichever result object the page has published.
const pollProgressScript = `return window.global_test_results || window.global_test_progress;`

func pollForResults(ctx context.Context, session *browserstack.Session, j *job) error {
	startedAt := time.Now()
	lastUpdatedAt := startedAt

	var lastSeen int

	for {
		value, err := session.ExecuteScript(ctx, pollProgressScript, nil)
		if err != nil {
			return err
		}

		if value != nil {
			raw, err := json.Marshal(value)
			if err != nil {
				return err
			}

			progress := &pageResults{}
			if err := json.Unmarshal(raw, progress); err != nil {
				return fmt.Errorf("parsing page results: %w", err)
			}

			switch progress.State {
			case "complete":
				j.state.complete(progress.summary(), time.Since(startedAt))

				return nil

			case "running":
				if progress.RunnerCompletedCount != lastSeen {
					lastSeen = progress.RunnerCompletedCount
					lastUpdatedAt = time.Now()

					j.state.recordProgress(progress)
				}
			}
		}

		// Only a run that stops making progress counts as a timeout, so a slow
		// but progressing browser is not killed.
		if time.Since(lastUpdatedAt) > testBrowserTimeout {
			current, _, _, _, _, _ := j.state.snapshot()
			timedOut := fmt.Errorf("timed out at %q on %q", current, j.name)
			j.state.setError(timedOut)

			return timedOut
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

func printProgress(jobs []*job) {
	lines := []string{strings.Repeat("-", 80)}

	queued := 0

	for _, j := range jobs {
		state, results, failure, err, duration, replacements := j.state.snapshot()

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
			if failure != nil {
				message = fmt.Sprintf("%d/%d", failure.RunnerCompletedCount, failure.RunnerCount)
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

	fmt.Print(strings.Join(lines, "\n") + "\n")
}

// writeResults records results in the same shape the JavaScript harness wrote.
func writeResults(repo string, opts options, jobs []*job) error {
	results := map[string]map[string]map[string]*testSummary{}

	record := func(j *job) {
		_, jobResults, _, _, _, replacements := j.state.snapshot()
		if jobResults == nil {
			return
		}

		if replacements > 0 {
			jobResults.SessionReplacements = replacements
		}

		key := browserua.New(browserua.FromBrowserEntry(j.name)).Normalize()

		family, version, _ := strings.Cut(key, "/")

		if results[family] == nil {
			results[family] = map[string]map[string]*testSummary{}
		}

		if results[family][version] == nil {
			results[family][version] = map[string]*testSummary{}
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
func mergeSummaries(a, b *testSummary) *testSummary {
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

	return &testSummary{
		Passed:              a.Passed + b.Passed,
		Failed:              a.Failed + b.Failed,
		FailingTests:        append(append([]failingTest{}, a.FailingTests...), b.FailingTests...),
		FailingSuites:       suites,
		TestedSuites:        append(append([]string{}, a.TestedSuites...), b.TestedSuites...),
		Assets:              assets,
		SessionReplacements: a.SessionReplacements + b.SessionReplacements,
	}
}

// reportFailures lists everything that failed, with a URL to reproduce it.
func reportFailures(jobs []*job, opts options) {
	// These URLs are printed for someone about to paste them into a browser, so
	// they have to work. Appending to a URL that already had a query produced a
	// second "?" and duplicated the parameters.
	baseURL := fmt.Sprintf("http://bs-local.com:%d/test", serverPort)

	log.Println("\nFailures:")

	for _, j := range jobs {
		state, results, _, err, _, _ := j.state.snapshot()

		if results == nil || results.Failed == 0 {
			if err != nil || state != "complete" {
				log.Printf(" • %s (%s): %v", j.name, j.testMode, firstNonNil(err, "no results"))
			}

			continue
		}

		log.Printf(" - %s:", j.name)

		for _, test := range results.FailingTests {
			values := url.Values{}
			values.Set("includePolyfills", includePolyfillsFor(opts.testMode))
			values.Set("always", alwaysFor(opts.testMode))
			values.Set("feature", test.FailingSuite)

			log.Printf("    -> %s", test.Name)
			log.Printf("       %s?%s", baseURL, values.Encode())
			log.Printf("       %s", test.Message)
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

	target := fmt.Sprintf("http://127.0.0.1:%d/test?includePolyfills=yes&always=no", serverPort)

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
			log.Printf("warning: reading MODIFIED_FILES_FILE: %v, testing everything", err)

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
		log.Printf("warning: could not diff against %s, testing everything", mergeBase)
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
