package main

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"
	"sync"
	"time"
)

// jobRunner drives one job to completion: the seam between the scheduler and
// the runner. It has two adapters, the production runner and a test fake.
type jobRunner interface {
	runJob(ctx context.Context, j *job)
}

var _ jobRunner = (*runner)(nil)

// scheduler runs every job, at most maxConcurrency at a time, and never runs
// two sessions for the same browser at once.
type scheduler struct {
	runner         jobRunner
	printer        *progressPrinter
	maxConcurrency int

	// tick is how often the job board is reprinted.
	tick time.Duration
}

// newScheduler builds the production scheduler.
func newScheduler(runner jobRunner, maxConcurrency int) *scheduler {
	return &scheduler{
		runner:         runner,
		printer:        newProgressPrinter(os.Stdout),
		maxConcurrency: maxConcurrency,
		tick:           pollTick,
	}
}

// run drives every job to completion and reports how many failed.
func (s *scheduler) run(ctx context.Context, jobs []*job) int {
	if s.maxConcurrency < 1 {
		s.maxConcurrency = 1
	}

	ticker := time.NewTicker(s.tick)

	stopProgress := make(chan struct{})
	progressDone := make(chan struct{})

	go func() {
		defer close(progressDone)

		for {
			select {
			case <-ticker.C:
				s.printer.print(jobs)
			case <-stopProgress:
				return
			case <-ctx.Done():
				return
			}
		}
	}()

	var (
		sem    = make(chan struct{}, s.maxConcurrency)
		slots  = &browserSlots{inflight: map[string]bool{}}
		wg     sync.WaitGroup
		failed int
	)

	for _, j := range jobs {
		wg.Add(1)

		go func(j *job) {
			defer wg.Done()

			// Claim the per-browser slot before the concurrency slot, so a job
			// waiting behind another session of the same browser does not hold a
			// global slot that a different browser could be using.
			if !slots.acquire(ctx, j.name) {
				return
			}

			defer slots.release(j.name)

			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				return
			}

			s.runner.runJob(ctx, j)
		}(j)
	}

	wg.Wait()

	ticker.Stop()
	close(stopProgress)

	<-progressDone

	s.printer.print(jobs)

	for _, j := range jobs {
		if j.state.failed() {
			failed++
		}
	}

	return failed
}

// browserSlots serialises work per browser so a single browser is never
// driven by two sessions at once.
type browserSlots struct {
	mu       sync.Mutex
	inflight map[string]bool
}

// acquire claims the slot for name, blocking until it is free. It reports
// whether the slot was claimed: a cancelled context returns false so the
// caller does not release a slot it never held.
func (s *browserSlots) acquire(ctx context.Context, name string) bool {
	for {
		s.mu.Lock()
		if !s.inflight[name] {
			s.inflight[name] = true
			s.mu.Unlock()

			return true
		}
		s.mu.Unlock()

		select {
		case <-ctx.Done():
			return false
		case <-time.After(time.Second):
		}
	}
}

func (s *browserSlots) release(name string) {
	s.mu.Lock()
	delete(s.inflight, name)
	s.mu.Unlock()
}

// progressPrinter renders the job board, remembering the last block printed so
// an unchanged screenful is not reprinted.
type progressPrinter struct {
	w    io.Writer
	last string
}

func newProgressPrinter(w io.Writer) *progressPrinter {
	return &progressPrinter{w: w}
}

func (p *progressPrinter) print(jobs []*job) {
	lines := []string{strings.Repeat("-", 80)}

	queued := 0

	for _, j := range jobs {
		status := j.state.status()

		message := ""

		switch status.state {
		case "complete":
			if status.results != nil && status.results.Failed > 0 {
				message = fmt.Sprintf("✘ %d tests, %d failures", status.results.Passed+status.results.Failed, status.results.Failed)
			} else if status.results != nil {
				message = fmt.Sprintf("✓ %d tests", status.results.Passed)
			}

			if status.duration > 0 {
				message += fmt.Sprintf("  %d seconds to complete", int(status.duration.Seconds()))
			}

			if status.replacements > 0 {
				message += fmt.Sprintf("  (%d session%s replaced)", status.replacements, plural(status.replacements))
			}
		case "error":
			message = fmt.Sprintf("⚠️  %v [trace %s]", status.err, j.trace)
		case "ready":
			queued++
		case "running":
			if status.progress != nil {
				message = fmt.Sprintf("%d/%d", status.progress.RunnerCompletedCount, status.progress.RunnerCount)
			}
		default:
			message = status.state
		}

		if message != "" {
			lines = append(lines, fmt.Sprintf(" • Browser: %-15s Test config: %-32s %s",
				j.name, j.configForLog(), message))
		}
	}

	if queued > 0 {
		lines = append(lines, fmt.Sprintf(" + %d job(s) queued", queued))
	}

	out := strings.Join(lines, "\n") + "\n"
	if out == p.last {
		return
	}

	p.last = out

	fmt.Fprint(p.w, out)
}

// plural returns the plural suffix for n.
func plural(n int) string {
	if n == 1 {
		return ""
	}

	return "s"
}
