// Command polyfills-browserstack runs the polyfill-library browser test suite
// on BrowserStack.
//
// It replaces the WebdriverIO harness in test/polyfills/remotetest.js. The
// test pages are still served by test/polyfills/server.js, because producing
// the polyfill bundle needs the JavaScript library; this command only drives
// browsers.
//
// Only the W3C WebDriver protocol is used: capabilities go out as
// alwaysMatch, commands use the W3C routes, and there is no JSON Wire
// Protocol fallback. BrowserStack retires JSON Wire Protocol support on
// 22 December 2026.
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

	// projectName labels the BrowserStack project.
	projectName = "polyfill-library"

	// concurrency is how many BrowserStack sessions run at once. Four matches
	// BrowserStack's default Automate parallel allowance; exceeding it makes
	// sessions queue on the hub and can leave them waiting past the per
	// browser timeout.
	concurrency = 4

	// testBrowserTimeout is how long one browser may run for.
	testBrowserTimeout = 10 * time.Minute

	// pollTick is how often test progress is read from the page.
	pollTick = time.Second

	// sessionStartTimeout bounds a single New Session call.
	sessionStartTimeout = 2 * time.Minute

	// maxAttempts is how many times a browser is retried.
	maxAttempts = 3

	// retryDelay is the pause between attempts.
	retryDelay = 30 * time.Second

	// processTimeout caps a whole run, matching the CI timeout-minutes.
	processTimeout = 30 * time.Minute
)

// debug prints the navigation target and negotiated session capabilities.
var debug = os.Getenv("POLYFILLS_BROWSERSTACK_DEBUG") != ""

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

	// feature is the comma separated polyfill subset to test, derived from the
	// change set rather than passed on the command line.
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
	}
}

// job is one browser session. The value is immutable once built; progress is
// held behind a pointer so jobs can be copied cheaply when polyfill
// combinations expand the matrix.
type job struct {
	name    string
	browser browserstack.Browser

	testMode             mode
	url                  string
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
}

func newJobState() *jobState {
	return &jobState{state: "ready"}
}

func (s *jobState) setState(state string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.state = state
}

func (s *jobState) setError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.err = err
	s.state = "error"
}

// recordProgress stores the latest progress read from the page.
func (s *jobState) recordProgress(progress *pageResults) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.failure = progress
	s.state = "running"
}

// complete stores the final results.
func (s *jobState) complete(results *testSummary, duration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.results = results
	s.duration = duration
	s.state = "complete"
}

// snapshot copies the current progress under the lock.
func (s *jobState) snapshot() (state string, results *testSummary, failure *pageResults, err error, duration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.state, s.results, s.failure, s.err, s.duration
}

