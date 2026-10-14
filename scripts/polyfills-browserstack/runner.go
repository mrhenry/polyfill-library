package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
	"github.com/mrhenry/polyfill-library/scripts/testserver"
)

// dialFunc starts one browser session. The production adapter is
// browserstack.Client.Dial; tests return a fake driver.
type dialFunc func(ctx context.Context, browser browserstack.Browser, sessionName string) (browserstack.Driver, error)

// runner drives jobs to completion across the driver seam. Every collaborator
// is injected so the retry and replacement policy can be exercised without a
// real browser.
type runner struct {
	dial       dialFunc
	testServer *testserver.Client
	gate       *capacityGate
	batchName  string

	// arrivalGrace bounds how long a navigation is given to produce its first
	// request before the session is treated as dead.
	arrivalGrace time.Duration

	// jobTimeout bounds a whole job across every attempt and replacement, so a
	// browser that keeps making just enough progress cannot run forever. Time
	// spent queueing for account capacity is not counted against it.
	jobTimeout time.Duration

	// retryPause and replacementPause are the waits before a retry and before a
	// replacement session. Injected so tests do not sleep the real delays.
	retryPause       time.Duration
	replacementPause time.Duration
}

// newRunner builds the production runner with the measured timing defaults.
func newRunner(dial dialFunc, testServer *testserver.Client, gate *capacityGate, batchName string) *runner {
	return &runner{
		dial:             dial,
		testServer:       testServer,
		gate:             gate,
		batchName:        batchName,
		arrivalGrace:     arrivalGrace,
		jobTimeout:       defaultJobTimeout,
		retryPause:       retryDelay,
		replacementPause: replacementDelay,
	}
}

// action is what runJob should do after an attempt fails.
type action int

const (
	// actionFail gives up and records the error.
	actionFail action = iota
	// actionRetryStart retries the whole attempt after a pause.
	actionRetryStart
	// actionReplaceSession discards the session and starts again immediately.
	actionReplaceSession
)

// nextAction decides how to recover from a failed attempt. A session whose
// browser never issued its navigation, whose renderer crashed, or that stopped
// answering is replaced; a session that could not start is retried.
func nextAction(err error, replacements int) action {
	switch {
	case errors.Is(err, ErrNoBrowserRequest),
		errors.Is(err, browserstack.ErrPageCrash),
		errors.Is(err, browserstack.ErrCommandTimeout):
		if replacements >= sessionReplacements {
			return actionFail
		}

		return actionReplaceSession
	case browserstack.IsSessionStartFailure(err):
		return actionRetryStart
	default:
		return actionFail
	}
}

// runJob drives one browser to completion.
//
// A session that cannot start consumes one of maxAttempts start attempts; a
// session that started but is unusable is replaced without consuming one, up to
// sessionReplacements times.
func (r *runner) runJob(ctx context.Context, j *job) {
	var (
		lastErr      error
		replacements int
		sessions     int
		attempts     int

		// jobDeadline is when the job's budget runs out. It is pushed forward by
		// time spent queueing for account capacity, so queueing is not counted
		// against the job's browser work.
		jobDeadline time.Time

		cancelJob context.CancelFunc
	)

	defer func() {
		if cancelJob != nil {
			cancelJob()
		}
	}()

	for {
		if ctx.Err() != nil {
			return
		}

		j.state.setState("waiting for account capacity")

		queuedAt := time.Now()

		// Hold the session back while the account has no free parallel slot,
		// rather than requesting one that will queue and time out. This wait is
		// bounded by the run, not the job budget: queueing for a slot is not
		// browser work, so it must not exhaust the budget.
		if err := r.gate.wait(ctx); err != nil {
			return
		}

		if jobDeadline.IsZero() {
			// One budget covers every attempt and replacement, so retrying or
			// replacing a session cannot multiply it.
			jobDeadline = time.Now().Add(r.jobTimeout)
		} else {
			jobDeadline = jobDeadline.Add(time.Since(queuedAt))
		}

		if !time.Now().Before(jobDeadline) {
			// The budget ran out before this attempt could start, so the slot
			// just acquired has to go back.
			r.gate.release()
			j.state.setError(r.budgetError(j, lastErr))

			return
		}

		if cancelJob != nil {
			cancelJob()
		}

		jobCtx, cancel := context.WithDeadline(ctx, jobDeadline)
		cancelJob = cancel

		lastErr = r.runJobOnce(jobCtx, j, sessions)
		sessions++

		if lastErr == nil {
			return
		}

		// A run that is shutting down is not a job failure, so it is left
		// unrecorded.
		if ctx.Err() != nil {
			return
		}

		// The job's own budget may have elapsed mid-attempt, in which case the
		// returned error is a bare deadline that names nothing useful. The
		// attempt has already released its slot.
		if errors.Is(jobCtx.Err(), context.DeadlineExceeded) {
			j.state.setError(r.budgetError(j, lastErr))

			return
		}

		switch nextAction(lastErr, replacements) {
		case actionFail:
			if browserstack.IsSessionStartFailure(lastErr) {
				slog.Error("job failed", "browser", j.name, "error", lastErr)
			}

			j.state.setError(lastErr)

			return

		case actionRetryStart:
			attempts++

			if attempts >= maxAttempts {
				j.state.setError(lastErr)

				return
			}

			j.state.setState(fmt.Sprintf("retrying browser -- attempt %d", attempts+1))

			slog.Warn("retrying session start", "browser", j.name, "error", lastErr)

			select {
			case <-jobCtx.Done():
				// Handled by the budget check at the top of the loop.
			case <-time.After(r.retryPause):
			}

		case actionReplaceSession:
			replacements++

			j.state.setReplacementCount(replacements)
			j.state.setState("session unusable, replacing it")

			slog.Warn("replacing unusable session", "browser", j.name, "error", lastErr)

			// Give BrowserStack a moment to release the discarded machine;
			// otherwise browsers with a small pool queue the replacement and
			// that queue becomes a start timeout.
			select {
			case <-jobCtx.Done():
				// Handled by the budget check at the top of the loop.
			case <-time.After(r.replacementPause):
			}
		}
	}
}

