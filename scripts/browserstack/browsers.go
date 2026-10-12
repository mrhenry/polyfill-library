package browserstack

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/BurntSushi/toml"
)

// Browser is one entry of browserstackBrowsers.toml or the live browsers.json.
// The tags are the BrowserStack API field names.
type Browser struct {
	Browser        string `json:"browser" toml:"browser"`
	BrowserVersion string `json:"browser_version" toml:"browser_version"`
	Device         string `json:"device" toml:"device"`
	OS             string `json:"os" toml:"os"`
	OSVersion      string `json:"os_version" toml:"os_version"`
	RealMobile     bool   `json:"real_mobile" toml:"real_mobile"`
}

// BrowserList is the parsed browsers.toml.
type BrowserList struct {
	Browsers []string `toml:"browsers"`
}

// BrowserStackList is the parsed browserstackBrowsers.toml.
type BrowserStackList struct {
	Browsers []Browser `toml:"browsers"`
}

// LoadBrowserList reads browsers.toml, the curated "family/version" entries
// under test.
func LoadBrowserList(path string) (*BrowserList, error) {
	var list BrowserList
	if _, err := toml.DecodeFile(path, &list); err != nil {
		return nil, fmt.Errorf("reading %s: %w", path, err)
	}

	return &list, nil
}

// LoadBrowserStackList reads the generated browserstackBrowsers.toml, which
// maps a browser family and version onto an available BrowserStack platform.
func LoadBrowserStackList(path string) (*BrowserStackList, error) {
	var list BrowserStackList
	if _, err := toml.DecodeFile(path, &list); err != nil {
		return nil, fmt.Errorf("reading %s: %w", path, err)
	}

	return &list, nil
}

// Index resolves a browsers.toml entry to a BrowserStack browser.
type Index struct {
	byOS      map[string]Browser
	byBrowser map[string]Browser
}

// preferredPlatform pins a version to the platform that provisions most
// reliably when several are offered. IE 10 starts on Windows 8 but not Windows
// 7, and the generated list puts the newest Windows first. A withdrawn platform
// falls back to the first offered.
var preferredPlatform = map[string]struct{ OS, OSVersion string }{
	"ie/10.0": {OS: "Windows", OSVersion: "8"},
}

func matchesPreferred(key string, b Browser) bool {
	want, ok := preferredPlatform[key]

	return ok && strings.EqualFold(b.OS, want.OS) && b.OSVersion == want.OSVersion
}

// HasPreference reports whether an entry has a pinned platform.
func HasPreference(entry string) bool {
	_, ok := preferredPlatform[entry]

	return ok
}

// NewIndex indexes a browserstackBrowsers.toml entry list for Lookup. Later
// entries never displace an earlier one, except for a preferred platform.
func NewIndex(browsers []Browser) *Index {
	idx := &Index{
		byOS:      map[string]Browser{},
		byBrowser: map[string]Browser{},
	}

	for _, b := range browsers {
		if b.OS != "" && b.OSVersion != "" {
			key := b.OS + "/" + b.OSVersion
			if _, exists := idx.byOS[key]; !exists {
				idx.byOS[key] = b
			}
		}

		if b.Browser == "" || b.BrowserVersion == "" {
			continue
		}

		key := b.Browser + "/" + b.BrowserVersion

		existing, exists := idx.byBrowser[key]

		switch {
		case !exists:
			idx.byBrowser[key] = b
		case matchesPreferred(key, b) && !matchesPreferred(key, existing):
			// Upgrade a fallback to the preferred platform.
			idx.byBrowser[key] = b
		}
	}

	return idx
}

// Lookup resolves a browsers.toml entry to a BrowserStack browser.
//
// The os/os_version form is checked first because iOS entries are keyed by
// operating system rather than by browser.
func (idx *Index) Lookup(entry string) (Browser, bool) {
	family, version, _ := strings.Cut(entry, "/")

	if b, ok := idx.byOS[family+"/"+version]; ok {
		return b, true
	}

	if b, ok := idx.byBrowser[family+"/"+version]; ok {
		return b, true
	}

	return Browser{}, false
}

// Capabilities are W3C WebDriver capabilities for one BrowserStack session.
// Every key is a W3C standard capability or carries a vendor prefix.
type Capabilities struct {
	// BStack holds bstack:options.
	BStack map[string]any
	// Standard holds W3C and Appium capabilities.
	Standard map[string]any
}

// MarshalJSON renders the W3C session request body, the only shape
// BrowserStack accepts once the legacy protocol is retired.
func (c Capabilities) MarshalJSON() ([]byte, error) {
	alwaysMatch := map[string]any{}
	for k, v := range c.Standard {
		alwaysMatch[k] = v
	}

	if len(c.BStack) > 0 {
		alwaysMatch["bstack:options"] = c.BStack
	}

	return json.Marshal(map[string]any{
		"capabilities": map[string]any{
			"alwaysMatch": alwaysMatch,
			"firstMatch":  []map[string]any{{}},
		},
	})
}

// CapabilitiesFor builds the W3C capabilities for a BrowserStack browser.
//
// Desktop browsers use browserName/browserVersion, plus os/osVersion when set.
// Real devices are keyed by os/os_version: the device fixes the OS. No Appium
// capability is sent, so BrowserStack picks a compatible version and driver.
// localIdentifier is only sent when non-empty.
func CapabilitiesFor(b Browser, sessionName, projectName, localIdentifier string) Capabilities {
	caps := Capabilities{
		BStack: map[string]any{
			"sessionName": sessionName,
			"projectName": projectName,
			"local":       true,
			"video":       true,
			"debug":       true,
			// Warnings as well as errors: the failure report shows both levels.
			"consoleLogs": "warnings",
			"networkLogs": true,
			// Stops a session whose client has gone away from holding a
			// parallel slot. Kept above navigateTimeout.
			"idleTimeout": 300,
		},
		Standard: map[string]any{},
	}

	if localIdentifier != "" {
		caps.BStack["localIdentifier"] = localIdentifier
	}

	// Desktop browsers are keyed by browser/browser_version.
	if b.Device == "" {
		if b.Browser != "" {
			caps.Standard["browserName"] = b.Browser
		}

		if b.BrowserVersion != "" {
			caps.Standard["browserVersion"] = b.BrowserVersion
		}

		if b.OS != "" {
			caps.BStack["os"] = b.OS
		}

		if b.OSVersion != "" {
			caps.BStack["osVersion"] = b.OSVersion
		}

		// BrowserStack otherwise picks a recent Edge over the EdgeHTML builds
		// the pinned legacy versions need.
		if b.Browser == "edge" {
			caps.BStack["seleniumVersion"] = "3.5.2"
		}

		return caps
	}

	// browserName's value must be a browser ("safari"), not a device alias.
	caps.Standard["browserName"] = mobileBrowserName(b)
	caps.Standard["platformName"] = strings.ToLower(b.OS)
	caps.BStack["deviceName"] = b.Device
	caps.BStack["osVersion"] = b.OSVersion
	caps.BStack["realMobile"] = true

	return caps
}

// mobileBrowserName maps a device alias from the REST list ("iphone", "ipad",
// "android") onto the W3C browser name BrowserStack runs on it.
func mobileBrowserName(b Browser) string {
	switch strings.ToLower(b.Browser) {
	case "iphone", "ipad", "ios":
		return "safari"
	case "android":
		return "chrome"
	default:
		return b.Browser
	}
}
