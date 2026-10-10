// Package browserua reimplements the parts of
// @financial-times/polyfill-useragent-normaliser that the BrowserStack harness
// depends on. It only accepts the short "family/version" form used by
// test/polyfills/browsers.toml, never a real User-Agent header. The baselines
// and Opera remap are generated from that package, not hand-maintained.
//
// Normalisation matters because polyfill browser targets are keyed by the
// normalised family: a browser below the family's baseline normalises to
// "other/0.0.0" and is skipped by the harness.
package browserua

import (
	_ "embed"
	"encoding/json"
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

// tables.json is generated from @financial-times/polyfill-useragent-normaliser
// by `npm run generate-browserua-tables`, so the baselines and the Opera remap
// have one source of truth rather than a copy that drifts.
//
//go:embed tables.json
var tablesJSON []byte

// browserTables mirrors the generated tables.json.
type browserTables struct {
	Baselines     map[string]string `json:"baselines"`
	OperaToChrome map[string]struct {
		Major int `json:"major"`
		Minor int `json:"minor"`
	} `json:"operaToChrome"`
}

// baselines is UA.getBaselines(). A browser below its family's baseline is not
// recognised.
var baselines map[string]string

// operaToChrome remaps Chromium-based Opera releases onto the Chrome versions
// they are equivalent to.
var operaToChrome map[int][2]int

func init() {
	var tables browserTables
	if err := json.Unmarshal(tablesJSON, &tables); err != nil {
		panic("browserua: parsing tables.json: " + err.Error())
	}

	baselines = tables.Baselines
	operaToChrome = make(map[int][2]int, len(tables.OperaToChrome))

	for major, chrome := range tables.OperaToChrome {
		n, err := strconv.Atoi(major)
		if err != nil {
			continue
		}

		operaToChrome[n] = [2]int{chrome.Major, chrome.Minor}
	}
}

// entryFamilyAliases maps a BrowserStack browser-list family onto the family the
// polyfill library uses. Only names that differ need an entry.
var entryFamilyAliases = map[string]string{
	"ios": "ios_saf",
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
// family form the polyfill browser targets use. Entries whose family already
// matches are returned unchanged.
func FromBrowserEntry(entry string) string {
	family, version, hasVersion := strings.Cut(entry, "/")

	family = libraryFamily(family)

	if !hasVersion {
		return family
	}

	return family + "/" + version
}

// libraryFamily maps a browser-list family onto the polyfill library's name.
func libraryFamily(family string) string {
	family = strings.ToLower(family)

	if alias, ok := entryFamilyAliases[family]; ok {
		return alias
	}

	return family
}

// FamilyOf returns the library family a browsers.toml entry names.
func FamilyOf(entry string) string {
	family, _, _ := strings.Cut(entry, "/")

	return libraryFamily(family)
}

// FamilyKnown reports whether the library targets a family at all, ignoring the
// version baseline. It separates a genuinely new browser family, which needs an
// explicit mapping or exclusion, from a below-baseline version, which is skipped
// by design.
func FamilyKnown(family string) bool {
	_, ok := baselines[strings.ToLower(family)]

	return ok
}

// KnownEntry reports whether a browsers.toml entry names a family the library
// targets, ignoring the version baseline.
func KnownEntry(entry string) bool {
	return FamilyKnown(FamilyOf(entry))
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
