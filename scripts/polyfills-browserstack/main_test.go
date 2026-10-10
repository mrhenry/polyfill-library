package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
)

// TestPageStateCheck covers the readiness decision, which is where a false
// failure previously came from: the harness used to infer the page by
// sniffing for `mocha`, which is always absent on the director page because it
// keeps mocha inside an iframe.
func TestPageStateCheck(t *testing.T) {
	cases := []struct {
		name      string
		state     pageState
		expected  string
		wantReady bool
		wantErr   bool
	}{
		{
			name:      "director page that started is ready",
			state:     pageState{Page: "director", Started: true, ReadyState: "complete"},
			expected:  "director",
			wantReady: true,
		},
		{
			name:      "runner page that started is ready",
			state:     pageState{Page: "runner", Started: true, ReadyState: "complete"},
			expected:  "runner",
			wantReady: true,
		},
		{
			name:      "director page has no mocha, and must still be ready",
			state:     pageState{Page: "director", Started: true, ReadyState: "complete"},
			expected:  "director",
			wantReady: true,
		},
		{
			name:     "declared page must match the requested page",
			state:    pageState{Page: "runner", Started: true},
			expected: "director",
			wantErr:  true,
		},
		{
			name:      "page that has not started yet is not ready",
			state:     pageState{Page: "director", Started: false, ReadyState: "loading"},
			expected:  "director",
			wantReady: false,
		},
		{
			name:      "undeclared page is not an error yet, just not ready",
			state:     pageState{Page: "", Started: false, ReadyState: "complete"},
			expected:  "director",
			wantReady: false,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ready, err := tc.state.check(tc.expected)

			if tc.wantErr {
				if err == nil {
					t.Fatalf("check() error = nil, want an error about the wrong page")
				}

				return
			}

			if err != nil {
				t.Fatalf("check() unexpected error: %v", err)
			}

			if ready != tc.wantReady {
				t.Errorf("check() ready = %t, want %t", ready, tc.wantReady)
			}
		})
	}
}

// TestDescribeAssetsNamesTheBrokenAsset proves a failure message says which
// script broke, rather than only reporting that the page stalled.
func TestDescribeAssetsNamesTheBrokenAsset(t *testing.T) {
	assets := map[string]any{
		"loaded": []any{"mocha.js", "proclaim.js"},
		"failed": []any{"polyfill.js"},
		"errors": []any{"mocha is not defined @ http://bs-local.com:9876/test:42"},
	}

	got := describeAssets(assets)

	for _, want := range []string{"polyfill.js", "mocha is not defined", "mocha.js"} {
		if !strings.Contains(got, want) {
			t.Errorf("describeAssets() = %q, want it to mention %q", got, want)
		}
	}

	if got := describeAssets(nil); got != "" {
		t.Errorf("describeAssets(nil) = %q, want empty", got)
	}
}

func TestParsePageState(t *testing.T) {
	raw := `{
		"page": "runner",
		"started": true,
		"suiteSize": 271,
		"expectedRuns": null,
		"readyState": "complete",
		"href": "http://bs-local.com:9876/test?includePolyfills=yes",
		"title": "Mocha test suite for polyfill-library",
		"assets": {"loaded": ["mocha.js"], "failed": [], "errors": []}
	}`

	var value any
	if err := json.Unmarshal([]byte(raw), &value); err != nil {
		t.Fatal(err)
	}

	got := parsePageState(value)

	if got.Page != "runner" || !got.Started {
		t.Errorf("Page/Started = %q/%t, want runner/true", got.Page, got.Started)
	}

	if got.SuiteSize == nil || *got.SuiteSize != 271 {
		t.Errorf("SuiteSize = %v, want 271", got.SuiteSize)
	}

	if got.ExpectedRuns != nil {
		t.Errorf("ExpectedRuns = %v, want nil for the runner page", got.ExpectedRuns)
	}

	if !strings.Contains(got.Href, "bs-local.com") {
		t.Errorf("Href = %q, want the tunnel URL", got.Href)
	}

	if got.Assets == nil {
		t.Error("Assets = nil, want the page's diagnostics")
	}
}

// TestProbeMatchesPagesItPolls guards the contract between the Go probe and
// the pages it polls. If a global is renamed, this fails instead of the harness
// silently reading undefined and timing out.
//
// The two pages publish from different places: the director page's globals are
// in its template, while the runner page's are injected by server.js through
// the afterTestSuite hook, because they depend on mocha having parsed.
func TestProbeMatchesPagesItPolls(t *testing.T) {
	root := repoRoot()

	read := func(name string) string {
		raw, err := os.ReadFile(filepath.Join(root, "test/polyfills", name))
		if err != nil {
			t.Fatal(err)
		}

		return string(raw)
	}

	sources := map[string]struct {
		content string
		needles []string
	}{
		"test-director.handlebars": {
			content: read("test-director.handlebars"),
			needles: []string{
				"window.global_test_page",
				"global_test_page = 'director'",
				"global_test_started",
				"global_test_expected_runs",
				"global_test_assets",
			},
		},
		"test-runner.handlebars": {
			content: read("test-runner.handlebars"),
			needles: []string{
				"window.global_test_assets",
				"__assetLoaded",
				"__assetFailed",
				"onload=",
				"onerror=",
			},
		},
		"server.js": {
			content: read("server.js"),
			needles: []string{
				"global_test_page = 'runner'",
				"global_test_suite_size",
				"global_test_started",
			},
		},
	}

	for file, source := range sources {
		for _, needle := range source.needles {
			if !strings.Contains(source.content, needle) {
				t.Errorf("%s does not publish %q", file, needle)
			}
		}
	}
}

