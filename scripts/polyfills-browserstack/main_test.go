package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
)

// TestIframeRequestsCarryTheTrace guards the trace on the iframe's polyfill.js
// request.
func TestIframeRequestsCarryTheTrace(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join(repoRoot(), "test/polyfills/test-iframe.handlebars"))
	if err != nil {
		t.Fatal(err)
	}

	if !strings.Contains(string(raw), "trace={{{trace}}}") {
		t.Error("test-iframe.handlebars does not carry the trace on its polyfill.js request")
	}
}

// TestMatrixSelectionIsStable pins the browser matrix the runner tests select.
func TestMatrixSelectionIsStable(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	// The default selection, with no feature restriction.
	all := selectBrowsers(list.Browsers, options{testEverything: true}, nil)

	if len(all) == 0 {
		t.Fatal("no browsers selected")
	}

	// Entries below the user agent normaliser's baseline cannot be tested.
	for _, entry := range all {
		if browserua.New(browserua.FromBrowserEntry(entry)).IsUnknown() {
			t.Errorf("%q normalises to unknown, so it should have been filtered out", entry)
		}
	}

	wantCounts := map[string]int{
		"":              263,
		"ie":            3,
		"chrome/1 - 50": 19,
		"edge":          6,
		"ios":           7,
		"safari":        12,
	}

	for filter, want := range wantCounts {
		opts := options{testEverything: true, browserFilter: filter}

		// A matrix entry is "family" or "family/version ranges", and is split
		// exactly as parseArgs splits the browser= argument.
		if family, ranges, ok := strings.Cut(filter, "/"); ok {
			opts.browserFilter = family
			opts.versionRanges = ranges
		}

		got := selectBrowsers(list.Browsers, opts, nil)

		if len(got) != want {
			t.Errorf("filter %q selected %d browsers, want %d", filter, len(got), want)
		}
	}
}

// TestEverySelectedBrowserResolves proves every curated browser has a
// BrowserStack counterpart.
func TestEverySelectedBrowserResolves(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	index := browserstack.NewIndex(stackList.Browsers)
	jobs := buildJobs(selectBrowsers(list.Browsers, options{testEverything: true}, nil), index, options{testEverything: true}, "rtest")

	if len(jobs) == 0 {
		t.Fatal("no jobs built")
	}

	for _, j := range jobs {
		if j.url == "" {
			t.Errorf("%s has no test url", j.name)
		}

		if j.expectedPage != "runner" {
			t.Errorf("%s expects the %q page, want runner when the director flag is absent", j.name, j.expectedPage)
		}
	}

	// The director flag must switch both the URL and the expected page.
	directed := buildJobs(selectBrowsers(list.Browsers, options{testEverything: true}, nil), index, options{testEverything: true, director: true}, "rtest")

	for _, j := range directed {
		if j.expectedPage != "director" {
			t.Errorf("%s expects the %q page, want director", j.name, j.expectedPage)
		}
	}
}

// TestEveryEnabledBrowserFamilyIsKnown guards against a newly offered
// BrowserStack family silently disappearing from the run.
func TestEveryEnabledBrowserFamilyIsKnown(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	for _, entry := range list.Browsers {
		if browserua.KnownEntry(entry) {
			continue
		}

		t.Errorf(
			"enabled browsers.toml entry %q uses browser family %q, which the polyfill library does not target; map it in scripts/browserua or comment the entry out",
			entry, browserua.FamilyOf(entry))
	}
}

// TestTracesAreUniqueAndUrlSafe covers the correlation id: the test server
// rejects anything over 80 characters or outside [A-Za-z0-9._-].
func TestTracesAreUniqueAndUrlSafe(t *testing.T) {
	runID := newRunID()

	if !strings.HasPrefix(runID, "r") {
		t.Errorf("run id %q should start with r", runID)
	}

	seen := map[string]bool{}

	slugs := []string{"chrome/32.0", "ie/9.0", "ios_saf/13", "ie/10.0#2", "safari/26.4"}

	for i := 0; i < 50; i++ {
		trace := nextTrace(runID, slugs[i%len(slugs)])

		if len(trace) > 80 {
			t.Errorf("trace %q is %d characters, the server rejects more than 80", trace, len(trace))
		}

		if !regexp.MustCompile(`^[A-Za-z0-9._-]+$`).MatchString(trace) {
			t.Errorf("trace %q contains characters the server rejects", trace)
		}

		if seen[trace] {
			t.Errorf("trace %q was issued twice", trace)
		}

		seen[trace] = true

		if !strings.Contains(trace, slugify(slugs[i%len(slugs)])) {
			t.Errorf("trace %q does not name the browser %q", trace, slugs[i%len(slugs)])
		}
	}
}