// budgetError names the job budget, keeping the last failure when it says
// something a bare deadline does not.
func (r *runner) budgetError(j *job, lastErr error) error {
	at := fmt.Sprintf("job exceeded the %s budget at %q on %q", r.jobTimeout, j.state.status().state, j.name)

	if lastErr == nil || errors.Is(lastErr, context.DeadlineExceeded) || errors.Is(lastErr, context.Canceled) {
		return errors.New(at)
	}

	return fmt.Errorf("%s: %w", at, lastErr)
}

// runJobOnce is a single attempt: dial, navigate, wait for the browser's first
// request, wait for the page, then poll for results. The caller holds the
// account capacity slot this attempt uses.
func (r *runner) runJobOnce(ctx context.Context, j *job, sessionIndex int) error {
	j.state.setState("connecting to browser")

	sessionCtx, cancelSession := context.WithTimeout(ctx, sessionStartTimeout)

	browser := j.browserFor(sessionIndex)

	sessionName := sessionLabel(r.batchName, j, browser)

	session, err := r.dial(sessionCtx, browser, sessionName)
	cancelSession()

	if err != nil {
		r.gate.release()

		// Tagged so the retry policy knows this is a session start, however it
		// failed, rather than a broken page or suite.
		return fmt.Errorf("%w: %w", browserstack.ErrSessionStart, err)
	}

	// Recorded before anything can fail, so a failure report can point at the
	// session that ran this attempt.
	j.state.addSession(session.ID())

	// Runs even when a later step fails, so a dead job cannot hold a parallel
	// slot.
	defer func() {
		deleteCtx, cancelDelete := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
		defer cancelDelete()

		if err := session.Delete(deleteCtx); err != nil {
			slog.Warn("deleting session", "browser", j.name, "error", err)
		}

		r.gate.release()
	}()

	j.state.setState("initializing browser")

	navigatedAt := time.Now()

	if err := session.Navigate(ctx, j.url); err != nil {
		return err
	}

	navigateFor := time.Since(navigatedAt)

	// Establish that the browser actually asked for something before spending
	// the page load budget waiting for a page that was never requested.
	stats, arrived, err := r.testServer.WaitForArrival(ctx, j.trace, r.arrivalGrace)
	if err != nil {
		return fmt.Errorf("%s: asking the test server what this job requested: %w", j.name, err)
	}

	if !arrived {
		return &noBrowserRequestError{trace: j.trace, stats: stats, navigateFor: navigateFor}
	}

	// Polling for results alone cannot tell "still running" from "never loaded".
	if err := r.waitForPageLoad(ctx, session, j, j.expectedPage); err != nil {
		return err
	}

	j.state.setState("polling for results")

	return r.pollForResults(ctx, session, j)
}

// waitForPageLoad polls until the test page has declared its identity and
// started.
func (r *runner) waitForPageLoad(ctx context.Context, session browserstack.Driver, j *job, expected string) error {
	deadline := time.Now().Add(pageLoadTimeout)

	var last pagecontract.State

	for {
		value, err := session.ExecuteScript(ctx, pagecontract.ReadinessScript, nil)
		if err != nil {
			return err
		}

		last = pagecontract.ParseState(value)

		ready, err := last.Ready(expected)
		if err != nil {
			return fmt.Errorf("%s: %w", j.name, err)
		}

		if ready {
			j.state.setState("page loaded")

			return nil
		}

		if time.Now().After(deadline) {
			return r.pageLoadFailure(ctx, j, last, expected)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

// pageLoadFailure delegates to the package-level reporter.
func (r *runner) pageLoadFailure(ctx context.Context, j *job, last pagecontract.State, expected string) error {
	return pageLoadFailure(ctx, r.testServer, j.name, j.trace, last, expected)
}

func (r *runner) pollForResults(ctx context.Context, session browserstack.Driver, j *job) error {
	startedAt := time.Now()
	lastUpdatedAt := startedAt

	var lastSeen int

	for {
		value, err := session.ExecuteScript(ctx, pagecontract.ProgressScript, nil)
		if err != nil {
			return err
		}

		if value != nil {
			progress, err := pagecontract.ParseResults(value)
			if err != nil {
				return err
			}

			switch progress.State {
			case "complete":
				j.state.complete(progress.Summary(), time.Since(startedAt))

				return nil

			case "running":
				if progress.RunnerCompletedCount != lastSeen {
					lastSeen = progress.RunnerCompletedCount
					lastUpdatedAt = time.Now()

					j.state.recordProgress(progress)
				}
			}
		}

		// Only a run that stops making progress counts as a timeout, so a slow
		// but progressing browser is not killed.
		if time.Since(lastUpdatedAt) > testBrowserTimeout {
			current := j.state.status().state
			timedOut := fmt.Errorf("timed out at %q on %q", current, j.name)
			j.state.setError(timedOut)

			return timedOut
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}
