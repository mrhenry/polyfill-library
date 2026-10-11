package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
)

// driver is the slice of a WebDriver session the job runner needs. It is the
// seam between the runner and a browser: the production adapter wraps
// browserstack.Session, and tests supply an in-memory fake. Two adapters, so the
// seam is real.
type driver interface {
	Navigate(ctx context.Context, target string) error
	ExecuteScript(ctx context.Context, script string, args []any) (any, error)
	Delete(ctx context.Context) error
}

// dialFunc starts one browser session. The production adapter builds
// capabilities and calls BrowserStack; tests return a fake driver.
type dialFunc func(ctx context.Context, browser browserstack.Browser, sessionName string) (driver, error)

// runner drives jobs to completion across the driver seam.
//
// Every collaborator is injected so the retry and replacement policy can be
// exercised without a real browser: the dial adapter, the trace-stats server,
// the capacity gate, and the pauses between attempts.
type runner struct {
	dial           dialFunc
	traceStatsBase string
	gate           *capacityGate
	batchName      string

	// arrivalGrace bounds how long a navigation is given to produce its first
	// request before the session is treated as dead.
	arrivalGrace time.Duration

	// retryPause and replacementPause are the waits before a retry and before a
	// replacement session. Injected so tests do not sleep the real delays.
	retryPause       time.Duration
	replacementPause time.Duration
}

// newRunner builds the production runner, with the measured timing defaults.
func newRunner(dial dialFunc, traceStatsBase string, gate *capacityGate, batchName string) *runner {
	return &runner{
		dial:             dial,
		traceStatsBase:   traceStatsBase,
		gate:             gate,
		batchName:        batchName,
		arrivalGrace:     arrivalGrace,
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

// nextAction decides how to recover from a failed attempt.
//
// A session whose browser never issued its navigation, whose renderer crashed,
// or that stopped answering is not usable again, so it is replaced rather than
// retried. A session that could not start is usually a tunnel still
// registering, and is worth waiting out.
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
	)

	for {
		if ctx.Err() != nil {
			return
		}

		lastErr = r.runJobOnce(ctx, j, sessions)
		sessions++

		if lastErr == nil {
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
			case <-ctx.Done():
				return
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
			case <-ctx.Done():
				return
			case <-time.After(r.replacementPause):
			}
		}
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
	stats, arrived, err := waitForFirstRequest(ctx, r.traceStatsBase, j.trace, r.arrivalGrace)
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
			return r.pageLoadFailure(j, last, expected)
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(pollTick):
		}
	}
}

// pageLoadFailure reports why the page never started.
//
// Reaching here means the browser's request did arrive, so this is always a
// page that was fetched but never ran: a page or asset problem rather than a
// session one. Listing what arrived makes the difference diagnosable.
func (r *runner) pageLoadFailure(j *job, last pagecontract.State, expected string) error {
	return pageLoadFailure(j.name, j.trace, last, expected, r.traceStatsBase)
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