// TestEveryJobCarriesATrace proves each job gets its own correlation id.
func TestEveryJobCarriesATrace(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	jobs := buildJobs(
		selectBrowsers(list.Browsers, options{testEverything: true}, nil),
		browserstack.NewIndex(stackList.Browsers),
		options{testEverything: true, director: true},
		"run1",
	)

	seen := map[string]string{}

	for _, j := range jobs {
		if j.trace == "" {
			t.Errorf("%s has no trace", j.name)
			continue
		}

		if !strings.Contains(j.url, "trace="+j.trace) {
			t.Errorf("%s url %q does not carry its trace %q", j.name, j.url, j.trace)
		}

		if other, ok := seen[j.trace]; ok {
			t.Errorf("trace %q is shared by %s and %s", j.trace, other, j.name)
		}

		seen[j.trace] = j.name
	}
}

// TestCombinedJobsGetTheirOwnTrace covers multi-polyfill mode: each combination
// is its own session, so it needs its own trace.
func TestCombinedJobsGetTheirOwnTrace(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	jobs := buildJobs(
		selectBrowsers(list.Browsers, options{testEverything: true}, nil),
		browserstack.NewIndex(stackList.Browsers),
		options{testEverything: true, testPolyfillCombinations: true},
		"run1",
	)

	seen := map[string]bool{}

	var combined int

	for _, j := range jobs {
		if seen[j.trace] {
			t.Fatalf("trace %q is shared by more than one job", j.trace)
		}

		seen[j.trace] = true

		if !strings.Contains(j.url, "trace="+j.trace) {
			t.Errorf("%s url %q does not carry its trace %q", j.name, j.url, j.trace)
		}

		// Copying a job copies its state pointer, so the combination needs its
		// own progress.
		if j.polyfillCombinations {
			combined++

			for _, other := range jobs {
				if other != j && other.state == j.state && other.polyfillCombinations {
					t.Errorf("%s shares job state with another combination", j.name)
				}
			}
		}
	}

	if combined == 0 {
		t.Fatal("no combination jobs were built")
	}

	if len(jobs) != combined*2 {
		t.Errorf("built %d jobs for %d combinations, expected twice as many", len(jobs), combined)
	}
}

// TestBuildJobsOrdersCombinationsFirstAndOldestFirst guards the two-pass
// ordering the scheduler relies on: every combination job comes before every
// individual job, and within a group older browser versions come first.
func TestBuildJobsOrdersCombinationsFirstAndOldestFirst(t *testing.T) {
	index := browserstack.NewIndex([]browserstack.Browser{
		{Browser: "edge", BrowserVersion: "15.0"},
		{Browser: "edge", BrowserVersion: "16.0"},
		{Browser: "chrome", BrowserVersion: "32.0"},
		{Browser: "chrome", BrowserVersion: "33.0"},
	})

	jobs := buildJobs(
		[]string{"chrome/33.0", "edge/16.0", "chrome/32.0", "edge/15.0"},
		index,
		options{testEverything: true, testPolyfillCombinations: true},
		"run1",
	)

	var (
		sawIndividual bool
		combinations  []string
	)

	for _, j := range jobs {
		if !j.polyfillCombinations {
			sawIndividual = true

			continue
		}

		if sawIndividual {
			t.Fatalf("combination job %s runs after an individual job", j.trace)
		}

		combinations = append(combinations, j.name)
	}

	want := []string{"chrome/32.0", "chrome/33.0", "edge/15.0", "edge/16.0"}
	if !slices.Equal(combinations, want) {
		t.Errorf("combination order = %v, want oldest version first %v", combinations, want)
	}
}

