package browserstack

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/BurntSushi/toml"
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

// preferredPlatform pins a browser version to the platform that provisions
// most reliably when BrowserStack offers the same version on several.
//
// IE 10 is offered on both Windows 8 and Windows 7. Measured against the
// account, Windows 8 stalls for the full session-start timeout on most second
// and later requests, while Windows 7 starts in single-digit seconds every
// time and runs the same IE 10 build. The generated list puts the newest
// Windows first, so the preference has to be explicit. If the preferred
// platform is ever withdrawn, the first offered one is used instead.
var preferredPlatform = map[string]struct{ OS, OSVersion string }{
	"ie/10.0": {OS: "Windows", OSVersion: "7"},
}

// matchesPreferred reports whether b is the preferred platform for a browser
// version key.
func matchesPreferred(key string, b Browser) bool {
	want, ok := preferredPlatform[key]

	return ok && strings.EqualFold(b.OS, want.OS) && b.OSVersion == want.OSVersion
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
// Desktop browsers use the standard W3C browserName/browserVersion pair.
// Real devices are keyed by os/os_version: the device fixes the OS, and on a
// real device the browser version follows the OS, so the OS version is what
// pins the browser version. No Appium capability is sent at all; BrowserStack
// selects the Appium version and driver compatible with the requested device,
// which is what lets the full iOS range (including 13 and 14) keep working.
//
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
			// A session whose client has gone away - for example one created
			// just after a client-side start timeout - is stopped after this
			// many seconds without a WebDriver command, so it cannot hold a
			// parallel slot indefinitely. Kept above navigateTimeout, which is
			// the longest a live session goes without issuing a command.
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

		// BrowserStack selects a recent Edge build over the EdgeHTML builds
		// that the pinned legacy versions need.
		if b.Browser == "edge" {
			caps.BStack["seleniumVersion"] = "3.5.2"
		}

		return caps
	}

	// Real devices are keyed by os/os_version.
	//
	// browserName is a standard W3C capability, so it goes in Standard rather
	// than in bstack:options, and its value has to be a browser ("safari") not
	// a device alias ("iphone").
	//
	// The device and its OS are BrowserStack vendor capabilities. No Appium
	// capability is sent: measured sessions show BrowserStack selects the
	// device and driver from bstack:options alone, so appium:deviceName,
	// appium:platformVersion and appium:automationName are redundant and have
	// no W3C standard equivalent.
	caps.Standard["browserName"] = mobileBrowserName(b)
	caps.Standard["platformName"] = strings.ToLower(b.OS)
	caps.BStack["deviceName"] = b.Device
	caps.BStack["osVersion"] = b.OSVersion
	caps.BStack["realMobile"] = true

	return caps
}

// mobileBrowserName maps a browser-list device entry onto the browser
// BrowserStack actually runs on that device.
//
// The BrowserStack REST browser list reports "iphone", "ipad" and "android" in
// its browser field, meaning "the default browser on that device". Those are
// device aliases, not W3C browser names: the standard capability wants "safari"
// on iOS and "chrome" on Android. Sending the alias, as the old harness did,
// could never select a non-default browser.
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
