package browserstack

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browsercmp"
)

// tunnelReadyTimeout bounds how long to wait for a fresh tunnel to become
// usable. Sessions were rejected for roughly 55 seconds after the binary
// reported ready, so the window is comfortably longer.
const tunnelReadyTimeout = 3 * time.Minute

// tunnelProbeInterval is the first pause between probes; each pause doubles up
// to tunnelProbeMaxInterval. A refused probe creates no session, so the pauses
// only bound latency.
const tunnelProbeInterval = 5 * time.Second

// tunnelProbeMaxInterval caps the backoff between probes.
const tunnelProbeMaxInterval = 30 * time.Second

// WaitForTunnel blocks until BrowserStack will actually route a local session
// through the tunnel. It probes with the latest Chrome in the browser matrix.
//
// BrowserStackLocal reports ready within seconds, but for roughly the next
// fifty seconds every local session is refused with "local testing through
// BrowserStack is not connected". Nothing in the tunnel output marks the moment
// it becomes usable, so only a successful session proves it.
func (c *Client) WaitForTunnel(ctx context.Context, browsers []Browser) error {
	chrome, ok := latestChrome(browsers)
	if !ok {
		return errors.New("no chrome browser in the matrix to probe the tunnel with")
	}

	probe := Capabilities{
		BStack: map[string]any{
			"sessionName": "polyfill-library tunnel readiness probe",
			"projectName": ProjectName,
			"local":       true,
			"video":       false,
		},
		Standard: map[string]any{
			"browserName":    "chrome",
			"browserVersion": chrome.BrowserVersion,
		},
	}

	ctx, cancel := context.WithTimeout(ctx, tunnelReadyTimeout)
	defer cancel()

	started := time.Now()
	wait := tunnelProbeInterval

	for attempt := 1; ; attempt++ {
		session, err := NewSession(ctx, c.http, Hub(), probe, c.credentials)

		switch {
		case err == nil:
			// The tunnel is routable. Release the probe before returning so it
			// does not hold a parallel session slot.
			deleteCtx, cancelDelete := context.WithTimeout(context.WithoutCancel(ctx), 30*time.Second)
			deleteErr := session.Delete(deleteCtx)

			cancelDelete()

			if deleteErr != nil {
				slog.Warn("deleting tunnel probe session", "error", deleteErr)
			}

			slog.Info("tunnel routable",
				"after", time.Since(started).Round(time.Second), "attempts", attempt)

			return nil

		case ErrTunnelNotConnected(err):
			// Expected while the tunnel registers. Keep waiting.
		case ctx.Err() != nil:
			return fmt.Errorf("tunnel was not usable within %s: %w", tunnelReadyTimeout, ctx.Err())
		default:
			return fmt.Errorf("probing the tunnel: %w", err)
		}

		slog.Info("tunnel not routable yet",
			"after", time.Since(started).Round(time.Second), "error", err)

		select {
		case <-ctx.Done():
			return fmt.Errorf("tunnel was not usable within %s: %w", tunnelReadyTimeout, ctx.Err())
		case <-time.After(wait):
		}

		wait = nextProbeWait(wait)
	}
}

// nextProbeWait doubles the pause between tunnel probes, capped at
// tunnelProbeMaxInterval.
func nextProbeWait(current time.Duration) time.Duration {
	return min(current*2, tunnelProbeMaxInterval)
}

// latestChrome returns the newest non-beta Chrome in the matrix.
func latestChrome(browsers []Browser) (Browser, bool) {
	var (
		latest Browser
		found  bool
	)

	for _, b := range browsers {
		if !strings.EqualFold(b.Browser, "chrome") || b.BrowserVersion == "" {
			continue
		}

		if strings.Contains(strings.ToLower(b.BrowserVersion), "beta") {
			continue
		}

		if !found || browsercmp.VersionLess(latest.BrowserVersion, b.BrowserVersion) {
			latest = b
			found = true
		}
	}

	return latest, found
}
