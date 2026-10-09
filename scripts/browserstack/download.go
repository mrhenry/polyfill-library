package browserstack

import (
	"archive/zip"
	"bytes"
	"context"
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// downloadTimeout bounds fetching the tunnel binary.
const downloadTimeout = 120 * time.Second

// fetchAndUnpack downloads a zipped tunnel binary and writes the executable to
// dest.
func fetchAndUnpack(ctx context.Context, target, dest string) error {
	ctx, cancel := context.WithTimeout(ctx, downloadTimeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	if err != nil {
		return err
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status %d for %s", res.StatusCode, target)
	}

	archive, err := io.ReadAll(res.Body)
	if err != nil {
		return err
	}

	reader, err := zip.NewReader(bytes.NewReader(archive), int64(len(archive)))
	if err != nil {
		return err
	}

	for _, file := range reader.File {
		if file.FileInfo().IsDir() {
			continue
		}

		rc, err := file.Open()
		if err != nil {
			return err
		}

		payload, err := io.ReadAll(rc)
		rc.Close()

		if err != nil {
			return err
		}

		if err := os.WriteFile(dest, payload, 0o700); err != nil { //nolint:gosec // the tunnel must be executable
			return err
		}

		return os.Chmod(dest, 0o700)
	}

	return fmt.Errorf("no executable found in %s", target)
}

// newLocalIdentifier returns a UUID-shaped identifier used to bind sessions to
// this process' tunnel.
func newLocalIdentifier() string {
	var buf [16]byte

	if _, err := rand.Read(buf[:]); err != nil {
		// crypto/rand only fails on a broken system, in which case a
		// timestamp is still unique enough to group one process' sessions.
		now := time.Now().UnixNano()
		for i := range buf {
			buf[i] = byte(now >> (8 * (i % 8)))
		}
	}

	// RFC 4122 version 4 layout.
	buf[6] = (buf[6] & 0x0f) | 0x40
	buf[8] = (buf[8] & 0x3f) | 0x80

	return fmt.Sprintf("%x-%x-%x-%x-%x", buf[0:4], buf[4:6], buf[6:8], buf[8:10], buf[10:16])
}
