package pagecontract

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

func repoRoot(t *testing.T) string {
	t.Helper()

	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}

	// scripts/pagecontract -> repo root
	return filepath.Join(dir, "..", "..")
}

// TestStateReady covers the readiness decision, which the harness used to make
// by sniffing for `mocha`, always absent on the director page.
func TestStateReady(t *testing.T) {
	cases := []struct {
		name      string
		state     State
		expected  string
		wantReady bool
		wantErr   bool
	}{
		{
			name:      "director page that started is ready",
			state:     State{Page: "director", Started: true, ReadyState: "complete"},
			expected:  "director",
			wantReady: true,
		},
		{
			name:      "runner page that started is ready",
			state:     State{Page: "runner", Started: true, ReadyState: "complete"},
			expected:  "runner",
			wantReady: true,
		},
		{
			name:     "declared page must match the requested page",
			state:    State{Page: "runner", Started: true},
			expected: "director",
			wantErr:  true,
		},
		{
			name:      "page that has not started yet is not ready",
			state:     State{Page: "director", Started: false, ReadyState: "loading"},
			expected:  "director",
			wantReady: false,
		},
		{
			name:      "undeclared page is not an error yet, just not ready",
			state:     State{Page: "", Started: false, ReadyState: "complete"},
			expected:  "director",
			wantReady: false,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			ready, err := tc.state.Ready(tc.expected)

			if tc.wantErr {
				if err == nil {
					t.Fatalf("Ready() error = nil, want an error about the wrong page")
				}

				return
			}

			if err != nil {
				t.Fatalf("Ready() unexpected error: %v", err)
			}

			if ready != tc.wantReady {
				t.Errorf("Ready() ready = %t, want %t", ready, tc.wantReady)
			}
		})
	}
}

// TestDescribeAssetsNamesTheBrokenAsset proves a failure message names the
// script that broke.
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

func TestParseState(t *testing.T) {
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

	got := ParseState(value)

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

// TestProbeMatchesPagesItPolls guards the contract between the Go probe and the
// pages it polls, so a renamed global fails here.
func TestProbeMatchesPagesItPolls(t *testing.T) {
	root := repoRoot(t)

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
		if !strings.Contains(ReadinessScript, global) {
			t.Errorf("ReadinessScript does not read %q", global)
		}
	}
}

// TestDirectorPassesAssetsThrough covers surfacing iframe diagnostics to the
// top window the driver polls.
func TestDirectorPassesAssetsThrough(t *testing.T) {
	raw, err := os.ReadFile(filepath.Join(repoRoot(t), "test/polyfills/test-director.handlebars"))
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

// TestResultsSummary covers the shape test/polyfills/compat.js reads: a missing
// failingSuites must become an empty list rather than null.
func TestResultsSummary(t *testing.T) {
	summary := (&Results{
		State:  "complete",
		Passed: 3,
		Failed: 1,
		Tests:  []FailingTest{{Name: "a", FailingSuite: "one"}},
		FailingSuites: map[string]bool{
			"two": true,
			"one": true,
		},
		TestedSuites: []string{"one", "two"},
		Assets:       map[string]any{"failed": []any{"polyfill.test.js"}},
	}).Summary()

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

	bare := (&Results{Passed: 1}).Summary()

	if bare.FailingSuites == nil || len(bare.FailingSuites) != 0 {
		t.Errorf("FailingSuites = %v, want an empty list", bare.FailingSuites)
	}
}
