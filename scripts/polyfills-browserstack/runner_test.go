package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
	"github.com/mrhenry/polyfill-library/scripts/polyfillmeta"
	"github.com/mrhenry/polyfill-library/scripts/testserver"
)

// TestParseArgs pins the argv contract the CI workflows depend on.
func TestParseArgs(t *testing.T) {
	for _, tt := range []struct {
		name string
		args []string
		want options
	}{
		{
			name: "no arguments",
			args: nil,
			want: options{testMode: pagecontract.ModeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "the workflow invocation",
			args: []string{"test-modified-only", "targeted", "director", "browser=chrome/1 - 50"},
			want: options{
				browserFilter: "chrome", versionRanges: "1 - 50",
				modifiedOnly: true, testMode: pagecontract.ModeTargeted, director: true,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "polyfill combinations over a family with no range",
			args: []string{"all", "test-polyfill-combinations", "browser=ios"},
			want: options{
				browserFilter: "ios", testMode: pagecontract.ModeAll, testPolyfillCombinations: true,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "control mode",
			args: []string{"control", "browser=ie"},
			want: options{
				browserFilter: "ie", testMode: pagecontract.ModeControl,
				testEverything: true, maxConcurrency: concurrency,
			},
		},
		{
			name: "list",
			args: []string{"-list"},
			want: options{testMode: pagecontract.ModeAll, list: true, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "concurrency",
			args: []string{"-concurrency", "2"},
			want: options{
				testMode: pagecontract.ModeAll, maxConcurrency: 2, concurrencyExplicit: true,
				testEverything: true,
			},
		},
		{
			name: "a rejected concurrency leaves the default in place",
			args: []string{"-concurrency", "0"},
			want: options{testMode: pagecontract.ModeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "a non-numeric concurrency leaves the default in place",
			args: []string{"-concurrency", "lots"},
			want: options{testMode: pagecontract.ModeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "a trailing concurrency with no value",
			args: []string{"-concurrency"},
			want: options{testMode: pagecontract.ModeAll, testEverything: true, maxConcurrency: concurrency},
		},
		{
			name: "unknown arguments are ignored",
			args: []string{"--not-a-flag", "director"},
			want: options{testMode: pagecontract.ModeAll, director: true, testEverything: true, maxConcurrency: concurrency},
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
// the progress printer share.
func TestJobStateTracksOneJob(t *testing.T) {
	state := newJobState()

	if got := state.status().state; got != "ready" {
		t.Errorf("a new job starts as %q, want ready", got)
	}

	// Nothing has run yet, so the job counts as failed.
	if !state.failed() {
		t.Error("a job that has not completed must read as failed")
	}

	state.setState("connecting to browser")

	if got := state.status().state; got != "connecting to browser" {
		t.Errorf("state = %q, want the state that was set", got)
	}

	progress := &pagecontract.Results{State: "running", RunnerCompletedCount: 3, RunnerCount: 10}
	state.recordProgress(progress)

	if got := state.status().progress; got != progress {
		t.Error("recordProgress did not keep the progress it was given")
	}

	state.setReplacementCount(2)

	if got := state.status().replacements; got != 2 {
		t.Errorf("replacements = %d, want 2", got)
	}

	state.complete(&pagecontract.Summary{Passed: 7}, 12*time.Second)

	status := state.status()

	if status.state != "complete" || status.results == nil || status.results.Passed != 7 {
		t.Errorf("status() = (%q, %+v), want a completed summary of 7 passes", status.state, status.results)
	}

	if status.duration != 12*time.Second || status.replacements != 2 {
		t.Errorf("duration/replacements = %s/%d, want 12s/2", status.duration, status.replacements)
	}

	if state.failed() {
		t.Error("a completed job with no failures must not read as failed")
	}

	state.complete(&pagecontract.Summary{Passed: 7, Failed: 1}, time.Second)

	if !state.failed() {
		t.Error("a completed job with a failing test must read as failed")
	}

	boom := errors.New("boom")
	state.setError(boom)

	status = state.status()

	if status.state != "error" || !errors.Is(status.err, boom) {
		t.Errorf("status() = (%q, %v), want the error that was set", status.state, status.err)
	}
}

// TestPolyfillGating covers which browsers a targeted run selects.
func TestPolyfillGating(t *testing.T) {
	metas := &polyfillmeta.Collection{
		Metas: map[string]*polyfillmeta.Meta{
			"Promise":           {Browsers: map[string]string{"ie": "9 - 11", "chrome": "*"}},
			"fetch":             {Browsers: map[string]string{"chrome": "50 - 60"}},
			"Intl.DisplayNames": {Browsers: map[string]string{"ios_saf": "13 - 15"}},
		},
		All: []string{"Promise", "fetch", "Intl.DisplayNames"},
	}

	// "ios/13" normalises to the ios_saf family the polyfill targets use;
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

// TestModifiedFilesFromTheEnvironmentFile covers the MODIFIED_FILES_FILE
// handoff.
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

// jobRunnerFunc adapts a function to the jobRunner seam.
type jobRunnerFunc func(ctx context.Context, j *job)

func (f jobRunnerFunc) runJob(ctx context.Context, j *job) { f(ctx, j) }

// TestSchedulerSerialisesOneBrowser covers the rule that one browser is never
// driven by two sessions at once.
func TestSchedulerSerialisesOneBrowser(t *testing.T) {
	var (
		mu       sync.Mutex
		active   = map[string]int{}
		overbook = map[string]bool{}
	)

	started := make(chan string, 8)
	release := make(chan struct{})

	runner := jobRunnerFunc(func(_ context.Context, j *job) {
		mu.Lock()
		active[j.name]++
		if active[j.name] > 1 {
			overbook[j.name] = true
		}
		mu.Unlock()

		started <- j.name

		<-release

		mu.Lock()
		active[j.name]--
		mu.Unlock()
	})

	s := newScheduler(runner, 4)
	s.printer = newProgressPrinter(io.Discard)

	jobs := []*job{
		{name: "chrome/32.0", state: newJobState()},
		{name: "chrome/32.0", state: newJobState()},
		{name: "chrome/33.0", state: newJobState()},
	}

	done := make(chan int, 1)

	go func() { done <- s.run(context.Background(), jobs) }()

	// Only one session per browser may start: chrome/32.0 and chrome/33.0. The
	// second chrome/32.0 waits for the first to finish.
	seen := map[string]int{}

	for i := 0; i < 2; i++ {
		select {
		case name := <-started:
			seen[name]++
		case <-time.After(2 * time.Second):
			t.Fatal("timed out waiting for the first sessions to start")
		}
	}

	if seen["chrome/32.0"] != 1 || seen["chrome/33.0"] != 1 {
		t.Fatalf("started sessions = %v, want one chrome/32.0 and one chrome/33.0", seen)
	}

	// A different browser was unaffected; the second chrome/32.0 must not start.
	select {
	case name := <-started:
		t.Fatalf("a second session for %s started while the first was running", name)
	case <-time.After(150 * time.Millisecond):
	}

	close(release)

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("the run did not finish after the sessions were released")
	}

	mu.Lock()
	bad := overbook["chrome/32.0"]
	mu.Unlock()

	if bad {
		t.Error("chrome/32.0 was driven by two sessions at once")
	}
}

// TestSchedulerRunsCombinationsBeforeIndividuals covers the two-pass order:
// every combination job runs before any individual job, with a pause between
// the passes.
func TestSchedulerRunsCombinationsBeforeIndividuals(t *testing.T) {
	var (
		mu    sync.Mutex
		order []bool
	)

	runner := jobRunnerFunc(func(_ context.Context, j *job) {
		mu.Lock()
		order = append(order, j.polyfillCombinations)
		mu.Unlock()

		j.state.complete(&pagecontract.Summary{}, 0)
	})

	s := newScheduler(runner, 1)
	s.printer = newProgressPrinter(io.Discard)
	s.passPause = 100 * time.Millisecond

	jobs := []*job{
		{name: "chrome/1.0", polyfillCombinations: true, state: newJobState()},
		{name: "chrome/1.0", state: newJobState()},
		{name: "edge/1.0", polyfillCombinations: true, state: newJobState()},
		{name: "edge/1.0", state: newJobState()},
	}

	start := time.Now()

	if failed := s.run(context.Background(), jobs); failed != 0 {
		t.Fatalf("run reported %d failures, want 0", failed)
	}

	elapsed := time.Since(start)

	mu.Lock()
	defer mu.Unlock()

	if len(order) != 4 {
		t.Fatalf("ran %d jobs, want 4", len(order))
	}

	for i, combined := range order {
		if i < 2 && !combined {
			t.Errorf("job %d was individual; the combination pass must run first", i)
		}

		if i >= 2 && combined {
			t.Errorf("job %d was a combination; the individual pass must run second", i)
		}
	}

	if elapsed < s.passPause {
		t.Errorf("run took %s, want at least the %s pass delay", elapsed, s.passPause)
	}
}

// TestSchedulerRunsEachBrowserInOrder covers ordered dispatch: a browser's
// jobs run one at a time in list order, and browsers start in list order.
func TestSchedulerRunsEachBrowserInOrder(t *testing.T) {
	var (
		mu    sync.Mutex
		order []string
	)

	runner := jobRunnerFunc(func(_ context.Context, j *job) {
		mu.Lock()
		order = append(order, j.trace)
		mu.Unlock()

		j.state.complete(&pagecontract.Summary{}, 0)
	})

	s := newScheduler(runner, 1)
	s.printer = newProgressPrinter(io.Discard)

	jobs := []*job{
		{name: "ie/9.0", shard: 1, trace: "a", state: newJobState()},
		{name: "ie/9.0", shard: 2, trace: "b", state: newJobState()},
		{name: "ie/10.0", shard: 1, trace: "c", state: newJobState()},
		{name: "ie/10.0", shard: 2, trace: "d", state: newJobState()},
	}

	s.run(context.Background(), jobs)

	mu.Lock()
	defer mu.Unlock()

	want := []string{"a", "b", "c", "d"}
	if !reflect.DeepEqual(order, want) {
		t.Errorf("run order = %v, want %v", order, want)
	}
}

// TestGroupByBrowserGroupsAllJobsForABrowser covers the invariant that one
// browser is one group even when its jobs are not adjacent, in first-appearance
// order.
func TestGroupByBrowserGroupsAllJobsForABrowser(t *testing.T) {
	jobs := []*job{
		{name: "a"},
		{name: "b"},
		{name: "a"},
		{name: "c"},
		{name: "b"},
	}

	want := [][]string{{"a", "a"}, {"b", "b"}, {"c"}}

	got := groupByBrowser(jobs)

	if len(got) != len(want) {
		t.Fatalf("grouped into %d groups, want %d", len(got), len(want))
	}

	for i, group := range got {
		var names []string
		for _, j := range group {
			names = append(names, j.name)
		}

		if !reflect.DeepEqual(names, want[i]) {
			t.Errorf("group %d = %v, want %v", i, names, want[i])
		}
	}
}

// TestSchedulerDoesNotLetAHungBrowserHoldOthersBack proves a browser whose
// session never starts holds only its own group back, not a later browser.
func TestSchedulerDoesNotLetAHungBrowserHoldOthersBack(t *testing.T) {
	hung := make(chan struct{})
	started := make(chan string, 2)

	runner := jobRunnerFunc(func(_ context.Context, j *job) {
		started <- j.name

		if j.name == "ie/9.0" {
			<-hung

			return
		}

		j.state.complete(&pagecontract.Summary{}, 0)
	})

	s := newScheduler(runner, 2)
	s.printer = newProgressPrinter(io.Discard)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	jobs := []*job{
		{name: "ie/9.0", state: newJobState()},
		{name: "ie/10.0", state: newJobState()},
	}

	done := make(chan int, 1)

	go func() { done <- s.run(ctx, jobs) }()

	seen := map[string]bool{}

	for i := 0; i < 2; i++ {
		select {
		case name := <-started:
			seen[name] = true
		case <-time.After(2 * time.Second):
			t.Fatal("a later browser did not start while an earlier one hung")
		}
	}

	if !seen["ie/9.0"] || !seen["ie/10.0"] {
		t.Fatalf("started = %v, want both browsers", seen)
	}

	close(hung)

	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("the run did not finish after the hung session was released")
	}
}

// TestConcurrencyForFollowsTheAccountPlan covers the local session limit.
func TestConcurrencyForFollowsTheAccountPlan(t *testing.T) {
	gateWith := func(plan browserstack.Plan, err error) *capacityGate {
		return &capacityGate{
			plan:     func(context.Context) (browserstack.Plan, error) { return plan, err },
			interval: time.Millisecond,
		}
	}

	roomy := options{testEverything: true, maxConcurrency: 4}

	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 10}, nil), roomy); got != 10 {
		t.Errorf("concurrencyFor = %d, want the whole allowance on a roomy plan", got)
	}

	if got := concurrencyFor(context.Background(), gateWith(browserstack.Plan{ParallelSessionsMaxAllowed: 2}, nil), roomy); got != 2 {
		t.Errorf("concurrencyFor = %d, want the whole allowance on a small plan", got)
	}

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

// TestPrintProgressOnlyPrintsChanges covers the output a CI log is made of.
func TestPrintProgressOnlyPrintsChanges(t *testing.T) {
	jobs := []*job{
		{name: "chrome/32.0", testMode: pagecontract.ModeAll, trace: "r1a2-001-chrome-32.0", state: newJobState()},
		{name: "ie/9.0", testMode: pagecontract.ModeTargeted, shard: 2, trace: "r1a2-007-ie-9.0", state: newJobState()},
	}

	jobs[0].state.setState("polling for results")

	printer := newProgressPrinter(io.Discard)

	first := captureProgress(t, printer, jobs)

	// A job that has not started yet is only counted, not described.
	if !strings.Contains(first, "polling for results") || strings.Contains(first, "chrome-32.0]") {
		t.Errorf("the running job is not reported:\n%s", first)
	}

	if !strings.Contains(first, "+ 1 job(s) queued") {
		t.Errorf("the job that has not started is not counted as queued:\n%s", first)
	}

	if again := captureProgress(t, printer, jobs); again != "" {
		t.Errorf("an unchanged run printed again:\n%s", again)
	}

	jobs[0].state.complete(&pagecontract.Summary{Passed: 12}, 30*time.Second)

	after := captureProgress(t, printer, jobs)

	if !strings.Contains(after, "✓ 12 tests") || !strings.Contains(after, "30 seconds to complete") {
		t.Errorf("a completed job is not reported:\n%s", after)
	}

	boom := errors.New("the remote machine died")
	jobs[0].state.setError(boom)

	failed := captureProgress(t, printer, jobs)

	if !strings.Contains(failed, "the remote machine died") ||
		!strings.Contains(failed, "[trace r1a2-001-chrome-32.0]") {
		t.Errorf("a failed job does not name its error and its own trace:\n%s", failed)
	}
}

func captureProgress(t *testing.T, printer *progressPrinter, jobs []*job) string {
	t.Helper()

	var buf bytes.Buffer

	printer.w = &buf
	printer.print(jobs)

	return buf.String()
}

// TestReportingHelpers covers the small renderers a failure report is built
// from.
func TestReportingHelpers(t *testing.T) {
	if got := (testserver.Stats{}).PathsSummary(); got != "nothing" {
		t.Errorf("PathsSummary() = %q, want %q", got, "nothing")
	}

	got := testserver.Stats{Paths: []string{"GET /", "GET /mocha.js", "GET /", "GET /mocha.js"}}.PathsSummary()
	if got != "GET /, GET /mocha.js" {
		t.Errorf("PathsSummary() = %q, want each request once, in the order it arrived", got)
	}

	// plural(1) must stay empty so a replacement reads as "1 session replaced".
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

	combined := (&job{testMode: pagecontract.ModeTargeted, polyfillCombinations: true}).configForLog()
	if !strings.Contains(combined, "targeted") || !strings.Contains(combined, "combined") {
		t.Errorf("configForLog = %q, want the mode and the combination", combined)
	}

	plain := (&job{testMode: pagecontract.ModeAll}).configForLog()
	if strings.Contains(plain, "combined") || strings.Contains(plain, "shard") {
		t.Errorf("configForLog = %q, want no combination or shard for a plain job", plain)
	}
}

// TestRequestURLMatchesTheMode covers the query string the browser is sent.
func TestRequestURLMatchesTheMode(t *testing.T) {
	origin := "http://bs-local.com:9876"

	individual := pagecontract.Request{Mode: pagecontract.ModeAll, Feature: "Promise", Trace: "r1a2-001"}.URL(origin)
	all := pagecontract.Request{Mode: pagecontract.ModeAll}.URL(origin)
	control := pagecontract.Request{Mode: pagecontract.ModeControl}.URL(origin)
	targeted := pagecontract.Request{Mode: pagecontract.ModeTargeted}.URL(origin)
	combined := pagecontract.Request{Mode: pagecontract.ModeAll, Shard: 1, PolyfillCombinations: true, Trace: "r1a2-002"}.URL(origin)
	directed := pagecontract.Request{Mode: pagecontract.ModeAll, Director: true}.URL(origin)

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

// TestJobsRunOldestBrowserFirst pins the run order: versions compare
// numerically, so "9.0" runs before "100.0", and families stay grouped.
func TestJobsRunOldestBrowserFirst(t *testing.T) {
	index := browserstack.NewIndex([]browserstack.Browser{
		{Browser: "chrome", BrowserVersion: "100.0"},
		{Browser: "chrome", BrowserVersion: "9.0"},
		{Browser: "chrome", BrowserVersion: "29.0"},
		{Browser: "firefox", BrowserVersion: "38.0"},
	})

	jobs := buildJobs(
		[]string{"chrome/100.0", "chrome/9.0", "chrome/29.0", "firefox/38.0"},
		index, options{testEverything: true}, "run1",
	)

	names := make([]string, 0, len(jobs))
	for _, j := range jobs {
		names = append(names, j.name)
	}

	want := []string{"chrome/9.0", "chrome/29.0", "chrome/100.0", "firefox/38.0"}

	if !reflect.DeepEqual(names, want) {
		t.Errorf("job order = %v, want %v", names, want)
	}
}

// fakeDriver is an in-memory adapter at the driver seam. Each ExecuteScript
// call is answered from a queue.
type fakeDriver struct {
	mu        sync.Mutex
	scripts   []any
	navigated bool
	deleted   bool
}

func (f *fakeDriver) Navigate(context.Context, string) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.navigated = true

	return nil
}

func (f *fakeDriver) ExecuteScript(_ context.Context, _ string, _ []any) (any, error) {
	f.mu.Lock()
	defer f.mu.Unlock()

	if len(f.scripts) == 0 {
		return nil, nil
	}

	next := f.scripts[0]
	f.scripts = f.scripts[1:]

	if err, ok := next.(error); ok {
		return nil, err
	}

	return next, nil
}

func (f *fakeDriver) Delete(context.Context) error {
	f.mu.Lock()
	defer f.mu.Unlock()

	f.deleted = true

	return nil
}

// readyPage is the readiness contract the runner polls for.
func readyPage() map[string]any {
	return map[string]any{"page": "runner", "started": true, "readyState": "complete"}
}

// completeResults is a finished page result set.
func completeResults() map[string]any {
	return map[string]any{"state": "complete", "passed": 7, "total": 7}
}

// traceServer answers the runner's trace-stats questions. gets is how many
// browser GETs the server reports.
func traceServer(t *testing.T, gets int) *httptest.Server {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(testserver.Stats{Requests: gets, Gets: gets, Paths: []string{"GET /"}})
	}))
	t.Cleanup(srv.Close)

	return srv
}

// testRunner builds a runner whose pauses are zero.
func testRunner(dial dialFunc, testServer *testserver.Client) *runner {
	return &runner{
		dial:       dial,
		testServer: testServer,
		gate:       newTestGate(staticPlan(browserstack.Plan{ParallelSessionsMaxAllowed: 5}), time.Hour),
		batchName:  "test-run",
	}
}

func testJob(name, trace string) *job {
	return &job{
		name:         name,
		url:          "http://bs-local.com:9876/test",
		expectedPage: "runner",
		trace:        trace,
		state:        newJobState(),
	}
}

// TestRunnerCompletesAJobThroughTheSeam drives a whole attempt — dial,
// navigate, arrival, page load, results — with a fake driver.
func TestRunnerCompletesAJobThroughTheSeam(t *testing.T) {
	stats := traceServer(t, 1)

	d := &fakeDriver{scripts: []any{readyPage(), completeResults()}}

	j := testJob("chrome/32.0", "r1-001-chrome-32.0")

	testRunner(func(context.Context, browserstack.Browser, string) (driver, error) {
		return d, nil
	}, testserver.New(stats.URL)).runJob(context.Background(), j)

	status := j.state.status()

	if status.err != nil {
		t.Fatalf("runJob recorded %v, want success", status.err)
	}

	if status.state != "complete" || status.results == nil || status.results.Passed != 7 {
		t.Errorf("state/results = %q/%+v, want complete with 7 passes", status.state, status.results)
	}

	if !d.navigated {
		t.Error("the driver was never navigated")
	}

	if !d.deleted {
		t.Error("the session was not deleted")
	}
}

// TestRunnerRetriesASessionThatFailsToStart covers the retry branch.
func TestRunnerRetriesASessionThatFailsToStart(t *testing.T) {
	stats := traceServer(t, 1)

	d := &fakeDriver{scripts: []any{readyPage(), completeResults()}}

	var calls int

	dial := func(context.Context, browserstack.Browser, string) (driver, error) {
		calls++

		if calls == 1 {
			return nil, errors.New("Failed to create session")
		}

		return d, nil
	}

	j := testJob("chrome/32.0", "r1-002-chrome-32.0")

	testRunner(dial, testserver.New(stats.URL)).runJob(context.Background(), j)

	status := j.state.status()

	if status.err != nil || status.state != "complete" || status.results == nil {
		t.Fatalf("runJob = (%q, %v, %+v), want a retried success", status.state, status.err, status.results)
	}

	if calls != 2 {
		t.Errorf("dial calls = %d, want 2 (one failure, one retry)", calls)
	}
}

// TestRunnerReplacesADeadSession covers the replacement branch: a session whose
// browser never issued a request is discarded and the job retried on a fresh
// one.
func TestRunnerReplacesADeadSession(t *testing.T) {
	var (
		mu       sync.Mutex
		requests int
	)

	stats := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		mu.Lock()
		requests++

		// The dead session never arrives; the replacement does.
		gets := 0
		if requests > 1 {
			gets = 1
		}
		mu.Unlock()

		_ = json.NewEncoder(w).Encode(testserver.Stats{Requests: gets, Gets: gets, Paths: []string{"GET /"}})
	}))
	defer stats.Close()

	dead := &fakeDriver{}
	live := &fakeDriver{scripts: []any{readyPage(), completeResults()}}

	var calls int

	dial := func(context.Context, browserstack.Browser, string) (driver, error) {
		calls++

		if calls == 1 {
			return dead, nil
		}

		return live, nil
	}

	j := testJob("chrome/32.0", "r1-003-chrome-32.0")

	testRunner(dial, testserver.New(stats.URL)).runJob(context.Background(), j)

	status := j.state.status()

	if status.err != nil || status.state != "complete" || status.results == nil {
		t.Fatalf("runJob = (%q, %v, %+v), want a replaced success", status.state, status.err, status.results)
	}

	if status.replacements != 1 {
		t.Errorf("replacements = %d, want 1", status.replacements)
	}

	if !dead.deleted {
		t.Error("the dead session was not deleted")
	}
}