// TestBuildJobsKeepsShardsWithTheirBrowser guards the browser-first order: a
// sharded browser's jobs stay together, oldest browser first, instead of all
// first shards then all second shards.
func TestBuildJobsKeepsShardsWithTheirBrowser(t *testing.T) {
	index := browserstack.NewIndex([]browserstack.Browser{
		{Browser: "ie", BrowserVersion: "11.0"},
		{Browser: "ie", BrowserVersion: "10.0"},
		{Browser: "ie", BrowserVersion: "9.0"},
	})

	jobs := buildJobs(
		[]string{"ie/11.0", "ie/10.0", "ie/9.0"},
		index,
		options{testEverything: true},
		"run1",
	)

	want := []string{"ie/9.0", "ie/9.0", "ie/10.0", "ie/10.0", "ie/11.0"}

	if len(jobs) != len(want) {
		t.Fatalf("built %d jobs, want %d", len(jobs), len(want))
	}

	for i, j := range jobs {
		if j.name != want[i] {
			t.Errorf("job %d = %s, want %s", i, j.name, want[i])
		}
	}
}

// TestSessionLabelCarriesTheTrace guards the join from the BrowserStack
// dashboard back to the test server log.
func TestSessionLabelCarriesTheTrace(t *testing.T) {
	for _, tt := range []struct {
		name    string
		job     job
		browser browserstack.Browser
		want    string
	}{
		{name: "plain", job: job{name: "chrome/63.0", trace: "r1a2-001-chrome-63.0"},
			browser: browserstack.Browser{Browser: "chrome", BrowserVersion: "63.0"},
			want:    "run: chrome/63.0 - individual - 1 - r1a2-001-chrome-63.0"},
		{name: "shard and combination", job: job{name: "ie/9.0", shard: 2, polyfillCombinations: true, trace: "r1a2-007-ie-9.0"},
			browser: browserstack.Browser{Browser: "ie", BrowserVersion: "9.0"},
			want:    "run: ie/9.0 - interop - 2 - r1a2-007-ie-9.0"},
		{name: "pinned platform", job: job{name: "ie/10.0", trace: "r1a2-009-ie-10.0"},
			browser: browserstack.Browser{Browser: "ie", BrowserVersion: "10.0", OS: "Windows", OSVersion: "7"},
			want:    "run: ie/10.0 - individual - 1 - r1a2-009-ie-10.0 - Windows 7"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			j := tt.job

			if got := sessionLabel("run", &j, tt.browser); got != tt.want {
				t.Errorf("sessionLabel() = %q, want %q", got, tt.want)
			}
		})
	}
}

// TestPreferredPlatformOnlyOnFirstSession covers the relaxation: the pinned
// platform is requested on the first session and omitted afterwards.
func TestPreferredPlatformOnlyOnFirstSession(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	jobs := buildJobs(
		selectBrowsers(list.Browsers, options{testEverything: true, browserFilter: "ie"}, nil),
		browserstack.NewIndex(stackList.Browsers),
		options{testEverything: true},
		"run1",
	)

	var pinned int

	for _, j := range jobs {
		if j.name == "ie/10.0" {
			pinned++

			if !j.hasPreferred {
				t.Fatalf("%s should have a preferred platform", j.name)
			}

			if got := j.browserFor(0); got.OS != "Windows" || got.OSVersion != "8" {
				t.Errorf("%s first session platform = %s %s, want Windows 8", j.name, got.OS, got.OSVersion)
			}

			if got := j.browserFor(1); got.OS != "Windows" || got.OSVersion != "8" {
				t.Errorf("%s first session platform = %s %s, want Windows 8", j.name, got.OS, got.OSVersion)
			}

			if got := j.browserFor(2); got.OS != "" || got.OSVersion != "" {
				t.Errorf("%s later session platform = %s %s, want none", j.name, got.OS, got.OSVersion)
			}

			continue
		}

		if j.hasPreferred {
			t.Errorf("%s should not have a preferred platform", j.name)
		}

		if got := j.browserFor(0); got.OS != "" || got.OSVersion != "" {
			t.Errorf("%s desktop job requests a platform: %s %s", j.name, got.OS, got.OSVersion)
		}
	}

	if pinned == 0 {
		t.Fatal("no ie/10.0 job was built")
	}
}

