package browserstack

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/mrhenry/polyfill-library/scripts/browserua"
)

func repoRoot(t *testing.T) string {
	t.Helper()

	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}

	// scripts/browserstack -> repo root
	return filepath.Join(dir, "..", "..")
}

// TestBrowserListRoundTrip proves every curated browsers.toml entry resolves to
// a BrowserStack browser, so the runner cannot silently lose coverage.
func TestBrowserListRoundTrip(t *testing.T) {
	root := repoRoot(t)

	list, err := LoadBrowserList(filepath.Join(root, "test/polyfills/browsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	stackList, err := LoadBrowserStackList(filepath.Join(root, "test/polyfills/browserstackBrowsers.toml"))
	if err != nil {
		t.Fatal(err)
	}

	index := NewIndex(stackList.Browsers)

	var testable, unknown int

	for _, entry := range list.Browsers {
		ua := browserua.New(browserua.FromBrowserEntry(entry))
		if ua.IsUnknown() {
			unknown++

			continue
		}

		testable++

		if _, ok := index.Lookup(entry); !ok {
			t.Errorf("entry %q has no matching BrowserStack browser", entry)
		}
	}

	t.Logf("%d entries, %d testable, %d below the normaliser baseline", len(list.Browsers), testable, unknown)

	if testable == 0 {
		t.Fatal("no testable browsers found")
	}
}

// TestCapabilitiesAreW3COnly is the guard against the JSON Wire Protocol
// removal: the serialised capabilities must never contain desiredCapabilities.
func TestCapabilitiesAreW3COnly(t *testing.T) {
	caps := Capabilities{
		BStack: map[string]any{"sessionName": "test", "local": true},
		Standard: map[string]any{
			"browserName":    "chrome",
			"browserVersion": "32.0",
		},
	}

	encoded, err := caps.MarshalJSON()
	if err != nil {
		t.Fatal(err)
	}

	got := string(encoded)
	t.Log(got)

	for _, forbidden := range []string{"desiredCapabilities", "requiredCapabilities"} {
		if contains(got, forbidden) {
			t.Errorf("capabilities contain %q, which BrowserStack retires in December 2026", forbidden)
		}
	}

	for _, required := range []string{`"capabilities"`, `"alwaysMatch"`, `"firstMatch"`} {
		if !contains(got, required) {
			t.Errorf("capabilities are missing %s", required)
		}
	}
}

// TestMobileCapabilitiesAreAppium2 proves real device sessions use Appium 2
// with the vendor prefix Appium 2 requires.
func TestMobileCapabilitiesAreAppium2(t *testing.T) {
	caps := CapabilitiesFor(
		Browser{OS: "ios", OSVersion: "13", Browser: "iphone", Device: "iPhone 11", RealMobile: true},
		"session", "polyfill-library", "tunnel-id",
	)

	encoded, err := caps.MarshalJSON()
	if err != nil {
		t.Fatal(err)
	}

	got := string(encoded)
	t.Log(got)

	// Appium 2 rejects unprefixed vendor capabilities.
	for _, required := range []string{
		`"appium:deviceName"`,
		`"appium:platformVersion"`,
		`"appium:appiumVersion"`,
		`"platformName"`,
	} {
		if !contains(got, required) {
			t.Errorf("mobile capabilities missing %s", required)
		}
	}

	if contains(got, `"appiumVersion": "1.8.0"`) {
		t.Error("mobile capabilities still pin Appium 1.8.0")
	}
}

func contains(haystack, needle string) bool {
	return len(haystack) >= len(needle) && indexOf(haystack, needle) >= 0
}

func indexOf(haystack, needle string) int {
	for i := 0; i+len(needle) <= len(haystack); i++ {
		if haystack[i:i+len(needle)] == needle {
			return i
		}
	}

	return -1
}
