package browserstack

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"runtime"
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

	entry := chooseBinaryEntry(reader.File)
	if entry == nil {
		return fmt.Errorf("no executable found in %s", target)
	}

	rc, err := entry.Open()
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

// chooseBinaryEntry picks the tunnel executable out of a BrowserStack archive,
// preferring the entry named like the binary and falling back to the first
// file, so an archive that carries anything else still yields a binary.
func chooseBinaryEntry(files []*zip.File) *zip.File {
	expected := localBinaryName
	if runtime.GOOS == "windows" {
		expected += ".exe"
	}

	var first *zip.File

	for _, file := range files {
		if file.FileInfo().IsDir() {
			continue
		}

		if first == nil {
			first = file
		}

		if path.Base(file.Name) == expected {
			return file
		}
	}

	return first
}
