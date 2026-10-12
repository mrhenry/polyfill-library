package browserstack

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
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
// a BrowserStack browser.
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

// TestPreferredPlatformIsApplied pins the IE 10 workaround: the reliable
// platform is chosen when a version is offered on several, with a fallback.
func TestPreferredPlatformIsApplied(t *testing.T) {
	index := NewIndex([]Browser{
		{Browser: "ie", BrowserVersion: "10.0", OS: "Windows", OSVersion: "7"},
		{Browser: "ie", BrowserVersion: "10.0", OS: "Windows", OSVersion: "8"},
	})

	got, ok := index.Lookup("ie/10.0")
	if !ok {
		t.Fatal("ie/10.0 did not resolve")
	}

	if got.OSVersion != "8" {
		t.Errorf("ie/10.0 resolved to Windows %s, want the preferred Windows 8", got.OSVersion)
	}

	fallback := NewIndex([]Browser{
		{Browser: "ie", BrowserVersion: "10.0", OS: "Windows", OSVersion: "7"},
	})

	if got, ok := fallback.Lookup("ie/10.0"); !ok || got.OSVersion != "7" {
		t.Errorf("ie/10.0 with only Windows 7 offered resolved to %+v, want Windows 7", got)
	}
}

// TestCapabilitiesAreW3COnly guards against the JSON Wire Protocol:
// desiredCapabilities must never appear.
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
		if strings.Contains(got, forbidden) {
			t.Errorf("capabilities contain %q, which BrowserStack retires in December 2026", forbidden)
		}
	}

	for _, required := range []string{`"capabilities"`, `"alwaysMatch"`, `"firstMatch"`} {
		if !strings.Contains(got, required) {
			t.Errorf("capabilities are missing %s", required)
		}
	}
}

// TestCapabilitiesForDesktopPlatform proves a pinned platform is sent in
// bstack:options, and none when unset.
func TestCapabilitiesForDesktopPlatform(t *testing.T) {
	pinned := alwaysMatch(t, CapabilitiesFor(
		Browser{Browser: "ie", BrowserVersion: "10.0", OS: "Windows", OSVersion: "7"},
		"session", "polyfill-library", "",
	))

	bstack, _ := pinned["bstack:options"].(map[string]any)
	if bstack["os"] != "Windows" || bstack["osVersion"] != "7" {
		t.Errorf("bstack:options = %v, want os=Windows osVersion=7", bstack)
	}

	unpinned := alwaysMatch(t, CapabilitiesFor(
		Browser{Browser: "ie", BrowserVersion: "10.0"},
		"session", "polyfill-library", "",
	))

	options, _ := unpinned["bstack:options"].(map[string]any)
	if _, ok := options["os"]; ok {
		t.Error("os must not be sent when no platform is set")
	}

	if _, ok := options["osVersion"]; ok {
		t.Error("osVersion must not be sent when no platform is set")
	}
}

func TestHasPreference(t *testing.T) {
	if !HasPreference("ie/10.0") {
		t.Error("ie/10.0 should have a pinned platform")
	}

	if HasPreference("chrome/32.0") {
		t.Error("chrome/32.0 should not have a pinned platform")
	}
}

// TestCapabilitiesEnableSessionLogs proves every session records what a failure
// report reads back: the browser console, the network traffic and the session
// log itself.
func TestCapabilitiesEnableSessionLogs(t *testing.T) {
	bstack, _ := alwaysMatch(t, CapabilitiesFor(
		Browser{Browser: "chrome", BrowserVersion: "100.0"},
		"session", "polyfill-library", "",
	))["bstack:options"].(map[string]any)

	if bstack == nil {
		t.Fatal("bstack:options missing")
	}

	if got := bstack["consoleLogs"]; got != "errors" {
		t.Errorf("consoleLogs = %v, want errors enabled", got)
	}

	if got := bstack["networkLogs"]; got != true {
		t.Errorf("networkLogs = %v, want true", got)
	}

	if got := bstack["debug"]; got != true {
		t.Errorf("debug = %v, want true so the session log is kept", got)
	}

	if got := bstack["video"]; got != true {
		t.Errorf("video = %v, want true", got)
	}
}

// alwaysMatch parses the capabilities body and returns the W3C alwaysMatch
// object.
func alwaysMatch(t *testing.T, caps Capabilities) map[string]any {
	t.Helper()

	encoded, err := caps.MarshalJSON()
	if err != nil {
		t.Fatal(err)
	}

	var body struct {
		Capabilities struct {
			AlwaysMatch map[string]any `json:"alwaysMatch"`
		} `json:"capabilities"`
	}

	if err := json.Unmarshal(encoded, &body); err != nil {
		t.Fatal(err)
	}

	return body.Capabilities.AlwaysMatch
}

// TestMobileCapabilities proves real device sessions use W3C standard and
// BrowserStack vendor capabilities only, with no Appium capabilities.
func TestMobileCapabilities(t *testing.T) {
	caps := CapabilitiesFor(
		Browser{OS: "ios", OSVersion: "13", Browser: "iphone", Device: "iPhone 11", RealMobile: true},
		"session", "polyfill-library", "tunnel-id",
	)

	match := alwaysMatch(t, caps)

	// The browser name must be a browser at the W3C top level, not a device
	// alias in bstack:options.
	if got := match["browserName"]; got != "safari" {
		t.Errorf("browserName = %v, want safari at the W3C top level", got)
	}

	if got := match["platformName"]; got != "ios" {
		t.Errorf("platformName = %v, want ios", got)
	}

	// W3C standard capabilities may sit at the top level; nothing may carry an
	// Appium prefix.
	for key := range match {
		if strings.HasPrefix(key, "appium:") {
			t.Errorf("capabilities should not contain Appium key %q", key)
		}
	}

	bstack, _ := match["bstack:options"].(map[string]any)
	if bstack == nil {
		t.Fatal("bstack:options missing")
	}

	if _, ok := bstack["browserName"]; ok {
		t.Error("browserName must not be nested in bstack:options")
	}

	for _, key := range []string{"deviceName", "osVersion"} {
		if _, ok := bstack[key]; !ok {
			t.Errorf("bstack:options missing %q", key)
		}
	}

	if bstack["realMobile"] != true || bstack["deviceName"] != "iPhone 11" || bstack["osVersion"] != "13" {
		t.Errorf("bstack:options = %v, want the device selection fields", bstack)
	}
}

// TestMobileBrowserNameMapping covers the device-alias to browser translation.
func TestMobileBrowserNameMapping(t *testing.T) {
	cases := map[string]string{
		"iphone":  "safari",
		"iPad":    "safari",
		"ios":     "safari",
		"android": "chrome",
		"safari":  "safari",
		"chrome":  "chrome",
	}

	for browser, want := range cases {
		if got := mobileBrowserName(Browser{Browser: browser}); got != want {
			t.Errorf("mobileBrowserName(%q) = %q, want %q", browser, got, want)
		}
	}
}

// TestMobileCapabilitiesForAndroid proves Android devices request Chrome, the
// default browser the alias stands for.
func TestMobileCapabilitiesForAndroid(t *testing.T) {
	caps := CapabilitiesFor(
		Browser{OS: "android", OSVersion: "13.0", Browser: "android", Device: "Google Pixel 7", RealMobile: true},
		"session", "polyfill-library", "",
	)

	match := alwaysMatch(t, caps)

	if got := match["browserName"]; got != "chrome" {
		t.Errorf("browserName = %v, want chrome", got)
	}

	if got := match["platformName"]; got != "android" {
		t.Errorf("platformName = %v, want android", got)
	}
}
