package pagecontract

import (
	"net/url"
	"strconv"
)

// Mode is a test configuration: which polyfills a page run includes.
type Mode string

const (
	ModeAll      Mode = "all"
	ModeControl  Mode = "control"
	ModeTargeted Mode = "targeted"
)

// Request is the query the harness sends to a test page: the request side of
// the page contract. The page reads these values and publishes its readiness
// and results back (State, Results).
type Request struct {
	// Mode selects which polyfills the page includes.
	Mode Mode
	// Director loads the director page instead of the runner page.
	Director bool
	// Feature restricts the run to a comma separated polyfill subset.
	Feature string
	// Shard selects one half of a slow browser's suite.
	Shard int
	// PolyfillCombinations asks the page to run polyfill combinations.
	PolyfillCombinations bool
	// Trace is the correlation id carried on every request the job makes.
	Trace string
}

// ExpectedPage names the page identity the request loads.
func (r Request) ExpectedPage() string {
	if r.Director {
		return "director"
	}

	return "runner"
}

// URL renders the request against a server origin.
func (r Request) URL(origin string) string {
	return r.render(origin, r.Feature)
}

// ReproduceURL renders the same request with the feature narrowed to one
// failing suite, so a failure can be re-run in isolation.
func (r Request) ReproduceURL(origin, suite string) string {
	return r.render(origin, suite)
}

// render builds the page URL. A non-empty feature overrides the request's own.
func (r Request) render(origin, feature string) string {
	path := "/test"
	if r.Director {
		path = "/"
	}

	values := url.Values{}
	values.Set("includePolyfills", r.Mode.includePolyfills())
	values.Set("always", r.Mode.always())

	if feature != "" {
		values.Set("feature", feature)
	}

	if r.PolyfillCombinations {
		values.Set("polyfillCombinations", "yes")
	}

	if r.Shard > 0 {
		values.Set("shard", strconv.Itoa(r.Shard))
	}

	// Carried on every sub-resource, so each test server request is attributed
	// to this job.
	if r.Trace != "" {
		values.Set("trace", r.Trace)
	}

	return origin + path + "?" + values.Encode()
}

// includePolyfills is the page's includePolyfills flag for a mode. A control
// run loads the page with no polyfills at all.
func (m Mode) includePolyfills() string {
	if m == ModeControl {
		return "no"
	}

	return "yes"
}

// always is the page's always flag for a mode. Only a targeted run lets the
// page skip the always-required polyfills.
func (m Mode) always() string {
	if m == ModeAll || m == ModeControl {
		return "yes"
	}

	return "no"
}
