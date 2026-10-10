package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"sync/atomic"
)

// Correlation ids.
//
// Every request a browser makes while running a job carries `trace`, so a
// failure can be attributed to the exact requests it caused. The id is
// "<run><seq>-<slug>", unique per process and job, and URL safe.

var traceCounter atomic.Int64

func newRunID() string {
	var buf [3]byte

	if _, err := rand.Read(buf[:]); err != nil {
		// crypto/rand only fails on a broken system; the sequence keeps ids
		// distinct within the run either way.
		return "r0"
	}

	return "r" + hex.EncodeToString(buf[:])
}

func nextTrace(runID, slug string) string {
	sequence := traceCounter.Add(1)

	return fmt.Sprintf("%s%03d-%s", runID, sequence, slugify(slug))
}

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
