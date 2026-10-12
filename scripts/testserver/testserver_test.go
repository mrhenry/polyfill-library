package testserver

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// statsServer answers trace-stats questions with a fixed Stats.
func statsServer(t *testing.T, stats Stats) *httptest.Server {
	t.Helper()

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_ = json.NewEncoder(w).Encode(stats)
	}))
	t.Cleanup(srv.Close)

	return srv
}

// TestPathsSummary covers the render of a job's requests: deduplicated, in
// arrival order.
func TestPathsSummary(t *testing.T) {
	if got := (Stats{}).PathsSummary(); got != "nothing" {
		t.Errorf("PathsSummary() = %q, want %q", got, "nothing")
	}

	got := Stats{Paths: []string{"GET /", "GET /mocha.js", "GET /", "GET /mocha.js"}}.PathsSummary()
	if got != "GET /, GET /mocha.js" {
		t.Errorf("PathsSummary() = %q, want each request once, in the order it arrived", got)
	}
}

// TestStats covers decoding the server's record of one trace.
func TestStats(t *testing.T) {
	want := Stats{Requests: 4, Gets: 3, Paths: []string{"GET /", "GET /mocha.js"}}

	srv := statsServer(t, want)

	got, err := New(srv.URL).Stats(context.Background(), "r1-001")
	if err != nil {
		t.Fatal(err)
	}

	if got.Requests != want.Requests || got.Gets != want.Gets || len(got.Paths) != len(want.Paths) {
		t.Errorf("Stats() = %+v, want %+v", got, want)
	}
}

// TestWaitForArrivalIgnoresTheProbe covers the detection the fast retry depends
// on: BrowserStack's HEAD probe is not the browser's own request.
func TestWaitForArrivalIgnoresTheProbe(t *testing.T) {
	for _, tt := range []struct {
		name        string
		stats       Stats
		wantArrived bool
	}{
		{name: "only BrowserStack's probe arrived", stats: Stats{Requests: 1, Paths: []string{"HEAD /"}}},
		{name: "nothing at all", stats: Stats{}},
		{name: "the browser asked", stats: Stats{Requests: 2, Gets: 1, Paths: []string{"HEAD /", "GET /"}}, wantArrived: true},
	} {
		t.Run(tt.name, func(t *testing.T) {
			srv := statsServer(t, tt.stats)

			_, arrived, err := New(srv.URL).WaitForArrival(context.Background(), "r1-002", 50*time.Millisecond)
			if err != nil {
				t.Fatal(err)
			}

			if arrived != tt.wantArrived {
				t.Errorf("arrived = %v, want %v", arrived, tt.wantArrived)
			}
		})
	}
}

// TestWaitForArrivalReportsTheStats proves the caller can describe what the
// server did see when the browser never arrived.
func TestWaitForArrivalReportsTheStats(t *testing.T) {
	srv := statsServer(t, Stats{Requests: 1, Paths: []string{"HEAD /"}})

	stats, arrived, err := New(srv.URL).WaitForArrival(context.Background(), "r1-003", 10*time.Millisecond)
	if err != nil {
		t.Fatal(err)
	}

	if arrived {
		t.Fatal("arrived = true, want false when only the probe was seen")
	}

	if stats.Requests != 1 {
		t.Errorf("stats = %+v, want the server's record so the caller can explain the failure", stats)
	}
}

// TestEnsureReachable covers the reachability probe CI relies on.
func TestEnsureReachable(t *testing.T) {
	healthy := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer healthy.Close()

	if err := New(healthy.URL).EnsureReachable(context.Background(), time.Second, 10*time.Millisecond); err != nil {
		t.Errorf("a healthy server should be reachable: %v", err)
	}

	unready := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer unready.Close()

	if err := New(unready.URL).EnsureReachable(context.Background(), 30*time.Millisecond, 5*time.Millisecond); err == nil {
		t.Error("a server that is not ready should not be reachable")
	}

	cancelled, cancel := context.WithCancel(context.Background())
	cancel()

	if err := New(healthy.URL).EnsureReachable(cancelled, time.Second, 10*time.Millisecond); err == nil {
		t.Error("a cancelled context should not be reachable")
	}
}
