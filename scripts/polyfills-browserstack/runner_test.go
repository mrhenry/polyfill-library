package main

import (
	"context"
	"errors"
	"io"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/polyfillmeta"
)

// TestParseArgs pins the argv contract the CI workflows depend on. A matrix
// entry such as browser="chrome/1 - 50" carries a semver range containing
// spaces, and splitting it wrongly would silently test the wrong browsers.
func TestParseArgs(t *testing.T) {
	for _, tt := range []struct {
		name string
		args []string
		want options
	}{
		{
			name: "no arguments",
			args: nil,
			want: options{testMode: modeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "the workflow invocation",
			args: []string{"test-modified-only", "targeted", "director", "browser=chrome/1 - 50"},
			want: options{
				browserFilter: "chrome", versionRanges: "1 - 50",
				modifiedOnly: true, testMode: modeTargeted, director: true,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "polyfill combinations over a family with no range",
			args: []string{"all", "test-polyfill-combinations", "browser=ios"},
			want: options{
				browserFilter: "ios", testMode: modeAll, testPolyfillCombinations: true,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "control mode",
			args: []string{"control", "browser=ie"},
			want: options{
				browserFilter: "ie", testMode: modeControl,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "list",
			args: []string{"-list"},
			want: options{testMode: modeAll, list: true, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "concurrency",
			args: []string{"-concurrency", "2"},
			want: options{
				testMode: modeAll, maxConcurrency: 2, concurrencyExplicit: true,
				testEverything: true,
			},
		},
		{
			name: "a rejected concurrency leaves the default in place",
			args: []string{"-concurrency", "0"},
			want: options{testMode: modeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "a non-numeric concurrency leaves the default in place",
			args: []string{"-concurrency", "lots"},
			want: options{testMode: modeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "a trailing concurrency with no value",
			args: []string{"-concurrency"},
			want: options{testMode: modeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "unknown arguments are ignored",
			args: []string{"--not-a-flag", "director"},
			want: options{testMode: modeAll, director: true, testEverything: true, maxConcurrency: concurrency},
		},
	} {
		t.Run(tt.name, func(t *testing.T) {
			if got := parseArgs(tt.args); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseArgs(%q) = %+v, want %+v", tt.args, got, tt.want)
			}
		})
	}
}

// TestJobStateTracksOneJob covers the mutable progress the job goroutines and
// the progress printer share. A job that never published results has to read as
// failed, otherwise a lost session scores as a pass.
func TestJobStateTracksOneJob(t *testing.T) {
	state := newJobState()

	if state.state != "ready" {
		t.Errorf("a new job starts as %q, want ready", state.state)
	}

	// Nothing has run yet, so the job counts as failed.
	if !state.failed() {
		t.Error("a job that has not completed must read as failed")
	}

	state.setState("connecting to browser")

	if state.state != "connecting to browser" {
		t.Errorf("state = %q, want the state that was set", state.state)
	}

	progress := &pageResults{State: "running", RunnerCompletedCount: 3, RunnerCount: 10}
	state.recordProgress(progress)

	if state.failure != progress {
		t.Error("recordProgress did not keep the progress it was given")
	}

	state.setReplacementCount(2)

	if state.replacements != 2 {
		t.Errorf("replacements = %d, want 2", state.replacements)
	}

	state.complete(&testSummary{Passed: 7}, 12*time.Second)

	gotState, results, _, _, duration, replacements := state.snapshot()

	if gotState != "complete" || results == nil || results.Passed != 7 {
		t.Errorf("snapshot() = (%q, %+v), want a completed summary of 7 passes", gotState, results)
	}

	if duration != 12*time.Second || replacements != 2 {
		t.Errorf("duration/replacements = %s/%d, want 12s/2", duration, replacements)
	}

	if state.failed() {
		t.Error("a completed job with no failures must not read as failed")
	}

	state.complete(&testSummary{Passed: 7, Failed: 1}, time.Second)

	if !state.failed() {
		t.Error("a completed job with a failing test must read as failed")
	}

	boom := errors.New("boom")
	state.setError(boom)

	gotState, _, _, gotErr, _, _ := state.snapshot()

	if gotState != "error" || !errors.Is(gotErr, boom) {
		t.Errorf("snapshot() = (%q, %v), want the error that was set", gotState, gotErr)
	}
}

// TestPageResultsSummary covers the shape test/polyfills/compat.js reads. The
// page only sets failingSuites when a suite fails, and the consumer maps over
// it, so a missing object has to become an empty list rather than null.
func TestPageResultsSummary(t *testing.T) {
	summary := (&pageResults{
		State:  "complete",
		Passed: 3,
		Failed: 1,
		Tests:  []failingTest{{Name: "a", FailingSuite: "one"}},
		FailingSuites: map[string]bool{
			"two": true,
			"one": true,
		},
		TestedSuites: []string{"one", "two"},
		Assets:       map[string]any{"failed": []any{"polyfill.test.js"}},
	}).summary()

	if !reflect.DeepEqual(summary.FailingSuites, []string{"one", "two"}) {
		t.Errorf("FailingSuites = %v, want them sorted so the results file is stable", summary.FailingSuites)
	}

	if summary.FailingTests == nil {
		t.Error("FailingTests = nil, want an empty list rather than null")
	}

	if len(summary.FailingTests) != 1 || summary.FailingTests[0].FailingSuite != "one" {
		t.Errorf("FailingTests = %+v, want the failing test the page reported", summary.FailingTests)
	}

	if summary.Assets == nil {
		t.Error("Assets = nil, want the page's own diagnostics")
	}

	bare := (&pageResults{Passed: 1}).summary()

	if bare.FailingSuites == nil || len(bare.FailingSuites) != 0 {
		t.Errorf("FailingSuites = %v, want an empty list", bare.FailingSuites)
	}
}

// TestPolyfillGating covers which browsers a targeted run selects. Only the
// browsers a polyfill under test actually targets may run, or a targeted run
// would quietly widen into a full one.
func TestPolyfillGating(t *testing.T) {
	metas := &polyfillmeta.Collection{
		Metas: map[string]*polyfillmeta.Meta{
			"Promise":           {Browsers: map[string]string{"ie": "9 - 11", "chrome": "*"}},
			"fetch":             {Browsers: map[string]string{"chrome": "50 - 60"}},
			"Intl.DisplayNames": {Browsers: map[string]string{"ios_saf": "13 - 15"}},
		},
		All: []string{"Promise", "fetch", "Intl.DisplayNames"},
	}

	// "ios/13" normalises to the ios_saf family the polyfill targets use, and
	// ie/12.0 and chrome/70.0 fall outside every range under test.
	selected := selectBrowsers(
		[]string{"ie/9.0", "ie/12.0", "chrome/55.0", "chrome/70.0", "ios/13", "ios/16"},
		options{browserFilter: "", testEverything: false, feature: "Promise,fetch"},
		affectedBrowsers(metas, options{testEverything: false, feature: "Promise,fetch"}),
	)

	want := []string{"ie/9.0", "chrome/55.0", "chrome/70.0"}

	if !reflect.DeepEqual(selected, want) {
		t.Errorf("selected = %v, want %v", selected, want)
	}

	// A polyfill that targets neither family excludes every browser.
	affected := affectedBrowsers(metas, options{testEverything: false, feature: "unknown.feature"})

	if len(affected) != 0 {
		t.Errorf("affectedBrowsers = %d, want none for an unknown feature", len(affected))
	}

	if got := selectBrowsers([]string{"ie/9.0"}, options{testEverything: false}, affected); len(got) != 0 {
		t.Errorf("selected = %v, want no browsers when nothing is affected", got)
	}

	if neededForAny(browserua.New("chrome/70.0"), []*polyfillmeta.Meta{{Browsers: map[string]string{"chrome": "50 - 60"}}}) {
		t.Error("chrome/70.0 is outside 50 - 60 and must not be selected")
	}

	if !neededForAny(browserua.New("chrome/55.0"), []*polyfillmeta.Meta{{Browsers: map[string]string{"chrome": "50 - 60"}}}) {
		t.Error("chrome/55.0 is inside 50 - 60 and must be selected")
	}

	if got := names(""); got != nil {
		t.Errorf("names(\"\") = %v, want nil", got)
	}

	if got := names("a,b"); !reflect.DeepEqual(got, []string{"a", "b"}) {
		t.Errorf("names = %v, want the split list", got)
	}
}

// TestModifiedFilesFromTheEnvironmentFile covers the handoff a privileged
// workflow uses when the fork's git history is not available.
func TestModifiedFilesFromTheEnvironmentFile(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "modified.txt")

	if err := os.WriteFile(path, []byte("polyfills/Promise/polyfill.js\r\n\nlib/index.js\n"), 0o600); err != nil {
		t.Fatal(err)
	}

	t.Setenv("MODIFIED_FILES_FILE", path)

	want := []string{"polyfills/Promise/polyfill.js", "lib/index.js"}

	if got := modifiedFiles(); !reflect.DeepEqual(got, want) {
		t.Errorf("modifiedFiles() = %v, want %v", got, want)
	}

	// An unreadable file is not fatal: the run tests everything instead.
	t.Setenv("MODIFIED_FILES_FILE", filepath.Join(dir, "missing.txt"))

	if got := modifiedFiles(); got != nil {
		t.Errorf("modifiedFiles() = %v, want nil for an unreadable file", got)
	}
}

// TestBrowserSlotsSerialiseOneBrowser covers the rule that one browser is never
// driven by two sessions at once. Without it, two shards of the same browser
// race for the same remote machine and report each other's failures.
func TestBrowserSlotsSerialiseOneBrowser(t *testing.T) {
	slots := &browserSlots{inflight: map[string]bool{}}

	slots.acquire(context.Background(), "chrome/32.0")

	taken := make(chan string, 1)

	go func() {
		slots.acquire(context.Background(), "chrome/32.0")
		taken <- "chrome/32.0"
	}()

	select {
	case <-taken:
		t.Fatal("a second session for chrome/32.0 started while the first was running")
	case <-time.After(100 * time.Millisecond):
	}

	// A different browser is unaffected.
	slots.acquire(context.Background(), "chrome/33.0")
	slots.release("chrome/33.0")

	slots.release("chrome/32.0")

	select {
	case <-taken:
	case <-time.After(2 * time.Second):
		t.Fatal("releasing chrome/32.0 did not let the waiting session start")
	}
}

// TestConcurrencyForCapsToTheAccountPlan covers the local session limit. The
// account allowance is the real ceiling and is shared with everyone else, so a
// run that exceeds it queues sessions until they time out.
func TestConcurrencyForCapsToTheAccountPlan(t *testing.T) {
	gateWith := func(plan browserstack.Plan, err error) *capacityGate {
		return &capacityGate{
			plan:     func(context.Context) (browserstack.Plan, error) { return plan, err },
			headroom: capacityHeadroom,
			interval: time.Millisecond,
		}
	}

	roomy := options{testEverything: true, maxConcurrency: 4}

	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 10}, nil), roomy); got != 4 {
		t.Errorf("concurrencyFor = %d, want the default 4 on a roomy plan", got)
	}

	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 2}, nil), roomy); got != 1 {
		t.Errorf("concurrencyFor = %d, want the allowance 2 less one slot of headroom", got)
	}

	// A one session plan must still admit one session rather than none.
	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 1}, nil), roomy); got != 1 {
		t.Errorf("concurrencyFor = %d, want 1 on a one session plan", got)
	}

	// An unreachable plan endpoint must not stall the run.
	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{}, errors.New("offline")), roomy); got != 4 {
		t.Errorf("concurrencyFor = %d, want the default when the plan cannot be read", got)
	}

	explicit := options{testEverything: true, maxConcurrency: 2, concurrencyExplicit: true}

	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 10}, nil), explicit); got != 2 {
		t.Errorf("concurrencyFor = %d, want the explicit 2", got)
	}
}

