// Package browserua reimplements the parts of
// @financial-times/polyfill-useragent-normaliser that the BrowserStack harness
// depends on. It only accepts the short "family/version" form used by
// test/polyfills/browsers.toml, never a real User-Agent header.
//
// Normalisation matters because polyfill browser targets are keyed by the
// normalised family: a browser below the family's baseline normalises to
// "other/0.0.0" and is skipped by the harness.
package browserua

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/Masterminds/semver/v3"
)

// Unknown is what an unrecognised or below-baseline browser normalises to.
const Unknown = "other/0.0.0"

// shortForm is the only input form this package accepts, matching the original
// package's /^(\w+)\/(\d+)(?:\.(\d+)(?:\.(\d+))?)?$/i.
var shortForm = regexp.MustCompile(`(?i)^(\w+)/(\d+)(?:\.(\d+)(?:\.(\d+))?)?$`)

// baselines is UA.getBaselines() from the original package. A browser below its
// family's baseline is not recognised.
var baselines = map[string]string{
	"edge":        "*",
	"edge_mob":    "*",
	"ie":          "9",
	"ie_mob":      "11",
	"chrome":      "29",
	"safari":      "9",
	"ios_saf":     "9",
	"ios_chr":     "9",
	"firefox":     "38",
	"firefox_mob": "38",
	"android":     "4.3",
	"opera":       "33",
	"op_mob":      "10",
	"op_mini":     "5",
	"bb":          "6",
	"samsung_mob": "4",
}

// operaToChrome remaps Chromium-based Opera releases onto the Chrome versions
// they are equivalent to, matching the original package.
var operaToChrome = map[int][2]int{
	20: {33, 0}, 21: {34, 0}, 22: {35, 0}, 23: {36, 0}, 24: {37, 0},
	25: {38, 0}, 26: {39, 0}, 27: {40, 0}, 28: {41, 0}, 29: {42, 0},
	30: {43, 0}, 31: {44, 0}, 32: {45, 0}, 33: {46, 0}, 34: {47, 0},
	35: {48, 0}, 36: {49, 0}, 37: {50, 0}, 38: {51, 0}, 39: {52, 0},
	40: {53, 0}, 41: {54, 0}, 42: {55, 0}, 43: {56, 0}, 44: {57, 0},
	45: {58, 0}, 46: {59, 0}, 47: {60, 0}, 48: {61, 0}, 49: {62, 0},
	50: {63, 0}, 51: {64, 0}, 52: {65, 0}, 53: {66, 0}, 54: {67, 0},
	55: {68, 0}, 56: {69, 0}, 57: {70, 0}, 58: {71, 0}, 59: {72, 0},
	60: {73, 0}, 61: {74, 0}, 62: {75, 0}, 63: {76, 0}, 64: {77, 0},
	65: {78, 0}, 66: {79, 0}, 67: {80, 0},
}

// UA is a normalised browser identity.
type UA struct {
	family string
	major  int
	minor  int
}

// New parses the short "family/major[.minor[.patch]]" form. Unparseable input
// becomes the unknown browser, as in the original package.
func New(s string) *UA {
	if s == "" {
		return &UA{family: "other"}
	}

	m := shortForm.FindStringSubmatch(s)
	if m == nil {
		return &UA{family: "other"}
	}

	u := &UA{
		family: strings.ToLower(m[1]),
		major:  atoiOrZero(m[2]),
		minor:  atoiOrZero(m[3]),
	}

	if u.family == "opera" {
		if chrome, ok := operaToChrome[u.major]; ok {
			u.family = "chrome"
			u.major = chrome[0]
			u.minor = chrome[1]
		}
	}

	if !u.meetsBaseline() {
		return &UA{family: "other"}
	}

	return u
}

// Family is the normalised family, or "other" when unrecognised.
func (u *UA) Family() string {
	return u.family
}

// IsUnknown reports whether the browser could not be recognised.
func (u *UA) IsUnknown() bool {
	return u.family == "other"
}

// Major is the normalised major version, 0 when unknown.
func (u *UA) Major() int {
	return u.major
}

// Minor is the normalised minor version, 0 when unknown.
func (u *UA) Minor() int {
	return u.minor
}

// Version is the normalised version string. The original package always
// reports three segments, so "chrome/32.0" becomes "32.0.0".
func (u *UA) Version() string {
	return fmt.Sprintf("%d.%d.0", u.major, u.minor)
}

// Normalize renders the browser as "family/version".
func (u *UA) Normalize() string {
	return u.family + "/" + u.Version()
}

// Satisfies reports whether the browser falls within a semver range, such as
// the "32 - 63" targets used by polyfill config.toml files.
//
// An unknown browser satisfies every range, mirroring the original package.
func (u *UA) Satisfies(rangeStr string) bool {
	if u.family == "other" {
		return true
	}

	constraint, err := semver.NewConstraint(rangeStr)
	if err != nil {
		// An unparseable range must not silently exclude a browser.
		return true
	}

	version, err := semver.NewVersion(u.Version())
	if err != nil {
		return true
	}

	return constraint.Check(version)
}

// meetsBaseline applies UA.getBaselines(). An empty or "*" baseline accepts
// every version.
func (u *UA) meetsBaseline() bool {
	baseline, known := baselines[u.family]
	if !known {
		return false
	}

	if baseline == "*" {
		return true
	}

	constraint, err := semver.NewConstraint(">=" + baseline)
	if err != nil {
		return true
	}

	version := u.Version()

	// "android" baselines use a two segment range (4.3), so pad to match the
	// three segment versions this package produces.
	if len(strings.Split(version, ".")) < len(strings.Split(baseline, ".")) {
		version += ".0"
	}

	parsed, err := semver.NewVersion(version)
	if err != nil {
		return true
	}

	return constraint.Check(parsed)
}

// Normalize parses s and renders it as "family/version".
func Normalize(s string) string {
	return New(s).Normalize()
}

// FromBrowserEntry converts a browsers.toml entry such as "ios/13" into the
// "ios_saf/13" form the polyfill browser targets use. Entries that are not
// iOS are returned unchanged.
func FromBrowserEntry(entry string) string {
	return strings.Replace(entry, "ios", "ios_saf", 1)
}

func atoiOrZero(s string) int {
	if s == "" {
		return 0
	}

	n, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}

	return n
}
