package main

import (
	"fmt"
	"sync"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
)

// job is one browser session. The value is immutable once built; progress is
// held behind a pointer so jobs can be copied cheaply when polyfill
// combinations expand the matrix.
type job struct {
	name    string
	browser browserstack.Browser

	// preferred is the platform requested on the first session, when the
	// browser has one. Later sessions omit it so BrowserStack can pick any
	// platform, which is what makes a retry relax the preference.
	preferred    browserstack.Browser
	hasPreferred bool

	testMode             mode
	url                  string
	expectedPage         string
	trace                string
	shard                int
	polyfillCombinations bool

	state *jobState
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
	// its navigation. Reported rather than dropped so the run's health stays
	// visible.
	replacements int
}

// jobStatus is one coherent view of a job's progress. Callers read the fields
// they need by name, rather than decoding a tuple as wide as the state it
// guards.
type jobStatus struct {
	state        string
	results      *pagecontract.Summary
	progress     *pagecontract.Results
	duration     time.Duration
	replacements int
	err          error
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

// status returns one coherent view of the job's progress.
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

func (s *jobState) failed() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.err != nil || s.results == nil || s.results.Failed > 0
}

// browserFor returns the platform for a session, relaxing the pinned one after
// the first attempt so a retry can land on any platform.
func (j *job) browserFor(sessionIndex int) browserstack.Browser {
	if sessionIndex == 0 && j.hasPreferred {
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