// TestProbeReadsGlobalsThePagesPublish is the other half of that contract: the
// Go side must not read a global no page writes.
func TestProbeReadsGlobalsThePagesPublish(t *testing.T) {
	for _, global := range []string{
		"global_test_page",
		"global_test_started",
		"global_test_suite_size",
		"global_test_expected_runs",
		"global_test_assets",
	} {
		if !strings.Contains(pageStateScript, global) {
			t.Errorf("pageStateScript does not read %q", global)
		}
	}
}

// TestRunnerPageFailsAnEmptySuite covers the silent false pass: a suite that
// registers no tests used to publish passed:0 failed:0, which scores as a
// success.
func TestRunnerPageFailsAnEmptySuite(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join(repoRoot(), "test/polyfills/server.js"))
	if err != nil {
		t.Fatal(err)
	}

	content := string(raw)

	for _, needle := range []string{
		"if (!results.total)",
		"no tests were registered",
		"global_test_suite_size",
		"global_test_page = 'runner'",
		"assets: window.global_test_assets",
	} {
		if !strings.Contains(content, needle) {
			t.Errorf("server.js is missing %q", needle)
		}
	}
}

// TestDirectorPassesAssetsThrough covers surfacing iframe diagnostics to the
// top window the driver actually polls.
func TestDirectorPassesAssetsThrough(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join(repoRoot(), "test/polyfills/test-director.handlebars"))
	if err != nil {
		t.Fatal(err)
	}

	content := string(raw)

	for _, needle := range []string{
		"if (results.assets) globalresults.assets = results.assets",
		"function snapshotRunnerAssets()",
		"snapshotRunnerAssets();",
	} {
		if !strings.Contains(content, needle) {
			t.Errorf("test-director.handlebars is missing %q", needle)
		}
	}
}

// TestMatrixSelectionIsStable locks in the browser matrix the runner tests.
//
// This replaces comparing against the JavaScript harness, which has been
// removed. The counts are the ones that harness selected, verified entry by
// entry, so a change here means the matrix moved rather than the test moving.
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
		if i := strings.Index(filter, "/"); i != -1 {
			opts.browserFilter = filter[:i]
			opts.versionRanges = filter[i+1:]
		}

		got := selectBrowsers(list.Browsers, opts, nil)

		if len(got) != want {
			t.Errorf("filter %q selected %d browsers, want %d", filter, len(got), want)
		}
	}
}

// TestEverySelectedBrowserResolves proves no curated browser silently loses its
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

// TestTracesAreUniqueAndUrlSafe covers the correlation id. The test server
// rejects anything longer than 80 characters or containing anything but
// [A-Za-z0-9._-], and a rejected id would silently disable correlation.
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

// TestEveryJobCarriesATrace proves each job gets its own correlation id, so a
// request can be attributed to exactly one job.
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

// TestCombinedJobsGetTheirOwnTrace covers multi-polyfill mode. Each combination
// is a separate browser session, so a shared trace would make its requests
// impossible to attribute.
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
		// own progress or both sessions would report through one counter.
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

// TestSessionLabelCarriesTheTrace guards the join from the BrowserStack
// dashboard back to the test server log, which is how a failure gets attributed
// to the requests it made.
func TestSessionLabelCarriesTheTrace(t *testing.T) {
	for _, tt := range []struct {
		name string
		job  job
		want string
	}{
		{name: "plain", job: job{name: "chrome/63.0", trace: "r1a2-001-chrome-63.0"},
			want: "run: chrome/63.0 - individual - 1 - r1a2-001-chrome-63.0"},
		{name: "shard and combination", job: job{name: "ie/9.0", shard: 2, polyfillCombinations: true, trace: "r1a2-007-ie-9.0"},
			want: "run: ie/9.0 - interop - 2 - r1a2-007-ie-9.0"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			j := tt.job

			if got := sessionLabel("run", &j); got != tt.want {
				t.Errorf("sessionLabel() = %q, want %q", got, tt.want)
			}
		})
	}
}

// TestPageLoadFailureNamesTheCause is the distinction that makes a "director
// page never started" report actionable: a browser that never navigated is a
// tunnel or remote machine problem, and one that loaded something is not.
func TestPageLoadFailureNamesTheCause(t *testing.T) {
	last := pageState{
		ReadyState: "loading",
		Title:      "",
		Href:       "about:blank",
	}

	stats := &traceStats{
		Requests: 5,
		Gets:     4,
		Paths:    []string{"HEAD /", "GET /", "GET /test", "GET /mocha.js", "GET /mocha.css"},
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(stats)
	}))
	defer server.Close()

	trace := "r1a2-008-chrome-41.0"
	message := pageLoadFailure("chrome/41.0", trace, last, "director", server.URL).Error()

	// Arrival is established before this point, so the message must describe a
	// page that was fetched and never ran, not one that was never requested.
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
// depends on. BrowserStack probes the session URL with a HEAD carrying the same
// trace, so counting any request would make a dead session look alive.
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
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

	// A real test failure must never be retried: that is the case where a retry
	// would hide a regression.
	if got := nextAction(testFailure, 0); got != actionFail {
		t.Errorf("a test failure must not be retried, got %v", got)
	}
}
