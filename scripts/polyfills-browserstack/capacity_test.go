package main

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

func newTestGate(plan func(context.Context) (browserstack.Plan, error), interval time.Duration) *capacityGate {
	return &capacityGate{plan: plan, headroom: 1, interval: interval}
}

func staticPlan(plan browserstack.Plan) func(context.Context) (browserstack.Plan, error) {
	return func(context.Context) (browserstack.Plan, error) {
		return plan, nil
	}
}

// TestCapacityGateFailsOpenWhenPlanUnavailable proves a plan endpoint that will
// not answer does not stall the run.
func TestCapacityGateFailsOpenWhenPlanUnavailable(t *testing.T) {
	g := newTestGate(func(context.Context) (browserstack.Plan, error) {
		return browserstack.Plan{}, errors.New("plan unavailable")
	}, time.Hour)

	if err := g.wait(context.Background()); err != nil {
		t.Fatalf("wait should fail open, got %v", err)
	}
}

// TestCapacityGateRationsToAllowance covers the headroom: max 5 with a headroom
// of 1 admits four sessions and blocks the fifth.
func TestCapacityGateRationsToAllowance(t *testing.T) {
	g := newTestGate(staticPlan(browserstack.Plan{ParallelSessionsMaxAllowed: 5}), time.Hour)

	ctx := context.Background()

	for i := 0; i < 4; i++ {
		if err := g.wait(ctx); err != nil {
			t.Fatalf("admission %d failed: %v", i, err)
		}
	}

	blocked, cancel := context.WithTimeout(ctx, 30*time.Millisecond)
	defer cancel()

	if err := g.wait(blocked); !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("wait past the allowance = %v, want it to block", err)
	}
}

// TestCapacityGateBacksOffForExternalUsage proves another user's sessions are
// subtracted, so only the genuinely free slots are used.
func TestCapacityGateBacksOffForExternalUsage(t *testing.T) {
	// Three sessions already running elsewhere, allowance is four.
	g := newTestGate(staticPlan(browserstack.Plan{ParallelSessionsMaxAllowed: 5, ParallelSessionsRunning: 3}), time.Hour)

	ctx := context.Background()

	if err := g.wait(ctx); err != nil {
		t.Fatalf("the one free slot should be granted: %v", err)
	}

	blocked, cancel := context.WithTimeout(ctx, 30*time.Millisecond)
	defer cancel()

	if err := g.wait(blocked); !errors.Is(err, context.DeadlineExceeded) {
		t.Errorf("wait with external usage = %v, want it to block", err)
	}
}

func TestCapacityGateReleaseFreesSlot(t *testing.T) {
	g := newTestGate(staticPlan(browserstack.Plan{ParallelSessionsMaxAllowed: 5}), time.Hour)

	ctx := context.Background()

	for i := 0; i < 4; i++ {
		if err := g.wait(ctx); err != nil {
			t.Fatalf("admission %d failed: %v", i, err)
		}
	}

	g.release()

	if err := g.wait(ctx); err != nil {
		t.Errorf("a released slot should be reusable: %v", err)
	}
}

// TestCapacityGatePicksUpFreedCapacity covers the "wait until capacity frees
// up" behaviour: a blocked session proceeds once the account drains.
func TestCapacityGatePicksUpFreedCapacity(t *testing.T) {
	var mu sync.Mutex
	running := 5

	g := newTestGate(func(context.Context) (browserstack.Plan, error) {
		mu.Lock()
		defer mu.Unlock()

		return browserstack.Plan{ParallelSessionsMaxAllowed: 5, ParallelSessionsRunning: running}, nil
	}, 5*time.Millisecond)

	done := make(chan error, 1)

	go func() {
		done <- g.wait(context.Background())
	}()

	select {
	case err := <-done:
		t.Fatalf("wait returned %v while the account was full", err)
	case <-time.After(25 * time.Millisecond):
	}

	mu.Lock()
	running = 0
	mu.Unlock()

	select {
	case err := <-done:
		if err != nil {
			t.Errorf("wait should succeed once capacity frees: %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Error("wait did not pick up freed capacity")
	}
}
