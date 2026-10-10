package browserstack

import (
	"context"
	"errors"
	"fmt"
	"testing"
)

// TestIsSessionStartFailure covers the classification the retry policy branches
// on: transient session-start problems are retried, test failures are not.
func TestIsSessionStartFailure(t *testing.T) {
	retryable := []string{
		"All parallel tests are currently in use",
		"Could not start Mobile Browser",
		"Could not start Browser / Emulator",
		"There was an error. Please try again.",
		"Failed to create session",
		"unknown command",
		"not implemented",
	}

	for _, message := range retryable {
		if !IsSessionStartFailure(errors.New(message)) {
			t.Errorf("IsSessionStartFailure(%q) = false, want true", message)
		}
	}

	notRetryable := []string{
		"2 tests failed",
		"the browser never issued its navigation",
	}

	for _, message := range notRetryable {
		if IsSessionStartFailure(errors.New(message)) {
			t.Errorf("IsSessionStartFailure(%q) = true, want false", message)
		}
	}

	if IsSessionStartFailure(nil) {
		t.Error("IsSessionStartFailure(nil) = true, want false")
	}
}

// TestIsSessionStartFailureTagged covers the tag the runner adds to every
// NewSession error, which is what makes a stalled or queued start retryable
// even when its message matches nothing.
func TestIsSessionStartFailureTagged(t *testing.T) {
	if !IsSessionStartFailure(fmt.Errorf("%w: context deadline exceeded", ErrSessionStart)) {
		t.Error("a tagged session-start timeout should be retryable")
	}

	if !IsSessionStartFailure(fmt.Errorf("%w: %w", ErrSessionStart, context.DeadlineExceeded)) {
		t.Error("a tagged context deadline should be retryable")
	}

	// A cancelled run must not be retried.
	if IsSessionStartFailure(fmt.Errorf("%w: %w", ErrSessionStart, context.Canceled)) {
		t.Error("a cancelled session start must not be retryable")
	}

	// An untagged deadline is a command timeout, not a session start.
	if IsSessionStartFailure(context.DeadlineExceeded) {
		t.Error("a bare deadline must not be treated as a session-start failure")
	}
}

func TestCommandTimeoutError(t *testing.T) {
	wrapped := commandTimeoutError(context.DeadlineExceeded)
	if !errors.Is(wrapped, ErrCommandTimeout) {
		t.Errorf("commandTimeoutError(deadline) does not unwrap to ErrCommandTimeout")
	}

	other := errors.New("connection reset")
	if commandTimeoutError(other) != other {
		t.Error("commandTimeoutError must pass through non-deadline errors unchanged")
	}
}