// TestPrintProgressOnlyPrintsChanges covers the output a CI log is made of. The
// screenful holds every job, so reprinting it every second would bury the log
// a failure has to be found in.
func TestPrintProgressOnlyPrintsChanges(t *testing.T) {
	jobs := []*job{
		{name: "chrome/32.0", testMode: modeAll, trace: "r1a2-001-chrome-32.0", state: newJobState()},
		{name: "ie/9.0", testMode: modeTargeted, shard: 2, trace: "r1a2-007-ie-9.0", state: newJobState()},
	}

	jobs[0].state.setState("polling for results")

	lastProgress = ""

	first := captureProgress(t, jobs)

	// A job that has not started yet is only counted, not described.
	if !strings.Contains(first, "polling for results") || strings.Contains(first, "chrome-32.0]") {
		t.Errorf("the running job is not reported:\n%s", first)
	}

	if !strings.Contains(first, "+ 1 job(s) queued") {
		t.Errorf("the job that has not started is not counted as queued:\n%s", first)
	}

	if again := captureProgress(t, jobs); again != "" {
		t.Errorf("an unchanged run printed again:\n%s", again)
	}

	jobs[0].state.complete(&testSummary{Passed: 12}, 30*time.Second)

	after := captureProgress(t, jobs)

	if !strings.Contains(after, "✓ 12 tests") || !strings.Contains(after, "30 seconds to complete") {
		t.Errorf("a completed job is not reported:\n%s", after)
	}

	boom := errors.New("the remote machine died")
	jobs[0].state.setError(boom)

	failed := captureProgress(t, jobs)

	if !strings.Contains(failed, "the remote machine died") ||
		!strings.Contains(failed, "[trace r1a2-001-chrome-32.0]") {
		t.Errorf("a failed job does not name its error and its own trace:\n%s", failed)
	}
}

