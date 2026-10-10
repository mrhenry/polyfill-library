package main

import (
	"context"
	"sync"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

const (
	// capacityPollInterval is how long a waiting session pauses before asking
	// the account again.
	capacityPollInterval = 3 * time.Second

	// capacityHeadroom is how many parallel slots this run leaves unused, so a
	// burst of other sessions (or this run's own tunnel probe) still fits.
	capacityHeadroom = 1
)

// capacityGate admits session starts against the account's parallel allowance.
//
// The allowance is shared with every other user of the account, so a fixed
// concurrency either wastes capacity or over-subscribes it. Before each session
// this reads how many are running and waits while there is no room, so the run
// uses whatever is actually free rather than what was free at startup.
type capacityGate struct {
	plan     func(context.Context) (browserstack.Plan, error)
	headroom int
	interval time.Duration

	mu       sync.Mutex
	max      int
	external int
	inflight int
	checked  time.Time
}

func newCapacityGate(client *browserstack.Client) *capacityGate {
	return &capacityGate{
		plan:     client.Plan,
		headroom: capacityHeadroom,
		interval: capacityPollInterval,
	}
}

// refresh re-reads the plan when the cached reading is stale, or when forced.
func (g *capacityGate) refresh(ctx context.Context, force bool) {
	g.mu.Lock()
	defer g.mu.Unlock()

	g.refreshLocked(ctx, force)
}

func (g *capacityGate) refreshLocked(ctx context.Context, force bool) {
	if !force && !g.checked.IsZero() && time.Since(g.checked) < g.interval {
		return
	}

	plan, err := g.plan(ctx)
	if err != nil {
		// Fail open: a plan endpoint that will not answer must not stall the
		// run, and the retry policy still covers a session that queues.
		return
	}

	g.max = plan.ParallelSessionsMaxAllowed

	// running counts this run's own sessions too; subtracting the ones in
	// flight leaves only other users' usage, which is what rations a shared
	// account.
	g.external = plan.ParallelSessionsRunning - g.inflight
	if g.external < 0 {
		g.external = 0
	}

	g.checked = time.Now()
}

// allowance is the account max adjusted for headroom, or 0 when unknown.
func (g *capacityGate) allowance() int {
	g.mu.Lock()
	defer g.mu.Unlock()

	if g.max == 0 {
		return 0
	}

	allowance := g.max - g.headroom
	if allowance < 1 {
		allowance = 1
	}

	return allowance
}

// maxAllowance forces a fresh reading and returns the headroom-adjusted
// allowance. Used once at startup to size the local concurrency limit.
func (g *capacityGate) maxAllowance(ctx context.Context) int {
	g.refresh(ctx, true)

	return g.allowance()
}

// wait blocks until a session may start, then reserves the slot. The
// reservation is freed with release.
func (g *capacityGate) wait(ctx context.Context) error {
	for {
		g.mu.Lock()
		g.refreshLocked(ctx, false)

		if g.max == 0 || g.external+g.inflight < g.max-g.headroom {
			g.inflight++
			g.mu.Unlock()

			return nil
		}
		g.mu.Unlock()

		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(g.interval):
		}
	}
}

// release frees a reserved slot.
func (g *capacityGate) release() {
	g.mu.Lock()
	if g.inflight > 0 {
		g.inflight--
	}
	g.mu.Unlock()
}
