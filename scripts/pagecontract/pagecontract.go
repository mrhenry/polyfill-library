// Package pagecontract owns the contract between the JavaScript test pages and
// the Go harness.
//
// The pages publish readiness and results as globals (window.global_test_*);
// this package holds the injected scripts that read them, the shapes they are
// decoded into, and the translation into the harness summary written to the
// results file. It is pure: it never talks to a browser, so a caller decodes the
// WebDriver execute value and passes it in.
package pagecontract

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"
)

// ReadinessScript reads the contract the test pages publish. Every field it
// touches is written by test-runner.handlebars or test-director.handlebars, so
// a rename there fails a test rather than silently reading undefined.
const ReadinessScript = `
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

// ProgressScript reads whichever result object the page has published.
const ProgressScript = `return window.global_test_results || window.global_test_progress;`

// State is the readiness contract the test pages publish, as read back over the
// WebDriver execute command.
type State struct {
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

// Ready decides whether the page has started, and reports a mismatch between
// the page served and the page requested.
//
// The pages declare their own identity because the director page keeps mocha
// inside an iframe, so `typeof mocha` is always "undefined" there.
func (p State) Ready(expected string) (bool, error) {
	// A page that declares itself as something else means the harness is
	// driving the wrong page, so fail rather than waiting out the timeout.
	if p.Page != "" && p.Page != expected {
		return false, fmt.Errorf(
			"loaded the %q page but the %q page was requested: harness and test page disagree",
			p.Page, expected)
	}

	return p.Page == expected && p.Started, nil
}

// Describe renders the state for an error message, including the page's own
// asset diagnostics so a failure names what broke.
func (p State) Describe(expected string) string {
	return fmt.Sprintf(
		"the %q page never started (readyState=%q, page=%q, started=%t, url=%q, title=%q)%s",
		expected, p.ReadyState, p.Page, p.Started, p.Href, p.Title, describeAssets(p.Assets))
}

// ParseState decodes the value ReadinessScript returned.
func ParseState(value any) State {
	fields, _ := value.(map[string]any)

	state := State{}

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

// Results mirrors the object the test page writes to window.global_test_results
// and window.global_test_progress.
type Results struct {
	State                string          `json:"state"`
	Passed               int             `json:"passed"`
	Failed               int             `json:"failed"`
	Total                int             `json:"total"`
	Tests                []FailingTest   `json:"tests"`
	FailingSuites        map[string]bool `json:"failingSuites"`
	TestedSuites         []string        `json:"testedSuites"`
	RunnerCompletedCount int             `json:"runnerCompletedCount"`
	RunnerCount          int             `json:"runnerCount"`

	// Assets is the page's record of which scripts loaded or failed.
	Assets map[string]any `json:"assets"`
}

// ParseResults decodes the value ProgressScript returned.
func ParseResults(value any) (*Results, error) {
	raw, err := json.Marshal(value)
	if err != nil {
		return nil, err
	}

	results := &Results{}
	if err := json.Unmarshal(raw, results); err != nil {
		return nil, fmt.Errorf("parsing page results: %w", err)
	}

	return results, nil
}

// Summary is the shape written to the results file.
type Summary struct {
	Passed        int           `json:"passed"`
	Failed        int           `json:"failed"`
	FailingTests  []FailingTest `json:"failingTests"`
	FailingSuites []string      `json:"failingSuites"`
	TestedSuites  []string      `json:"testedSuites"`

	// Assets is the page's own record of which scripts loaded or failed.
	Assets map[string]any `json:"assets,omitempty"`

	// SessionReplacements counts sessions this job discarded because their
	// browser never issued its navigation. Omitted when zero.
	SessionReplacements int `json:"sessionReplacements,omitempty"`
}

// FailingTest is one failing test as the page reported it.
type FailingTest struct {
	Name         string `json:"name"`
	Result       bool   `json:"result"`
	Message      string `json:"message"`
	Stack        string `json:"stack"`
	FailingSuite string `json:"failingSuite"`
}

// Summary translates the page's result object into the harness summary.
func (r *Results) Summary() *Summary {
	failingSuites := make([]string, 0, len(r.FailingSuites))
	for suite := range r.FailingSuites {
		failingSuites = append(failingSuites, suite)
	}

	sort.Strings(failingSuites)

	if r.Tests == nil {
		r.Tests = []FailingTest{}
	}

	return &Summary{
		Passed:        r.Passed,
		Failed:        r.Failed,
		FailingTests:  r.Tests,
		FailingSuites: failingSuites,
		TestedSuites:  r.TestedSuites,
		Assets:        r.Assets,
	}
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
