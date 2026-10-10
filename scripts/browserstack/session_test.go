package browserstack

import (
	"errors"
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
