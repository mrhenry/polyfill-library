package main

import (
	"fmt"
	"sync"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
)

// job is one browser session. Its identity fields are immutable once built;
// progress lives behind the state pointer. Every job mints its own state
// through newJob or variant, so a copy made while sharding or expanding
// combinations can never alias another job's progress.
type job struct {
	name    string
	browser browserstack.Browser

	// preferred is the platform requested on the first two sessions. Later
	// sessions omit it, which is what lets a retry land on any platform.
	preferred    browserstack.Browser
	hasPreferred bool

	testMode             pagecontract.Mode
	url                  string
	expectedPage         string
	trace                string
	shard                int
	polyfillCombinations bool

	// request is the page request this job loads. It is kept whole so a failure
	// report can render a reproduce URL from the job itself, rather than
	// rebuilding the request from the run's options.
	request pagecontract.Request

	state *jobState
}

// newJob mints a job and its progress together, so identity and state are never
// created apart.
func newJob(name string, browser browserstack.Browser, mode pagecontract.Mode, expectedPage, trace string) *job {
	return &job{
		name:         name,
		browser:      browser,
		testMode:     mode,
		expectedPage: expectedPage,
		trace:        trace,
		state:        newJobState(),
	}
}

// variant copies the job's identity fields and gives the copy its own progress.
// Sharding and combination expansion go through here, so a copy cannot share
// the state of the job it came from.
func (j *job) variant() *job {
	next := *j
	next.state = newJobState()

	return &next
}

// jobState is the mutable, concurrently accessed progress of one job.
type jobState struct {
	mu       sync.Mutex
	state    string
	results  *pagecontract.Summary
	progress *pagecontract.Results
	err      error
	duration time.Duration

	// replacements counts sessions discarded because their browser never issued
	// its navigation.
	replacements int

	// sessions are the BrowserStack session ids this job used, oldest first.
	// The last one produced the reported outcome, so it is the one to inspect.
	sessions []string
}

// jobStatus is one coherent view of a job's progress.
type jobStatus struct {
	state        string
	results      *pagecontract.Summary
	progress     *pagecontract.Results
	duration     time.Duration
	replacements int
	err          error
}

// outcome is the single decision about a job's result: whether it passed
// cleanly, failed with results, or ended without results. The scheduler's
// tally, the failure report and the session prefetch all read this rather than
// re-deriving it, so there is one definition of "did this job fail".
type outcome int

const (
	// outcomePassed: completed with results and no failing tests.
	outcomePassed outcome = iota
	// outcomeFailed: completed with at least one failing test.
	outcomeFailed
	// outcomeUnfinished: ended without results, by error, timeout or deadline.
	outcomeUnfinished
)

// outcome classifies the snapshot. A job that reported results and no failures
// but never reached the complete state has not passed: it ended early.
func (s jobStatus) outcome() outcome {
	switch {
	case s.results != nil && s.results.Failed > 0:
		return outcomeFailed
	case s.results != nil && s.err == nil && s.state == "complete":
		return outcomePassed
	default:
		return outcomeUnfinished
	}
}

// passed reports whether the job completed cleanly, the one predicate every
// reader asks instead of re-deriving.
func (s jobStatus) passed() bool {
	return s.outcome() == outcomePassed
}

func newJobState() *jobState {
	return &jobState{state: "ready"}
}

func (s *jobState) setState(state string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.state = state
}

func (s *jobState) setReplacementCount(n int) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.replacements = n
}

// addSession records a BrowserStack session id this job started.
func (s *jobState) addSession(id string) {
	if id == "" {
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.sessions = append(s.sessions, id)
}

// lastSessionID is the session that produced the job's outcome, or "" if no
// session ever started.
func (s *jobState) lastSessionID() string {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.sessions) == 0 {
		return ""
	}

	return s.sessions[len(s.sessions)-1]
}

func (s *jobState) setError(err error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.err = err
	s.state = "error"
}

func (s *jobState) recordProgress(progress *pagecontract.Results) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.progress = progress
	s.state = "running"
}

func (s *jobState) complete(results *pagecontract.Summary, duration time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.results = results
	s.duration = duration
	s.state = "complete"
}

func (s *jobState) status() jobStatus {
	s.mu.Lock()
	defer s.mu.Unlock()

	return jobStatus{
		state:        s.state,
		results:      s.results,
		progress:     s.progress,
		duration:     s.duration,
		replacements: s.replacements,
		err:          s.err,
	}
}

// browserFor returns the platform for a session, relaxing the pinned one from
// the third session so a retry can land on any platform.
func (j *job) browserFor(sessionIndex int) browserstack.Browser {
	if sessionIndex < 2 && j.hasPreferred {
		return j.preferred
	}

	return j.browser
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