// TestPageLoadFailureNamesTheCause distinguishes a browser that never navigated
// from one that loaded something.
func TestPageLoadFailureNamesTheCause(t *testing.T) {
	last := pagecontract.State{
		ReadyState: "loading",
		Title:      "",
		Href:       "about:blank",
	}

	stats := &traceStats{
		Requests: 5,
		Gets:     4,
		Paths:    []string{"HEAD /", "GET /", "GET /test", "GET /mocha.js", "GET /mocha.css"},
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(stats)
	}))
	defer server.Close()

	trace := "r1a2-008-chrome-41.0"
	message := pageLoadFailure("chrome/41.0", trace, last, "director", server.URL).Error()

	// Arrival was established, so the message must describe a page that was
	// fetched and never ran.
	for _, want := range []string{
		"fetched but never started",
		"GET /mocha.css",
		trace,
	} {
		if !strings.Contains(message, want) {
			t.Errorf("message %q does not contain %q", message, want)
		}
	}
}

// TestWaitForFirstRequestIgnoresTheProbe covers the detection the fast retry
// depends on: BrowserStack's HEAD probe is not the browser's request.
func TestWaitForFirstRequestIgnoresTheProbe(t *testing.T) {
	for _, tt := range []struct {
		name        string
		stats       traceStats
		wantArrived bool
	}{
		{name: "only BrowserStack's probe arrived", stats: traceStats{Requests: 1, Paths: []string{"HEAD /"}}},
		{name: "nothing at all", stats: traceStats{}},
		{name: "the browser asked", stats: traceStats{Requests: 2, Gets: 1, Paths: []string{"HEAD /", "GET /"}}, wantArrived: true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
				_ = json.NewEncoder(w).Encode(tt.stats)
			}))
			defer server.Close()

			_, arrived, err := waitForFirstRequest(context.Background(), server.URL, "r1a2-008", 50*time.Millisecond)
			if err != nil {
				t.Fatal(err)
			}

			if arrived != tt.wantArrived {
				t.Errorf("arrived = %v, want %v", arrived, tt.wantArrived)
			}
		})
	}
}

// TestProbeTestServer covers the reachability check the retry loop depends on.
func TestProbeTestServer(t *testing.T) {
	healthy := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer healthy.Close()

	if err := probeTestServer(context.Background(), healthy.URL); err != nil {
		t.Errorf("probing a healthy server returned %v", err)
	}

	unready := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer unready.Close()

	if err := probeTestServer(context.Background(), unready.URL); err == nil {
		t.Error("probing a server that is not ready should return an error")
	}

	cancelled, cancel := context.WithCancel(context.Background())
	cancel()

	if err := probeTestServer(cancelled, healthy.URL); err == nil {
		t.Error("probing with a cancelled context should return an error")
	}
}

// TestDeadSessionIsClassifiedForReplacement pins the property runJob branches on.
func TestDeadSessionIsClassifiedForReplacement(t *testing.T) {
	dead := &noBrowserRequestError{trace: "r1a2-008", stats: traceStats{Requests: 1, Paths: []string{"HEAD /"}}}

	if !errors.Is(dead, ErrNoBrowserRequest) {
		t.Error("a dead session error does not unwrap to ErrNoBrowserRequest")
	}

	if browserstack.IsSessionStartFailure(dead) {
		t.Error("a dead session must not be mistaken for a session that failed to start")
	}
}

