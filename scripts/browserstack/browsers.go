package browserstack

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/BurntSushi/toml"
	"github.com/mrhenry/polyfill-library/scripts/browserua"
)

// Browser is one entry of the generated browserstackBrowsers.toml, and one
// entry of the live browsers.json. The JSON tags match the BrowserStack REST
// API.
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

// LoadBrowserList reads the checked-in browsers.toml, the curated list of
// "family/version" entries under test.
func LoadBrowserList(path string) (*BrowserList, error) {
	var list BrowserList
	if _, err := toml.DecodeFile(path, &list); err != nil {
		return nil, fmt.Errorf("reading %s: %w", path, err)
	}

	return &list, nil
}

// LoadBrowserStackList reads the generated browserstackBrowsers.toml, which
// maps a browser family and version onto an available BrowserStack device or
// platform combination.
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

// NewIndex builds a lookup over a browserstackBrowsers.toml entry list.
func NewIndex(browsers []Browser) *Index {
	idx := &Index{
		byOS:      map[string]Browser{},
		byBrowser: map[string]Browser{},
	}

	for _, b := range browsers {
		// Prefer a device match over an OS match, mirroring
		// useragentToBrowserObject() which tests os/os_version first.
		if b.OS != "" && b.OSVersion != "" {
			key := b.OS + "/" + b.OSVersion
			if _, exists := idx.byOS[key]; !exists {
				idx.byOS[key] = b
			}
		}

		if b.Browser != "" && b.BrowserVersion != "" {
			key := b.Browser + "/" + b.BrowserVersion
			if _, exists := idx.byBrowser[key]; !exists {
				idx.byBrowser[key] = b
			}
		}
	}

	return idx
}

// Lookup resolves a browsers.toml entry to a BrowserStack browser.
//
// The os/os_version form is checked first because iOS entries are keyed by
// operating system rather than by browser, exactly as the JavaScript harness
// did.
func (idx *Index) Lookup(entry string) (Browser, bool) {
	family, version, _ := strings.Cut(entry, "/")

	// entries from browsers.toml use "ios", while os_version keys in
	// browserstackBrowsers.toml use "ios".
	if b, ok := idx.byOS[family+"/"+version]; ok {
		return b, true
	}

	if b, ok := idx.byBrowser[family+"/"+version]; ok {
		return b, true
	}

	return Browser{}, false
}

// Capabilities are W3C WebDriver capabilities for one BrowserStack session.
//
// Every key is either a W3C standard capability or carries a vendor prefix.
// The JSON Wire Protocol "desiredCapabilities" form is never used.
type Capabilities struct {
	// BStack holds bstack:options.
	BStack map[string]any
	// Standard holds W3C and Appium capabilities. Appium vendor capabilities
	// carry the required "appium:" prefix.
	Standard map[string]any
}

// MarshalJSON renders the W3C session request body.
//
// Only "capabilities" is emitted: no "desiredCapabilities" key, because
// BrowserStack drops JSON Wire Protocol support on 22 December 2026.
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
// Mobile sessions target Appium 2, which requires the "appium:" prefix on
// vendor capabilities. appiumVersion is pinned explicitly rather than
// inheriting whatever BrowserStack defaults to, so behaviour does not change
// when BrowserStack moves its default from Appium 1.x to 2.19.0.
// localIdentifier binds sessions to a specific tunnel. It is only sent when
// non-empty: with a single tunnel per process BrowserStack routes on
// `local: true` alone, and sending an identifier the tunnel never registered
// prevents the remote browser from reaching the test server.
func CapabilitiesFor(b Browser, sessionName, projectName, localIdentifier string) Capabilities {
	caps := Capabilities{
		BStack: map[string]any{
			"sessionName": sessionName,
			"projectName": projectName,
			"local":       true,
			"video":       true,
			"debug":       true,
			"consoleLogs": "errors",
			"networkLogs": true,
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

		// BrowserStack selects a recent Edge build over the EdgeHTML builds
		// that the pinned legacy versions need.
		if b.Browser == "edge" {
			caps.BStack["seleniumVersion"] = "3.5.2"
		}

		return caps
	}

	// Real devices are keyed by os/os_version.
	caps.Standard["platformName"] = strings.ToLower(b.OS)
	caps.Standard["appium:automationName"] = "UiAutomator2"
	if strings.EqualFold(b.OS, "ios") {
		caps.Standard["appium:automationName"] = "XCUITest"
	}

	caps.Standard["appium:deviceName"] = b.Device
	caps.Standard["appium:platformVersion"] = b.OSVersion
	caps.Standard["appium:appiumVersion"] = AppiumVersion
	caps.BStack["deviceName"] = b.Device
	caps.BStack["osVersion"] = b.OSVersion
	caps.BStack["realMobile"] = true

	if b.Browser != "" {
		caps.BStack["browserName"] = b.Browser
	}

	return caps
}

// AppiumVersion pins Appium 2 for mobile sessions.
//
// BrowserStack moves its default from Appium 1.x to 2.19.0 on 22 December
// 2026. Pinning means the matrix behaves the same before and after that
// switch. Appium 2 requires the "appium:" capability prefix used above.
const AppiumVersion = "2.19.0"

// familyOf returns the browser family used for polyfill browser targets.
//
// iOS entries are rewritten from "ios" to "ios_saf" because polyfill configs
// key iOS targets under ios_saf.
func familyOf(entry string) string {
	return browserua.New(browserua.FromBrowserEntry(entry)).Family()
}
