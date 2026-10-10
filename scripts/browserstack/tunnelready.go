package browserstack

import (
	"context"
	"fmt"
	"log"
	"time"
)

// tunnelReadyTimeout bounds how long to wait for a fresh tunnel to become
// usable. Sessions were rejected for roughly 55 seconds after the binary
// reported ready, so the window has to be comfortably longer than that.
const tunnelReadyTimeout = 3 * time.Minute

// tunnelProbeInterval is how often to re-probe while waiting. Each probe is a
// real session that has to be created and torn down, so probing faster than
// this would mostly measure BrowserStack's session queue rather than the tunnel.
const tunnelProbeInterval = 5 * time.Second

// WaitForTunnel blocks until BrowserStack will actually route a local session
// through the tunnel.
//
// This is not the same as the tunnel being up.
//
// Measured on this account, BrowserStackLocal prints "Press Ctrl-C to exit" and
// its own http://localhost:45454/status reports {"status":true} within about
// three seconds of starting, but for roughly the next fifty seconds every
// local session is refused with:
//
//	[browserstack.local] is set to true but local testing through BrowserStack
//	is not connected.
//
// Nothing in the tunnel's output marks the moment it becomes usable - not even
// with --enable-logging-for-api - and the account tunnel list endpoint stays
// empty, so neither is usable as a signal. The only authoritative one is a
// session request actually succeeding, which is what this probes.
//
// Starting jobs into that window is what made runs fail at startup, so the
// probe runs before any job and costs one throwaway session per run.
func (c *Client) WaitForTunnel(ctx context.Context) error {
	// The cheapest browser that still exercises the same tunnel path.
	probe := Capabilities{
		BStack: map[string]any{
			"sessionName": "polyfill-library tunnel readiness probe",
			"projectName": "polyfill-library",
			"local":       true,
			"video":       false,
		},
		Standard: map[string]any{
			"browserName":    "chrome",
			"browserVersion": "51.0",
		},
	}

	ctx, cancel := context.WithTimeout(ctx, tunnelReadyTimeout)
	defer cancel()

	started := time.Now()

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
				log.Printf("[tunnel] : deleting probe session: %v", deleteErr)
			}

			log.Printf("[tunnel] : routable after %s (%d attempt(s))", time.Since(started).Round(time.Second), attempt)

			return nil

		case ErrTunnelNotConnected(err):
			// Expected while the tunnel registers. Keep waiting.
		case ctx.Err() != nil:
			return fmt.Errorf("tunnel was not usable within %s: %w", tunnelReadyTimeout, ctx.Err())
		default:
			return fmt.Errorf("probing the tunnel: %w", err)
		}

		log.Printf("[tunnel] : not routable yet (%s): %v", time.Since(started).Round(time.Second), err)

		select {
		case <-ctx.Done():
			return fmt.Errorf("tunnel was not usable within %s: %w", tunnelReadyTimeout, ctx.Err())
		case <-time.After(tunnelProbeInterval):
		}
	}
}
