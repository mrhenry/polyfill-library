package main

import (
	"context"
	"fmt"
	"io"
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

// sessionInspector is the seam to BrowserStack's session API: the links and
// logs a failure report needs. The production adapter is browserstack.Client.
type sessionInspector interface {
	SessionDetails(ctx context.Context, id string) (browserstack.SessionDetails, error)
	ConsoleLogs(ctx context.Context, id string) (string, error)
}

var _ sessionInspector = (*browserstack.Client)(nil)

// consoleLimit is how many console lines one failure report shows. A session
// tests many features, so its console log covers all of them; only a bounded
// excerpt is useful, and the rest is a click away on the dashboard.
const consoleLimit = 20

// consoleLineLimit bounds one console line, which can carry a whole stack.
const consoleLineLimit = 500

// sessionReport is everything a failure line needs about one job's session,
// gathered before printing so lookups can run concurrently.
type sessionReport struct {
	id      string
	details browserstack.SessionDetails
	logs    string
	err     error
}

// sessionFetchConcurrency caps how many session lookups run at once, so a large
// failure set does not open hundreds of connections at once.
const sessionFetchConcurrency = 8

// fetchSessionReports reads the details and console log for every job the
// report will show, in parallel and bounded, so a widespread failure does not
// serialize into a long wait behind per-call timeouts. Jobs without a session
// are omitted.
func fetchSessionReports(ctx context.Context, jobs []*job, sessions sessionInspector) map[*job]sessionReport {
	reports := make(map[*job]sessionReport)
	if sessions == nil {
		return reports
	}

	var (
		mu  sync.Mutex
		wg  sync.WaitGroup
		sem = make(chan struct{}, sessionFetchConcurrency)
	)

	for _, j := range jobs {
		id := j.state.lastSessionID()
		if id == "" || j.state.status().passed() {
			continue
		}

		wg.Add(1)
		sem <- struct{}{}

		go func(j *job, id string) {
			defer wg.Done()
			defer func() { <-sem }()

			report := fetchSessionReport(ctx, id, sessions)

			mu.Lock()
			reports[j] = report
			mu.Unlock()
		}(j, id)
	}

	wg.Wait()

	return reports
}

// fetchSessionReport reads one session's details and console log.
func fetchSessionReport(ctx context.Context, id string, sessions sessionInspector) sessionReport {
	report := sessionReport{id: id}

	details, err := sessions.SessionDetails(ctx, id)
	if err != nil {
		report.err = err

		return report
	}

	report.details = details

	// A session with no console log, or one BrowserStack will not serve (only
	// Chrome reports them), is not an error: the links are still worth printing.
	report.logs, _ = sessions.ConsoleLogs(ctx, id)

	return report
}

// reportSession prints where the job's BrowserStack session can be inspected:
// the dashboard link, the recording, and the browser console errors. A job
// whose session never started prints nothing.
func reportSession(w io.Writer, report sessionReport) {
	if report.id == "" {
		return
	}

	// The id alone is still useful when the API would not answer: the session
	// can be found on the dashboard by it.
	if report.err != nil {
		fmt.Fprintf(w, "       browserstack session %s (details unavailable: %v)\n", report.id, report.err)

		return
	}

	fmt.Fprintf(w, "       browserstack: %s\n", firstNonEmpty(report.details.PublicURL, report.id))

	if report.details.VideoURL != "" {
		fmt.Fprintf(w, "       video: %s\n", report.details.VideoURL)
	}

	// A session the harness ended itself reports CLIENT_STOPPED_SESSION, which
	// says nothing; anything else is worth naming.
	if report.details.Reason != "" && report.details.Reason != "CLIENT_STOPPED_SESSION" {
		fmt.Fprintf(w, "       session result: %s %s\n", report.details.Status, report.details.Reason)
	}

	lines := consoleErrors(report.logs, consoleLimit)
	if len(lines) == 0 {
		return
	}

	fmt.Fprintf(w, "       console messages (%d):\n", len(lines))

	for _, line := range lines {
		fmt.Fprintf(w, "         %s\n", line)
	}
}

// consoleErrors extracts the error and warning lines from BrowserStack's browser
// console log, dropping the timestamp prefix, deduplicating and capping. The
// log covers the whole session, so it is filtered to the levels that matter
// rather than dumped. Deduplication is on the displayed line, so truncating two
// long messages to the same prefix does not print the same line twice.
func consoleErrors(raw string, limit int) []string {
	seen := map[string]bool{}

	var out []string

	for _, line := range strings.Split(raw, "\n") {
		level, message, ok := parseConsoleLine(line)
		if !ok || (level != "SEVERE" && level != "WARNING") {
			continue
		}

		if message == "" {
			continue
		}

		display := level + ": " + truncate(message, consoleLineLimit)
		if seen[display] {
			continue
		}

		seen[display] = true
		out = append(out, display)

		if len(out) >= limit {
			break
		}
	}

	return out
}

// parseConsoleLine splits BrowserStack's "<epochMillis>:<LEVEL>:<message>"
// console log line. It also accepts the level-first form, so a format change
// drops timestamps rather than every line.
func parseConsoleLine(line string) (level, message string, ok bool) {
	line = strings.TrimSpace(line)
	if line == "" {
		return "", "", false
	}

	parts := strings.Split(line, ":")

	// Drop a leading epoch-millis timestamp when the line carries one.
	if len(parts) >= 3 && isDigits(parts[0]) {
		parts = parts[1:]
	}

	if len(parts) < 2 {
		return "", "", false
	}

	return parts[0], strings.TrimSpace(strings.Join(parts[1:], ":")), true
}

// isDigits reports whether s is a non-empty run of ASCII digits.
func isDigits(s string) bool {
	if s == "" {
		return false
	}

	for i := 0; i < len(s); i++ {
		if s[i] < '0' || s[i] > '9' {
			return false
		}
	}

	return true
}

// truncate caps s at max bytes on a rune boundary, marking that it was cut.
func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}

	// Step back off a continuation byte so a multi-byte character is not split.
	cut := max
	for cut > 0 && !utf8.RuneStart(s[cut]) {
		cut--
	}

	return s[:cut] + "..."
}

// firstNonEmpty returns the first non-empty string, or "".
func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}

	return ""
}