func captureProgress(t *testing.T, jobs []*job) string {
	t.Helper()

	read, write, err := os.Pipe()
	if err != nil {
		t.Fatal(err)
	}

	original := os.Stdout
	os.Stdout = write

	printProgress(jobs)

	os.Stdout = original

	if err := write.Close(); err != nil {
		t.Fatal(err)
	}

	out, err := io.ReadAll(read)
	if err != nil {
		t.Fatal(err)
	}

	return string(out)
}

// TestReportingHelpers covers the small renderers a failure report is built
// from. Each has to stay readable, because they are what a maintainer reads to
// work out what broke.
func TestReportingHelpers(t *testing.T) {
	if got := summarisePaths(nil); got != "nothing" {
		t.Errorf("summarisePaths(nil) = %q, want %q", got, "nothing")
	}

	got := summarisePaths([]string{"GET /", "GET /mocha.js", "GET /", "GET /mocha.js"})
	if got != "GET /, GET /mocha.js" {
		t.Errorf("summarisePaths = %q, want each request once, in the order it arrived", got)
	}

	// Zero is never rendered in practice, but plural(1) must stay empty so a
	// single replacement reads as "1 session replaced".
	for n, want := range map[int]string{0: "s", 1: "", 2: "s"} {
		if got := plural(n); got != want {
			t.Errorf("plural(%d) = %q, want %q", n, got, want)
		}
	}

	if got := firstNonNil(nil, "no results"); got != "no results" {
		t.Errorf("firstNonNil(nil) = %q, want the fallback", got)
	}

	boom := errors.New("boom")

	if got := firstNonNil(boom, "no results"); got != "boom" {
		t.Errorf("firstNonNil(err) = %q, want the error", got)
	}

	combined := (&job{testMode: modeTargeted, polyfillCombinations: true}).configForLog()
	if !strings.Contains(combined, "targeted") || !strings.Contains(combined, "combined") {
		t.Errorf("configForLog = %q, want the mode and the combination", combined)
	}

	plain := (&job{testMode: modeAll}).configForLog()
	if strings.Contains(plain, "combined") || strings.Contains(plain, "shard") {
		t.Errorf("configForLog = %q, want no combination or shard for a plain job", plain)
	}
}

