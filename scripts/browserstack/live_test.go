//go:build browserstack

package browserstack

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// createSessionWithRetry mirrors the runner's retry policy: a session that
// fails to start for a transient reason (BrowserStack sometimes reports
// "Could not start Browser / Emulator") is retried; anything else is returned
// immediately.
func createSessionWithRetry(ctx context.Context, client *Client, caps Capabilities, creds Credentials) (*Session, error) {
	var lastErr error

	for attempt := 1; attempt <= 3; attempt++ {
		sessionCtx, cancel := context.WithTimeout(ctx, 4*time.Minute)
		session, err := NewSession(sessionCtx, client.HTTPClient(), Hub(), caps, creds)
		cancel()

		if err == nil {
			return session, nil
		}

		lastErr = err

		if !IsSessionStartFailure(err) {
			return nil, err
		}

		select {
		case <-ctx.Done():
			return nil, lastErr
		case <-time.After(15 * time.Second):
		}
	}

	return nil, lastErr
}

// TestLiveBrowserSelection proves the capabilities this package builds actually
// load the requested browser and version on BrowserStack.
//
// It is excluded from ordinary builds with the "browserstack" build tag because
// it creates real, billable sessions, and it needs the local tunnel (the
// sessions request local: true):
//
//	BROWSERSTACK_USERNAME=... BROWSERSTACK_ACCESS_KEY=... \
//	  go test -tags browserstack -run TestLiveBrowserSelection -v ./scripts/browserstack
//
// It deliberately includes iOS 13 and iOS 14, whose Appium 2 support is not
// documented, so a run reports whether they still start.
func TestLiveBrowserSelection(t *testing.T) {
	creds := Credentials{
		UserName:  os.Getenv("BROWSERSTACK_USERNAME"),
		AccessKey: os.Getenv("BROWSERSTACK_ACCESS_KEY"),
	}
	if !creds.Valid() {
		t.Skip("BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set")
	}

	root := filepath.Join("..", "..")

	list, err := LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	index := NewIndex(stackList.Browsers)

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Minute)
	defer cancel()

	client := New(Config{Credentials: creds})

	closeTunnel, err := client.OpenTunnel(ctx)
	if err != nil {
		t.Fatalf("opening the tunnel: %v", err)
	}
	defer closeTunnel()

	if err := client.WaitForTunnel(ctx); err != nil {
		t.Fatalf("waiting for the tunnel: %v", err)
	}

	// want lists substrings that must all appear in navigator.userAgent.
	// realDevice asserts navigator.maxTouchPoints > 0, which distinguishes a
	// real iOS device from desktop Safari: iPadOS 13+ Safari requests desktop
	// content by default, so an iPad's user agent looks like a Mac ("Macintosh
	// ... Version/14.0"), and only the touch capability gives it away.
	cases := []struct {
		entry      string
		want       []string
		realDevice bool
	}{
		{"chrome/32.0", []string{"Chrome/32"}, false},
		{"firefox/38.0", []string{"Firefox/38"}, false},
		{"edge/80.0", []string{"Edg/80"}, false},
		{"safari/13.1", []string{"Version/13.1"}, false},
		{"ios/13", []string{"Safari", "OS 13"}, true},
		{"ios/14", []string{"Safari", "Version/14"}, true},
		{"ios/15", []string{"Safari", "Version/15"}, true},
	}

	// Sanity: every entry under test must be in the curated list.
	for _, tc := range cases {
		found := false
		for _, entry := range list.Browsers {
			if entry == tc.entry {
				found = true

				break
			}
		}

		if !found {
			t.Fatalf("%s is not in browsers.toml", tc.entry)
		}
	}

	for _, tc := range cases {
		t.Run(tc.entry, func(t *testing.T) {
			browser, ok := index.Lookup(tc.entry)
			if !ok {
				t.Fatalf("no browserstack entry for %s", tc.entry)
			}

			caps := CapabilitiesFor(browser, "verify "+tc.entry, "polyfill-library verify", "")

			session, err := createSessionWithRetry(ctx, client, caps, creds)
			if err != nil {
				t.Fatalf("creating session: %v", err)
			}

			sessionCtx, cancelSession := context.WithTimeout(ctx, 4*time.Minute)
			defer cancelSession()

			defer func() {
				deleteCtx, cancelDelete := context.WithTimeout(context.Background(), 30*time.Second)
				defer cancelDelete()

				if err := session.Delete(deleteCtx); err != nil {
					t.Logf("deleting session: %v", err)
				}
			}()

			value, err := session.ExecuteScript(sessionCtx, `
				return {
					ua: String(navigator.userAgent || ''),
					touch: navigator.maxTouchPoints || 0,
					platform: String(navigator.platform || '')
				};`, nil)
			if err != nil {
				t.Fatalf("reading the browser identity: %v", err)
			}

			fields, _ := value.(map[string]any)

			ua, _ := fields["ua"].(string)
			touch, _ := fields["touch"].(float64)
			platform, _ := fields["platform"].(string)

			t.Logf("%s -> %s (touch=%d, platform=%s)", tc.entry, ua, int(touch), platform)

			for _, want := range tc.want {
				if !strings.Contains(ua, want) {
					t.Errorf("%s user agent %q does not contain %q", tc.entry, ua, want)
				}
			}

			if tc.realDevice && touch <= 0 {
				t.Errorf("%s should be a real touch device, maxTouchPoints = %d", tc.entry, int(touch))
			}
		})
	}
}
