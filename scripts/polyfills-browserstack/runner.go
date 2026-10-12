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

// driver is the slice of a WebDriver session the runner needs: the seam between
// the runner and a browser. Production wraps browserstack.Session; tests fake it.
type driver interface {
	Navigate(ctx context.Context, target string) error
	ExecuteScript(ctx context.Context, script string, args []any) (any, error)
	Delete(ctx context.Context) error
}

// dialFunc starts one browser session. The production adapter builds
// capabilities and calls BrowserStack; tests return a fake driver.
type dialFunc func(ctx context.Context, browser browserstack.Browser, sessionName string) (driver, error)

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
	// browser that keeps making just enough progress cannot run forever.
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
		jobTimeout:       jobTimeout,
		retryPause:       retryDelay,
		replacementPause: replacementDelay,
	}
}

// browserstackDial is the production adapter at the dial seam.
func browserstackDial(client *browserstack.Client, credentials browserstack.Credentials) dialFunc {
	return func(ctx context.Context, browser browserstack.Browser, sessionName string) (driver, error) {
		caps := browserstack.CapabilitiesFor(browser, sessionName, projectName, "")

		session, err := browserstack.NewSession(ctx, client.HTTPClient(), browserstack.Hub(), caps, credentials)
		if err != nil {
			return nil, err
		}

		return session, nil
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
	// One budget covers every attempt and replacement, so retrying or replacing
	// a session cannot multiply it.
	jobCtx, cancel := context.WithTimeout(ctx, r.jobTimeout)
	defer cancel()

	var (
		lastErr      error
		replacements int
		sessions     int
		attempts     int
	)

	for {
		if r.shouldStop(jobCtx, ctx, j) {
			return
		}

		lastErr = r.runJobOnce(jobCtx, j, sessions)
		sessions++

		if lastErr == nil {
			return
		}

		// The job's own budget may have elapsed mid-attempt, in which case the
		// returned error is a bare deadline that names nothing useful.
		if r.shouldStop(jobCtx, ctx, j) {
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
				// Handled by shouldStop at the top of the loop.
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
				// Handled by shouldStop at the top of the loop.
			case <-time.After(r.replacementPause):
			}
		}
	}
}

// shouldStop reports whether the job must stop before its next attempt. A run
// that is shutting down is not a job failure, so it is left unrecorded; a job
// that exhausted its own budget is recorded with a name for the failure.
func (r *runner) shouldStop(jobCtx, runCtx context.Context, j *job) bool {
	switch {
	case runCtx.Err() != nil:
		return true
	case errors.Is(jobCtx.Err(), context.DeadlineExceeded):
		j.state.setError(fmt.Errorf("job exceeded the %s budget at %q on %q",
			r.jobTimeout, j.state.status().state, j.name))

		return true
	default:
		return false
	}
}

// runJobOnce is a single attempt: dial, navigate, wait for the browser's first
// request, wait for the page, then poll for results.
func (r *runner) runJobOnce(ctx context.Context, j *job, sessionIndex int) error {
	j.state.setState("waiting for account capacity")

	// Hold the session back while the account has no free parallel slot, rather
	// than requesting one that will queue and time out.
	if err := r.gate.wait(ctx); err != nil {
		return err
	}

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
func (r *runner) waitForPageLoad(ctx context.Context, session driver, j *job, expected string) error {
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

func (r *runner) pollForResults(ctx context.Context, session driver, j *job) error {
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