// TestTestURLMatchesTheMode covers the query string the browser is sent, since
// the page's meaning changes with it: control runs without the polyfills, and
// only a full run asks for the gated ones.
func TestTestURLMatchesTheMode(t *testing.T) {
	individual := testURL("http://bs-local.com:9876", options{testMode: modeAll, feature: "Promise"}, 0, false, "r1a2-001")
	all := testURL("http://bs-local.com:9876", options{testMode: modeAll}, 0, false, "")
	control := testURL("http://bs-local.com:9876", options{testMode: modeControl}, 0, false, "")
	targeted := testURL("http://bs-local.com:9876", options{testMode: modeTargeted}, 0, false, "")
	combined := testURL("http://bs-local.com:9876", options{testMode: modeAll}, 1, true, "r1a2-002")
	directed := testURL("http://bs-local.com:9876", options{testMode: modeAll, director: true}, 0, false, "")

	for _, tt := range []struct {
		url  string
		want []string
	}{
		{url: individual, want: []string{"/test?", "includePolyfills=yes", "always=yes", "feature=Promise", "trace=r1a2-001"}},
		{url: all, want: []string{"/test?", "includePolyfills=yes", "always=yes"}},
		{url: control, want: []string{"includePolyfills=no", "always=yes"}},
		{url: targeted, want: []string{"includePolyfills=yes", "always=no"}},
		{url: combined, want: []string{"polyfillCombinations=yes", "shard=1", "trace=r1a2-002"}},
		{url: directed, want: []string{"http://bs-local.com:9876/?", "includePolyfills=yes"}},
	} {
		for _, want := range tt.want {
			if !strings.Contains(tt.url, want) {
				t.Errorf("%q does not contain %q", tt.url, want)
			}
		}
	}

	for _, tt := range []struct {
		url  string
		want []string
	}{
		{url: all, want: []string{"feature=", "polyfillCombinations", "shard", "trace"}},
		{url: individual, want: []string{"polyfillCombinations", "shard"}},
		{url: combined, want: []string{"feature="}},
	} {
		for _, unwanted := range tt.want {
			if strings.Contains(tt.url, unwanted) {
				t.Errorf("%q should not contain %q", tt.url, unwanted)
			}
		}
	}
}
