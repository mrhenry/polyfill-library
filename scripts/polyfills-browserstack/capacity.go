package main

import (
	"context"
	"sync"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

// capacityPollInterval is how long a waiting session pauses before asking the
// account again.
const capacityPollInterval = 3 * time.Second

// capacityGate admits session starts against the account's parallel allowance.
//
// The allowance is shared with every other user of the account, so before each
// session this reads how many are running and waits while there is no room.
type capacityGate struct {
	plan     func(context.Context) (browserstack.Plan, error)
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
	// flight leaves only other users' usage.
	g.external = plan.ParallelSessionsRunning - g.inflight
	if g.external < 0 {
		g.external = 0
	}

	g.checked = time.Now()
}

// maxAllowance forces a fresh reading and returns the account's allowance, or 0
// when the plan could not be read. Used once at startup to size concurrency.
func (g *capacityGate) maxAllowance(ctx context.Context) int {
	g.refresh(ctx, true)

	g.mu.Lock()
	defer g.mu.Unlock()

	return g.max
}

// wait blocks until a session may start, then reserves the slot. The
// reservation is freed with release.
func (g *capacityGate) wait(ctx context.Context) error {
	for {
		g.mu.Lock()
		g.refreshLocked(ctx, false)

		// A max of zero means the plan has not been read, so admit and let the
		// retry policy cover it.
		if g.max == 0 || g.external+g.inflight < g.max {
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
