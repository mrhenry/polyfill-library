package main

import (
	"bytes"
	"context"
	"errors"
	"strings"
	"sync"
	"testing"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
	"github.com/mrhenry/polyfill-library/scripts/pagecontract"
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

// recordingSessions records which session ids were looked up, so tests can
// prove the report fetches exactly the jobs it prints.
type recordingSessions struct {
	mu  sync.Mutex
	ids []string
}

func (r *recordingSessions) SessionDetails(_ context.Context, id string) (browserstack.SessionDetails, error) {
	r.mu.Lock()

	r.ids = append(r.ids, id)
	r.mu.Unlock()

	return browserstack.SessionDetails{}, nil
}

func (r *recordingSessions) ConsoleLogs(context.Context, string) (string, error) {
	return "", nil
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

// TestConsoleErrorsDeduplicatesOnTheDisplayedLine covers two long messages that
// differ only past the truncation limit: they are printed identically, so only
// one is shown.
func TestConsoleErrorsDeduplicatesOnTheDisplayedLine(t *testing.T) {
	long := strings.Repeat("x", consoleLineLimit+50)

	raw := "1:SEVERE:" + long + "a\n1:SEVERE:" + long + "b\n"

	if got := consoleErrors(raw, 10); len(got) != 1 {
		t.Errorf("consoleErrors = %v, want one line for the shared prefix", got)
	}
}

// TestConsoleErrorsKeepsLevelsDistinct covers the same text at two levels: the
// level is part of the line, so both are kept.
func TestConsoleErrorsKeepsLevelsDistinct(t *testing.T) {
	raw := "1:SEVERE:same text\n1:WARNING:same text\n"

	if got := consoleErrors(raw, 10); len(got) != 2 {
		t.Errorf("consoleErrors = %v, want both levels kept", got)
	}
}

// TestReportSessionPrintsLinksAndErrors covers the failure report body.
func TestReportSessionPrintsLinksAndErrors(t *testing.T) {
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

	reportSession(&buf, fetchSessionReport(context.Background(), "abc123", sessions))

	out := buf.String()

	for _, want := range []string{
		"https://automate.browserstack.com/abc123?auth_token=x",
		"https://automate.browserstack.com/abc123/video",
		"session result: failed TEST_FAILED",
		"console messages (1):",
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
	sessions := fakeSessions{
		details: browserstack.SessionDetails{
			Status:    "done",
			Reason:    "CLIENT_STOPPED_SESSION",
			PublicURL: "https://automate.browserstack.com/abc123",
		},
	}

	var buf bytes.Buffer

	reportSession(&buf, fetchSessionReport(context.Background(), "abc123", sessions))

	if strings.Contains(buf.String(), "session result:") {
		t.Errorf("report = %q, want the normal session end suppressed", buf.String())
	}
}

// TestReportSessionWithoutASessionPrintsNothing covers a job that never started
// a session: there is nothing to link to.
func TestReportSessionWithoutASessionPrintsNothing(t *testing.T) {
	var buf bytes.Buffer

	reportSession(&buf, sessionReport{})

	if buf.Len() != 0 {
		t.Errorf("report = %q, want nothing for a job with no session", buf.String())
	}
}

// TestReportSessionSurvivesAnUnavailableAPI covers the API being unreadable:
// the session id is still printed so the session can be found by hand.
func TestReportSessionSurvivesAnUnavailableAPI(t *testing.T) {
	var buf bytes.Buffer

	sessions := fakeSessions{detailsErr: errors.New("boom")}

	reportSession(&buf, fetchSessionReport(context.Background(), "abc123", sessions))

	out := buf.String()

	if !strings.Contains(out, "abc123") || !strings.Contains(out, "details unavailable") {
		t.Errorf("report = %q, want the session id and the reason", out)
	}
}

// TestFetchSessionReportsGathersFailedJobs covers the prefetch: every failing
// job with a session is looked up and no clean job is.
func TestFetchSessionReportsGathersFailedJobs(t *testing.T) {
	failed := testJob("chrome/100.0", "r-1")
	failed.state.addSession("s1")
	failed.state.setError(errors.New("boom"))

	clean := testJob("chrome/101.0", "r-2")
	clean.state.addSession("s2")
	clean.state.complete(&pagecontract.Summary{Passed: 3}, 0)

	noSession := testJob("chrome/102.0", "r-3")
	noSession.state.setError(errors.New("boom"))

	sessions := &recordingSessions{}

	reports := fetchSessionReports(context.Background(), []*job{failed, clean, noSession}, sessions)

	if _, ok := reports[failed]; !ok {
		t.Error("failing job with a session was not prefetched")
	}

	if _, ok := reports[clean]; ok {
		t.Error("clean job was prefetched")
	}

	if _, ok := reports[noSession]; ok {
		t.Error("job with no session was prefetched")
	}

	sessions.mu.Lock()
	defer sessions.mu.Unlock()

	if len(sessions.ids) != 1 || sessions.ids[0] != "s1" {
		t.Errorf("looked up %v, want only s1", sessions.ids)
	}
}

// TestFetchSessionReportsWithoutAnInspectorPrintsNothing covers a nil seam.
func TestFetchSessionReportsWithoutAnInspectorPrintsNothing(t *testing.T) {
	j := testJob("chrome/100.0", "r-1")
	j.state.addSession("s1")
	j.state.setError(errors.New("boom"))

	if reports := fetchSessionReports(context.Background(), []*job{j}, nil); len(reports) != 0 {
		t.Errorf("reports = %v, want none without an inspector", reports)
	}
}

// TestFailureReportRendersEveryLineThroughOneWriter covers the whole failure
// report: the job outcome, the reproduce URL and the session excerpt all reach
// the same writer, so the report is exercised without touching stdout.
func TestFailureReportRendersEveryLineThroughOneWriter(t *testing.T) {
	passed := testJob("chrome/100.0", "r-1")
	passed.state.complete(&pagecontract.Summary{Passed: 3}, 0)

	failed := testJob("ie/9.0", "r-2")
	failed.testMode = pagecontract.ModeAll
	failed.request = pagecontract.Request{Mode: pagecontract.ModeAll, Shard: 2, Trace: "r-2"}
	failed.state.addSession("sess-2")
	failed.state.complete(&pagecontract.Summary{
		Passed: 1,
		Failed: 1,
		FailingTests: []pagecontract.FailingTest{
			{Name: "Promise resolves", FailingSuite: "Promise.basic", Message: "expected true"},
		},
	}, 0)

	unfinished := testJob("safari/9.0", "r-3")
	unfinished.testMode = pagecontract.ModeAll
	unfinished.state.addSession("sess-3")
	unfinished.state.setError(errors.New("the remote machine died"))

	sessions := fakeSessions{
		details: browserstack.SessionDetails{PublicURL: "https://automate.browserstack.com/abc"},
	}

	var buf bytes.Buffer

	newFailureReport(&buf, sessions).report(context.Background(), []*job{passed, failed, unfinished})

	out := buf.String()

	for _, want := range []string{
		"Failures:",
		" - ie/9.0:",
		"-> Promise resolves",
		"feature=Promise.basic",
		"shard=2",
		"trace=r-2",
		"expected true",
		"• safari/9.0 (all): the remote machine died",
		"https://automate.browserstack.com/abc",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("report is missing %q:\n%s", want, out)
		}
	}

	if strings.Contains(out, "chrome/100.0") {
		t.Errorf("report named a passing job:\n%s", out)
	}
}
