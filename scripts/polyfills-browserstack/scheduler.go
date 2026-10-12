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

	// passPause is the pause between one pass and the next.
	passPause time.Duration
}

// newScheduler builds the production scheduler.
func newScheduler(runner jobRunner, maxConcurrency int) *scheduler {
	return &scheduler{
		runner:         runner,
		printer:        newProgressPrinter(os.Stdout),
		maxConcurrency: maxConcurrency,
		tick:           pollTick,
		passPause:      passPause,
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

	var sem = make(chan struct{}, s.maxConcurrency)

	// Passes run one after another, so a browser is never asked for two
	// machines at once; the job board keeps ticking across the pause.
	for i, p := range passes(jobs) {
		if i > 0 {
			select {
			case <-ctx.Done():
			case <-time.After(s.passPause):
			}
		}

		if ctx.Err() != nil {
			break
		}

		s.runPass(ctx, p.jobs, sem)
	}

	ticker.Stop()
	close(stopProgress)

	<-progressDone

	s.printer.print(jobs)

	failed := 0

	for _, j := range jobs {
		if j.state.failed() {
			failed++
		}
	}

	return failed
}

// pass is one group of jobs run to completion before the next: with polyfill
// combinations the combination jobs run first, the individual jobs second.
type pass struct {
	jobs []*job
}

// passes splits jobs into the order they run. Without combinations every job
// runs in a single pass; with them the combination jobs run first.
func passes(jobs []*job) []pass {
	var combinations, individual []*job

	for _, j := range jobs {
		if j.polyfillCombinations {
			combinations = append(combinations, j)
		} else {
			individual = append(individual, j)
		}
	}

	if len(combinations) == 0 {
		return []pass{{jobs: individual}}
	}

	return []pass{
		{jobs: combinations},
		{jobs: individual},
	}
}

// runPass drives every job in one pass to completion before returning. Each
// browser is a group run one session at a time; a browser whose session hangs
// holds only its own group back.
func (s *scheduler) runPass(ctx context.Context, jobs []*job, sem chan struct{}) {
	var wg sync.WaitGroup

	for _, group := range groupByBrowser(jobs) {
		select {
		case sem <- struct{}{}:
		case <-ctx.Done():
			wg.Wait()

			return
		}

		wg.Add(1)

		go func(group []*job) {
			defer wg.Done()
			defer func() { <-sem }()

			for _, j := range group {
				if ctx.Err() != nil {
					return
				}

				s.runner.runJob(ctx, j)
			}
		}(group)
	}

	wg.Wait()
}

// groupByBrowser collects jobs that share a browser, so each browser is driven
// by one session at a time. Groups keep the order of first appearance, so a
// sorted job list drives browsers oldest first.
func groupByBrowser(jobs []*job) [][]*job {
	groups := make([][]*job, 0, len(jobs))
	at := make(map[string]int, len(jobs))

	for _, j := range jobs {
		if i, ok := at[j.name]; ok {
			groups[i] = append(groups[i], j)

			continue
		}

		at[j.name] = len(groups)
		groups = append(groups, []*job{j})
	}

	return groups
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