// failed reports whether this job counts as a failure.
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

	if err := ensureTestServer(repo); err != nil && !opts.list {
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

	jobs := buildJobs(entries, browserstack.NewIndex(stackList.Browsers), opts)
	if len(jobs) == 0 {
		log.Println("nothing to test")
		return nil
	}

	client := browserstack.New(browserstack.Config{Credentials: credentials})

	processCtx, processCancel := context.WithTimeout(context.Background(), processTimeout)
	defer processCancel()

	runnerCtx, stopSignals := signal.NotifyContext(processCtx, os.Interrupt, syscall.SIGTERM)
	defer stopSignals()

	closeTunnel, err := client.OpenTunnel(runnerCtx)

	defer closeTunnel()

	if err != nil {
		return err
	}

	log.Println("tunnel ready")

	sessionName := fmt.Sprintf("Polyfill Library: %s", time.Now().Format(time.RFC3339))
	failed := execute(runnerCtx, client, credentials, jobs, sessionName, opts.maxConcurrency)

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

		ua := browserua.New(browserua.FromBrowserEntry(entry))

		// Unrecognised or below baseline browsers cannot be tested.
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

// buildJobs expands browser entries into session jobs.
func buildJobs(entries []string, index *browserstack.Index, opts options) []*job {
	baseURL := fmt.Sprintf("http://bs-local.com:%d", serverPort)

	var jobs []*job

	for _, entry := range entries {
		browser, ok := index.Lookup(entry)
		if !ok {
			log.Printf("skipping %s : not found in browserstackBrowsers.toml", entry)
			continue
		}

		base := job{
			name:     entry,
			browser:  browser,
			testMode: opts.testMode,
			state:    newJobState(),
		}

		// Slow browsers are split in two when the whole suite runs, so a
		// single browser cannot monopolise the run.
		if needsShard(entry) && opts.testEverything {
			for shard := 1; shard <= 2; shard++ {
				sharded := base
				sharded.shard = shard
				sharded.url = testURL(baseURL, opts, shard, false)
				jobs = append(jobs, &sharded)
			}

			continue
		}

		base.url = testURL(baseURL, opts, 0, false)
		jobs = append(jobs, &base)
	}

	if opts.testPolyfillCombinations {
		var expanded []*job
		for _, j := range jobs {
			combined := *j
			combined.polyfillCombinations = true
			combined.url = testURL(baseURL, opts, j.shard, true)

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

// testURL builds the URL a browser loads.
func testURL(baseURL string, opts options, shard int, polyfillCombinations bool) string {
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

// execute runs every job, at most concurrency at a time, and never runs two
// sessions for the same browser at once.
func execute(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, jobs []*job, sessionName string, maxConcurrency int) int {
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

			runJob(ctx, client, credentials, j, sessionName)
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

// acquire blocks until no other session is running for name.
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

// runJob drives one browser to completion, retrying session starts.
func runJob(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, j *job, sessionName string) {
	var lastErr error

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

		lastErr = runJobOnce(ctx, client, credentials, j, sessionName)
		if lastErr == nil {
			return
		}

		if !browserstack.IsSessionStartFailure(lastErr) {
			j.state.setError(lastErr)

			return
		}

		log.Printf("%s: %v", j.name, lastErr)
	}

	j.state.setError(lastErr)
}

func runJobOnce(ctx context.Context, client *browserstack.Client, credentials browserstack.Credentials, j *job, batchName string) error {
	j.state.setState("connecting to browser")

	sessionCtx, cancelSession := context.WithTimeout(ctx, sessionStartTimeout)

	sessionName := fmt.Sprintf("%s: %s - %s - %s - %s",
		batchName, j.name, combinationName(j.polyfillCombinations), shardName(j.shard),
		time.Now().Format(time.RFC3339))

	caps := browserstack.CapabilitiesFor(
		j.browser,
		sessionName,
		projectName,
		// One tunnel per process, so no local identifier is needed.
		"",
		credentials,
	)

	session, err := browserstack.NewSession(sessionCtx, client.HTTPClient(), browserstack.Hub(), caps, credentials)
	cancelSession()

	if err != nil {
		return err
	}

	// Always release the BrowserStack session, even when a later step fails.
	defer func() {
		deleteCtx, cancelDelete := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
		defer cancelDelete()

		if err := session.Delete(deleteCtx); err != nil {
			log.Printf("%s: deleting session: %v", j.name, err)
		}
	}()

	if debug {
		if raw, err := json.Marshal(caps); err == nil {
			log.Printf("capabilities for %s: %s", j.name, raw)
		}

		log.Printf("session capabilities: %v", session.Capabilities())
		log.Printf("navigating %s to %s", j.name, j.url)
	}

	j.state.setState("initializing browser")

	if err := session.Navigate(ctx, j.url); err != nil {
		return err
	}

	// Fail fast when the page never arrives at all. Polling for results alone
	// cannot tell "the suite is still running" from "the browser never loaded
	// anything", so a session that cannot reach the test server would burn the
	// whole per browser timeout before reporting a bare timeout.
	if err := waitForPageLoad(ctx, session, j); err != nil {
		return err
	}

	j.state.setState("polling for results")

	return pollForResults(ctx, session, j)
}

// pageLoadTimeout bounds how long the test page has to start.
const pageLoadTimeout = 90 * time.Second

// waitForPageLoad polls until the test page has loaded far enough to run the
// suite.
func waitForPageLoad(ctx context.Context, session *browserstack.Session, j *job) error {
	deadline := time.Now().Add(pageLoadTimeout)

	var lastReady string

	for {
		state, err := session.ExecuteScript(ctx, pageStateScript, nil)
		if err != nil {
			return err
		}

		fields, ok := state.(map[string]any)
		if !ok {
			fields = nil
		}

		if s, ok := fields["readyState"].(string); ok {
			lastReady = s
		}

		if loaded, ok := fields["loaded"].(bool); ok && loaded {
			j.state.setState("page loaded")

			return nil
		}

		if time.Now().After(deadline) {
			return fmt.Errorf(
				"%s: the test page never started the suite (readyState=%q, mocha loaded=%t, results published=%t) : "+
					"the page loaded but its scripts did not run, which usually means the tunnel or the local test "+
					"server dropped requests under concurrency",
				j.name, lastReady,
				fields["loaded"] == true, fields["results"] == true)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

// pageStateScript reports whether the suite has started.
//
// The two page shapes need different signals. The director page publishes
// window.global_test_progress at the top level and keeps mocha inside an
// iframe, so `typeof mocha` is always "undefined" there. The standalone runner
// page has no progress global until the very end, so it needs mocha.
const pageStateScript = `
	return {
		readyState: document.readyState,
		loaded: typeof window.global_test_progress !== "undefined" ||
			typeof window.global_test_results !== "undefined" ||
			typeof mocha !== "undefined",
		results: typeof window.global_test_results !== "undefined"
	};`

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

// pollForResults waits for the page to publish test results.
func pollForResults(ctx context.Context, session *browserstack.Session, j *job) error {
	deadline := time.Now().Add(testBrowserTimeout)

	startedAt := time.Now()

	var (
		lastSeen      int
		lastUpdatedAt time.Time
	)

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
		if !lastUpdatedAt.IsZero() && time.Since(lastUpdatedAt) > testBrowserTimeout {
			current, _, _, _, _ := j.state.snapshot()
			timedOut := fmt.Errorf("timed out at %q on %q", current, j.name)
			j.state.setError(timedOut)

			return timedOut
		}

		if time.Now().After(deadline) {
			return fmt.Errorf("timed out on %q", j.name)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

// printProgress renders the live status of every job.
func printProgress(jobs []*job) {
	lines := []string{strings.Repeat("-", 80)}

	queued := 0

	for _, j := range jobs {
		state, results, failure, err, duration := j.state.snapshot()

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
		case "error":
			message = fmt.Sprintf("⚠️  %v", err)
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
		_, jobResults, _, _, _ := j.state.snapshot()
		if jobResults == nil {
			return
		}

		key := browserua.New(browserua.FromBrowserEntry(j.name)).Normalize()

		family, version, _ := strings.Cut(key, "/")

		if results[family] == nil {
			results[family] = map[string]map[string]*testSummary{}
		}

		if results[family][version] == nil {
			results[family][version] = map[string]*testSummary{}
		}

		results[family][version][string(j.testMode)] = jobResults
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

// reportFailures lists everything that failed, with a URL to reproduce it.
func reportFailures(jobs []*job, opts options) {
	baseURL := fmt.Sprintf("http://bs-local.com:%d/test?includePolyfills=%s&always=%s",
		serverPort, includePolyfillsFor(opts.testMode), alwaysFor(opts.testMode))

	log.Println("\nFailures:")

	for _, j := range jobs {
		state, results, _, err, _ := j.state.snapshot()

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

// repoRoot locates the repository root.
//
// `go run ./polyfills-browserstack` from the scripts directory starts in
// scripts/, so walk up until the test tree is found. This keeps the command
// usable both from the repo root (installed binary) and via go run.
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

// ensureTestServer checks the JavaScript test server is reachable, since the
// runner drives pages it serves.
func ensureTestServer(repo string) error {
	if _, err := os.Stat(filepath.Join(repo, "test/polyfills/server.js")); err != nil {
		return fmt.Errorf("cannot find test/polyfills/server.js - run from the repository root: %w", err)
	}

	target := fmt.Sprintf("http://127.0.0.1:%d/test?includePolyfills=yes&always=no", serverPort)

	client := &http.Client{Timeout: 5 * time.Second}

	res, err := client.Get(target) //nolint:noctx // a short probe, not part of a larger flow
	if err != nil {
		return fmt.Errorf("test server is not reachable on port %d - start it with `node ./test/polyfills/server.js &`: %w", serverPort, err)
	}

	res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("test server returned %d for %s", res.StatusCode, target)
	}

	return nil
}

// modifiedFiles resolves which files changed.
//
// MODIFIED_FILES_FILE takes precedence so a privileged workflow can hand the
// list over from an unprivileged build job.
//
// A git failure is not fatal: the result is reported as "no changes", which
// makes the run test everything. Testing more is safe, whereas refusing to run
// leaves a pull request permanently red for an environmental reason.
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
