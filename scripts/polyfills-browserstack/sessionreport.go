package main

import (
	"context"
	"fmt"
	"io"
	"strings"

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

// reportSession prints where the job's BrowserStack session can be inspected:
// the dashboard link, the recording, and the browser console errors. A job
// whose session never started prints nothing.
func reportSession(ctx context.Context, w io.Writer, j *job, sessions sessionInspector) {
	id := j.state.lastSessionID()
	if id == "" || sessions == nil {
		return
	}

	// The id alone is still useful when the API will not answer: the session
	// can be found on the dashboard by it.
	details, err := sessions.SessionDetails(ctx, id)
	if err != nil {
		fmt.Fprintf(w, "       browserstack session %s (details unavailable: %v)\n", id, err)

		return
	}

	fmt.Fprintf(w, "       browserstack: %s\n", firstNonEmpty(details.PublicURL, id))

	if details.VideoURL != "" {
		fmt.Fprintf(w, "       video: %s\n", details.VideoURL)
	}

	// A session the harness ended itself reports CLIENT_STOPPED_SESSION, which
	// says nothing; anything else is worth naming.
	if details.Reason != "" && details.Reason != "CLIENT_STOPPED_SESSION" {
		fmt.Fprintf(w, "       session result: %s %s\n", details.Status, details.Reason)
	}

	raw, err := sessions.ConsoleLogs(ctx, id)
	if err != nil || raw == "" {
		return
	}

	lines := consoleErrors(raw, consoleLimit)
	if len(lines) == 0 {
		return
	}

	fmt.Fprintf(w, "       console errors (%d):\n", len(lines))

	for _, line := range lines {
		fmt.Fprintf(w, "         %s\n", line)
	}
}

// consoleErrors extracts the error and warning lines from BrowserStack's browser
// console log, dropping the timestamp prefix, deduplicating and capping. The
// log covers the whole session, so it is filtered to the levels that matter
// rather than dumped.
func consoleErrors(raw string, limit int) []string {
	seen := map[string]bool{}

	var out []string

	for _, line := range strings.Split(raw, "\n") {
		level, message, ok := parseConsoleLine(line)
		if !ok || (level != "SEVERE" && level != "WARNING") {
			continue
		}

		if message == "" || seen[message] {
			continue
		}

		seen[message] = true
		out = append(out, level+": "+truncate(message, consoleLineLimit))

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

// truncate caps s at max bytes, marking that it was cut.
func truncate(s string, max int) string {
	if len(s) <= max {
		return s
	}

	return s[:max] + "..."
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
