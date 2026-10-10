package browserstack

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

// localBinaryName is the cached binary filename.
const localBinaryName = "BrowserStackLocal"

// localBinaryEnv overrides where the tunnel binary lives.
const localBinaryEnv = "BROWSERSTACK_LOCAL_BINARY_PATH"

const cacheDir = ".browserstack"

// downloadBaseURL serves the tunnel binary per platform and architecture.
const downloadBaseURL = "https://www.browserstack.com/browserstack-local/BrowserStackLocal"

// platformSuffix maps GOOS/GOARCH onto BrowserStack's naming.
func platformSuffix(goos, goarch string) string {
	if goos == "windows" {
		return "win32.zip"
	}

	arch := goarch

	switch goarch {
	case "amd64":
		arch = "x64"
	case "386":
		arch = "ia32"
	}

	switch goos {
	case "darwin", "linux", "freebsd", "netbsd", "openbsd", "solaris", "illumos", "aix":
		return fmt.Sprintf("-%s-%s.zip", goos, arch)
	default:
		return ""
	}
}

// hostSupportsNative reports whether a build runs natively on goarch, rather
// than under Rosetta or emulation. BrowserStack names architectures
// differently, so the suffix is mapped back onto GOARCH before comparing.
func hostSupportsNative(suffix, goarch string) bool {
	arch := archOf(suffix)

	switch arch {
	case "x64", "win32":
		arch = "amd64"
	case "ia32":
		arch = "386"
	}

	return arch == goarch
}

// localBinaryPath resolves the tunnel binary, downloading it when absent.
//
// Search order: $BROWSERSTACK_LOCAL_BINARY_PATH, the shared
// ~/.browserstack cache, ./BrowserStackLocal, then a download.
func localBinaryPath(ctx context.Context) (string, error) {
	if path := os.Getenv(localBinaryEnv); path != "" {
		if fileExists(path) {
			return path, nil
		}

		if err := downloadLocalBinary(ctx, path); err != nil {
			return "", fmt.Errorf("downloading %s: %w", path, err)
		}

		return path, nil
	}

	if path, err := userCacheBinary(); err == nil {
		return path, nil
	}

	fallback := localBinaryName
	if runtime.GOOS == "windows" {
		fallback += ".exe"
	}

	if fileExists(fallback) {
		return fallback, nil
	}

	if err := downloadLocalBinary(ctx, fallback); err != nil {
		return "", err
	}

	return fallback, nil
}

// userCacheBinary returns the binary in the shared BrowserStack cache, if one
// is present.
func userCacheBinary() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	name := localBinaryName
	if runtime.GOOS == "windows" {
		name += ".exe"
	}

	path := filepath.Join(home, cacheDir, name)
	if !fileExists(path) {
		return "", fmt.Errorf("no cached binary at %s", path)
	}

	return path, nil
}

func fileExists(path string) bool {
	info, err := os.Stat(path)

	return err == nil && !info.IsDir()
}

// downloadLocalBinary fetches and unpacks the tunnel binary. Apple Silicon has
// no published arm64 build, so the download falls back to the x64 build.
func downloadLocalBinary(ctx context.Context, dest string) error {
	candidates := []string{platformSuffix(runtime.GOOS, runtime.GOARCH)}

	if runtime.GOOS == "darwin" && runtime.GOARCH == "arm64" {
		candidates = append(candidates, "-darwin-x64.zip")
	}

	var lastErr error

	for _, candidate := range candidates {
		if candidate == "" {
			continue
		}

		if !hostSupportsNative(candidate, runtime.GOARCH) {
			log.Printf("[tunnel] : %s is not native to %s/%s, Rosetta or emulation is required",
				candidate, runtime.GOOS, runtime.GOARCH)
		}

		err := fetchAndUnpack(ctx, downloadBaseURL+candidate, dest)
		if err == nil {
			return nil
		}

		lastErr = err
	}

	return fmt.Errorf("downloading %s: %w", downloadBaseURL, lastErr)
}