// TestNextAction covers the retry policy, including the bound on replacements.
func TestNextAction(t *testing.T) {
	dead := &noBrowserRequestError{trace: "r1a2-008"}
	started := errors.New("browserstack refused to create the session: Failed to create session")
	timedOutStart := fmt.Errorf("%w: context deadline exceeded", browserstack.ErrSessionStart)
	commandTimeout := fmt.Errorf("%w: context deadline exceeded", browserstack.ErrCommandTimeout)
	pageCrash := fmt.Errorf("%w: webdriver error (500): unknown error: session deleted because of page crash", browserstack.ErrPageCrash)
	testFailure := errors.New("2 tests failed")

	if got := nextAction(dead, 0); got != actionReplaceSession {
		t.Errorf("a dead session should replace the session, got %v", got)
	}

	if got := nextAction(dead, sessionReplacements); got != actionFail {
		t.Errorf("replacements must be bounded, got %v", got)
	}

	if got := nextAction(started, 0); got != actionRetryStart {
		t.Errorf("a session that could not start should be retried, got %v", got)
	}

	// A session start timeout is a busy account or queued session, so it is
	// retried.
	if got := nextAction(timedOutStart, 0); got != actionRetryStart {
		t.Errorf("a session start timeout should be retried, got %v", got)
	}

	// A command timeout means the session wedged, so it is replaced.
	if got := nextAction(commandTimeout, 0); got != actionReplaceSession {
		t.Errorf("a command timeout should replace the session, got %v", got)
	}

	if got := nextAction(commandTimeout, sessionReplacements); got != actionFail {
		t.Errorf("command-timeout replacements must be bounded, got %v", got)
	}

	// A crashed renderer is gone, so the session is replaced.
	if got := nextAction(pageCrash, 0); got != actionReplaceSession {
		t.Errorf("a page crash should replace the session, got %v", got)
	}

	if got := nextAction(pageCrash, sessionReplacements); got != actionFail {
		t.Errorf("page-crash replacements must be bounded, got %v", got)
	}

	// A real test failure must never be retried, which would hide a regression.
	if got := nextAction(testFailure, 0); got != actionFail {
		t.Errorf("a test failure must not be retried, got %v", got)
	}
}

// TestShardsHaveIndependentState pins the fix for the IE regression: shards
// must not share a jobState.
func TestShardsHaveIndependentState(t *testing.T) {
	root := repoRoot()

	list, err := browserstack.LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := browserstack.LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	jobs := buildJobs(
		selectBrowsers(list.Browsers, options{testEverything: true}, nil),
		browserstack.NewIndex(stackList.Browsers),
		options{testEverything: true},
		"run1",
	)

	seen := map[*jobState]string{}

	var shards int

	for _, j := range jobs {
		if j.shard == 0 {
			continue
		}

		shards++

		if prev, ok := seen[j.state]; ok {
			t.Errorf("%s and %s share one jobState", prev, j.name)
		}

		seen[j.state] = j.name
	}

	if shards == 0 {
		t.Fatal("no sharded jobs were built")
	}
}

// TestWriteResultsMergesShards covers the results file for a sharded browser:
// both shards merge into one family/version/mode entry.
func TestWriteResultsMergesShards(t *testing.T) {
	repo := t.TempDir()

	if err := os.MkdirAll(filepath.Join(repo, "test/polyfills"), 0o755); err != nil {
		t.Fatal(err)
	}

	shard1 := &job{name: "ie/10.0", testMode: modeTargeted, state: newJobState()}
	shard2 := &job{name: "ie/10.0", testMode: modeTargeted, state: newJobState()}

	shard1.state.complete(&pagecontract.Summary{
		Passed:        100,
		Failed:        1,
		FailingSuites: []string{"suite.a"},
		TestedSuites:  []string{"a", "b"},
	}, 0)
	shard2.state.complete(&pagecontract.Summary{
		Passed:        200,
		FailingSuites: []string{"suite.b"},
		TestedSuites:  []string{"c"},
	}, 0)

	if err := writeResults(repo, options{testMode: modeTargeted, browserFilter: "ie"}, []*job{shard1, shard2}); err != nil {
		t.Fatal(err)
	}

	raw, err := os.ReadFile(filepath.Join(repo, "test/polyfills/results-targeted-ie.json"))
	if err != nil {
		t.Fatal(err)
	}

	var results map[string]map[string]map[string]*pagecontract.Summary
	if err := json.Unmarshal(raw, &results); err != nil {
		t.Fatal(err)
	}

	summary := results["ie"]["10.0.0"]["targeted"]
	if summary == nil {
		t.Fatal("no merged summary for ie/10.0.0")
		return
	}

	if summary.Passed != 300 || summary.Failed != 1 {
		t.Errorf("merged passed/failed = %d/%d, want 300/1", summary.Passed, summary.Failed)
	}

	if len(summary.FailingSuites) != 2 {
		t.Errorf("merged failing suites = %v, want both shards' suites", summary.FailingSuites)
	}

	if len(summary.TestedSuites) != 3 {
		t.Errorf("merged tested suites = %v, want all three suites", summary.TestedSuites)
	}
}
