package main

import (
	"bytes"
	"context"
	"errors"
	"strings"
	"testing"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

// fakeSessions is an in-memory adapter at the session inspector seam.
type fakeSessions struct {
	details    browserstack.SessionDetails
	detailsErr error
	logs       string
	logsErr    error
}

func (f fakeSessions) SessionDetails(context.Context, string) (browserstack.SessionDetails, error) {
	return f.details, f.detailsErr
}

func (f fakeSessions) ConsoleLogs(context.Context, string) (string, error) {
	return f.logs, f.logsErr
}

// TestConsoleErrorsFiltersAndBounds covers the filter between a session's raw
// console log and what a failure report shows.
func TestConsoleErrorsFiltersAndBounds(t *testing.T) {
	raw := strings.Join([]string{
		"1599563924892:SEVERE:Uncaught TypeError: a is not a function",
		"1599563924893:INFO:just so you know",
		"1599563924894:WARNING:deprecated polyfill used",
		"1599563924895:SEVERE:Uncaught TypeError: a is not a function", // duplicate
		"",
		"garbage without a level",
	}, "\n")

	got := consoleErrors(raw, 10)

	want := []string{
		"SEVERE: Uncaught TypeError: a is not a function",
		"WARNING: deprecated polyfill used",
	}

	if len(got) != len(want) {
		t.Fatalf("consoleErrors = %v, want %v", got, want)
	}

	for i := range want {
		if got[i] != want[i] {
			t.Errorf("consoleErrors[%d] = %q, want %q", i, got[i], want[i])
		}
	}
}

// TestConsoleErrorsCaps proves the excerpt is bounded; the whole session's log
// is never dumped.
func TestConsoleErrorsCaps(t *testing.T) {
	var b strings.Builder

	for i := 0; i < 100; i++ {
		b.WriteString("1599563924892:SEVERE:error ")
		b.WriteString(string(rune('a' + i%26)))
		b.WriteByte('\n')
	}

	got := consoleErrors(b.String(), 5)

	if len(got) != 5 {
		t.Errorf("consoleErrors returned %d lines, want the 5 line cap", len(got))
	}
}

// TestConsoleErrorsHandlesLevelFirstFormat covers a log without the epoch
// prefix, so a format change does not drop every line.
func TestConsoleErrorsHandlesLevelFirstFormat(t *testing.T) {
	got := consoleErrors("SEVERE:boom: detail", 10)

	if len(got) != 1 || got[0] != "SEVERE: boom: detail" {
		t.Errorf("consoleErrors = %v, want the level-first line kept whole", got)
	}
}

// TestReportSessionPrintsLinksAndErrors covers the failure report body.
func TestReportSessionPrintsLinksAndErrors(t *testing.T) {
	j := &job{name: "chrome/100.0", state: newJobState()}
	j.state.addSession("abc123")

	sessions := fakeSessions{
		details: browserstack.SessionDetails{
			Status:    "failed",
			Reason:    "TEST_FAILED",
			PublicURL: "https://automate.browserstack.com/abc123?auth_token=x",
			VideoURL:  "https://automate.browserstack.com/abc123/video",
		},
		logs: "1599563924892:SEVERE:Uncaught TypeError: a is not a function\n",
	}

	var buf bytes.Buffer

	reportSession(context.Background(), &buf, j, sessions)

	out := buf.String()

	for _, want := range []string{
		"https://automate.browserstack.com/abc123?auth_token=x",
		"https://automate.browserstack.com/abc123/video",
		"session result: failed TEST_FAILED",
		"console errors (1):",
		"SEVERE: Uncaught TypeError: a is not a function",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("report is missing %q:\n%s", want, out)
		}
	}
}

// TestReportSessionSuppressesTheNormalSessionEnd covers the harness ending its
// own session: CLIENT_STOPPED_SESSION says nothing and is not printed.
func TestReportSessionSuppressesTheNormalSessionEnd(t *testing.T) {
	j := &job{name: "chrome/100.0", state: newJobState()}
	j.state.addSession("abc123")

	sessions := fakeSessions{
		details: browserstack.SessionDetails{
			Status:    "done",
			Reason:    "CLIENT_STOPPED_SESSION",
			PublicURL: "https://automate.browserstack.com/abc123",
		},
	}

	var buf bytes.Buffer

	reportSession(context.Background(), &buf, j, sessions)

	if strings.Contains(buf.String(), "session result:") {
		t.Errorf("report = %q, want the normal session end suppressed", buf.String())
	}
}

// TestReportSessionWithoutASessionPrintsNothing covers a job that never started
// a session: there is nothing to link to.
func TestReportSessionWithoutASessionPrintsNothing(t *testing.T) {
	j := &job{name: "chrome/100.0", state: newJobState()}

	var buf bytes.Buffer

	reportSession(context.Background(), &buf, j, fakeSessions{})

	if buf.Len() != 0 {
		t.Errorf("report = %q, want nothing for a job with no session", buf.String())
	}
}

// TestReportSessionSurvivesAnUnavailableAPI covers the API being unreadable:
// the session id is still printed so the session can be found by hand.
func TestReportSessionSurvivesAnUnavailableAPI(t *testing.T) {
	j := &job{name: "chrome/100.0", state: newJobState()}
	j.state.addSession("abc123")

	var buf bytes.Buffer

	reportSession(context.Background(), &buf, j, fakeSessions{detailsErr: errors.New("boom")})

	out := buf.String()

	if !strings.Contains(out, "abc123") || !strings.Contains(out, "details unavailable") {
		t.Errorf("report = %q, want the session id and the reason", out)
	}
}
