// Package testserver is the seam to the local JavaScript test server that
// serves the test pages and records the requests each job made.
//
// It owns the trace protocol: a job's correlation id is carried on every
// request the browser makes, and the server reports back what a trace
// requested. It also owns the reachability probe the harness uses while CI
// starts the server beside it. It is not BrowserStack.
package testserver

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// StatsTimeout bounds the question asked of the test server, a local process
// that either answers immediately or is gone.
const StatsTimeout = 5 * time.Second

// inspectParam is how the harness asks the test server about a trace. It
// differs from the parameter browsers send, so a poll is not counted as a
// measured request.
const inspectParam = "inspect-trace"

// readyTarget is the request that proves the test server is serving pages.
const readyTarget = "/test?includePolyfills=yes&always=no"

// arrivalPollInterval is how often WaitForArrival asks the test server.
const arrivalPollInterval = 200 * time.Millisecond

// probeTimeout bounds a single reachability probe.
const probeTimeout = 500 * time.Millisecond

// Stats is what the test server recorded for one job.
type Stats struct {
	Requests int `json:"requests"`
	// Gets counts only the browser's own requests; BrowserStack probes the
	// session URL with a HEAD carrying the same trace.
	Gets  int      `json:"gets"`
	Paths []string `json:"paths"`
}

// PathsSummary renders the requests a job made, in order and deduplicated.
func (s Stats) PathsSummary() string {
	if len(s.Paths) == 0 {
		return "nothing"
	}

	unique := map[string]bool{}
	order := make([]string, 0, len(s.Paths))

	for _, path := range s.Paths {
		if !unique[path] {
			unique[path] = true

			order = append(order, path)
		}
	}

	return strings.Join(order, ", ")
}

// Client talks to the test server running on this machine.
type Client struct {
	baseURL string
	http    *http.Client
}

// New builds a Client for the test server at baseURL.
func New(baseURL string) *Client {
	return &Client{baseURL: baseURL, http: &http.Client{Timeout: StatsTimeout}}
}

// Stats asks the test server what a trace requested.
func (c *Client) Stats(ctx context.Context, trace string) (Stats, error) {
	var stats Stats

	target := fmt.Sprintf("%s/__trace-stats?%s=%s",
		c.baseURL, inspectParam, url.QueryEscape(trace))

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return stats, err
	}

	res, err := c.http.Do(req)
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

// WaitForArrival reports whether the browser's own request reached the test
// server within budget.
//
// Only the browser's GETs come from a navigation, so a GET is awaited rather
// than any request; BrowserStack's own probe is a HEAD.
func (c *Client) WaitForArrival(ctx context.Context, trace string, budget time.Duration) (Stats, bool, error) {
	deadline := time.Now().Add(budget)

	for {
		stats, err := c.Stats(ctx, trace)
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
		case <-time.After(arrivalPollInterval):
		}
	}
}

// EnsureReachable waits until the test server answers. It polls because CI
// starts the server beside this process, so a single probe can lose the race.
func (c *Client) EnsureReachable(ctx context.Context, budget, interval time.Duration) error {
	deadline := time.Now().Add(budget)

	var lastErr error

	for {
		probeCtx, cancel := context.WithTimeout(ctx, probeTimeout)
		lastErr = c.probe(probeCtx)
		cancel()

		if lastErr == nil {
			return nil
		}

		if time.Now().After(deadline) {
			return lastErr
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(interval):
		}
	}
}

// probe makes one reachability request against the test server.
func (c *Client) probe(ctx context.Context) error {
	target := c.baseURL + readyTarget

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return err
	}

	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("test server returned %d for %s", res.StatusCode, target)
	}

	return nil
}
