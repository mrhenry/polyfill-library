package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"sync/atomic"
)

// Correlation ids.
//
// Every request a browser makes while running a job carries `trace`, so a
// failure can be attributed to the exact requests it caused in the test server
// log. Timestamps cannot do that once sessions overlap.
//
// The id is "<run><seq>-<slug>", where the run is unique per process and the
// sequence numbers jobs in the order they were built. It is deliberately URL
// safe and short enough to read in a log line.

var traceCounter atomic.Int64

// newRunID returns an identifier unique to this process.
func newRunID() string {
	var buf [3]byte

	if _, err := rand.Read(buf[:]); err != nil {
		// crypto/rand only fails on a broken system; the sequence keeps ids
		// distinct within the run either way.
		return "r0"
	}

	return "r" + hex.EncodeToString(buf[:])
}

// nextTrace returns the correlation id for one job.
func nextTrace(runID, slug string) string {
	sequence := traceCounter.Add(1)

	return fmt.Sprintf("%s%03d-%s", runID, sequence, slugify(slug))
}

// slugify makes a browser name safe to carry in a query parameter, so the log
// line identifies the browser as well as the job.
func slugify(s string) string {
	var b strings.Builder

	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9', r == '.', r == '-', r == '_':
			b.WriteRune(r)
		default:
			b.WriteRune('-')
		}
	}

	// The server rejects anything over 80 characters, so keep it short.
	if out := b.String(); len(out) > 48 {
		return out[:48]
	}

	return b.String()
}

// traceSequence extracts the sequence number from a trace id, for tests.
func traceSequence(trace string) int {
	parts := strings.SplitN(trace, "-", 2)
	if len(parts) == 0 {
		return 0
	}

	digits := strings.TrimLeft(parts[0], "r")

	for len(digits) > 0 && digits[len(digits)-1] >= '0' && digits[len(digits)-1] <= '9' {
		digits = digits[:len(digits)-1]
	}

	n, err := strconv.Atoi(digits)
	if err != nil {
		return 0
	}

	return n
}