// archOf extracts the architecture from a BrowserStack filename suffix such
// as "-darwin-x64.zip".
func archOf(suffix string) string {
	trimmed := strings.TrimSuffix(strings.TrimPrefix(suffix, "-"), ".zip")
	parts := strings.Split(trimmed, "-")

	return parts[len(parts)-1]
}

// OpenTunnel starts BrowserStackLocal and blocks until it reports ready. The
// returned closer is idempotent.
func (c *Client) OpenTunnel(ctx context.Context) (func() error, error) {
	binary, err := localBinaryPath(ctx)
	if err != nil {
		return func() error { return nil }, err
	}

	cmdCtx, cmdCancel := context.WithCancel(ctx)

	// A bare relative name is not looked up in the working directory by
	// exec.Command, so anchor it explicitly.
	if !strings.ContainsRune(binary, os.PathSeparator) {
		absolute, err := filepath.Abs(binary)
		if err != nil {
			cmdCancel()

			return func() error { return nil }, err
		}

		binary = absolute
	}

	cmd := exec.CommandContext( //nolint:gosec // the binary path is operator controlled
		cmdCtx,
		binary,
		c.credentials.AccessKey,
		// Non-interactive: do not prompt before killing an existing tunnel.
		"-force",
		// Skip the local dashboard and manual testing setup.
		"-onlyAutomate",
		// No --local-identifier or --force-local: both stop the remote browser
		// reaching the test server with net::ERR_CONNECTION_REFUSED. With one
		// tunnel per process, `local: true` is enough to route to it.
	)

	// BrowserStackLocal forks helpers, so a process group lets closer terminate
	// the whole tree instead of orphaning a registered tunnel.
	configureProcessGroup(cmd)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		cmdCancel()

		return func() error { return nil }, err
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		cmdCancel()

		return func() error { return nil }, err
	}

	if err := cmd.Start(); err != nil {
		cmdCancel()

		return func() error { return nil }, fmt.Errorf("starting %s: %w", binary, err)
	}

	errChan := make(chan error, 1)

	go func() { errChan <- cmd.Wait() }()

	readyChan := make(chan struct{}, 1)

	scan := func(r io.Reader, isError bool) {
		scanner := bufio.NewScanner(r)

		for scanner.Scan() {
			text := scanner.Text()

			// "Press Ctrl-C to exit" is the only reliable ready signal. The
			// "[SUCCESS] You can now access your local server(s)" line is
			// printed seconds before the WebSocket connection is established,
			// and treating it as ready makes every navigation fail with
			// net::ERR_CONNECTION_REFUSED.
			if strings.Contains(text, "Press Ctrl-C to exit") {
				select {
				case readyChan <- struct{}{}:
				default:
				}
			}

			if isError {
				log.Println("[tunnel] : error -", text)
			} else {
				log.Println("[tunnel] :", text)
			}
		}
	}

	go scan(stdout, false)
	go scan(stderr, true)

	var (
		closed   bool
		closedMu sync.Mutex
	)

	closer := func() error {
		closedMu.Lock()
		defer closedMu.Unlock()

		if closed {
			return nil
		}

		closed = true
		cmdCancel()
		killProcessGroup(cmd)

		// Killing the process is the expected way to stop the tunnel, so wait
		// for it to actually go rather than returning while it is still
		// registered with BrowserStack.
		select {
		case err := <-errChan:
			if err != nil && strings.Contains(err.Error(), "signal: killed") {
				return nil
			}

			return err
		case <-time.After(15 * time.Second):
			return fmt.Errorf("tunnel process did not exit after being killed")
		}
	}

	startCtx, startCancel := context.WithTimeout(ctx, 2*time.Minute)
	defer startCancel()

	select {
	case <-readyChan:
		log.Println("[tunnel] : ready")
	case err := <-errChan:
		return closer, fmt.Errorf("tunnel exited during startup: %w", err)
	case <-startCtx.Done():
		return closer, fmt.Errorf("tunnel did not become ready in time: %w", startCtx.Err())
	}

	return closer, nil
}
