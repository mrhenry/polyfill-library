// Package browsercmp orders the "family/version" browser entries used by the
// BrowserStack tooling. Both polyfills-browserstack and
// polyfills-update-browser-list sort those entries, so the comparison lives here
// rather than in a copy per command.
package browsercmp

import (
	"strings"

	"github.com/Masterminds/semver/v3"
)

// Coerce turns "32.0" or "13" into a semver version string, as semver.coerce
// does, padding missing segments with zeros.
func Coerce(version string) string {
	parts := strings.SplitN(version, ".", 3)

	out := make([]string, 0, 3)

	for _, part := range parts {
		digits := leadingDigits(part)
		if digits == "" {
			break
		}

		out = append(out, digits)
	}

	for len(out) < 3 {
		out = append(out, "0")
	}

	return strings.Join(out, ".")
}

// EntryLess orders "family/version" entries by family, then oldest version
// first.
func EntryLess(a, b string) bool {
	aFamily, aVersion, _ := strings.Cut(a, "/")
	bFamily, bVersion, _ := strings.Cut(b, "/")

	if aFamily != bFamily {
		return aFamily < bFamily
	}

	return VersionLess(aVersion, bVersion)
}

// VersionLess compares browser versions numerically rather than as strings, so
// "9.0" sorts before "100.0".
func VersionLess(a, b string) bool {
	ca, errA := semver.NewVersion(Coerce(a))
	cb, errB := semver.NewVersion(Coerce(b))

	if errA == nil && errB == nil {
		return ca.LessThan(cb)
	}

	return a < b
}

// leadingDigits returns the leading run of ASCII digits in s, or "".
func leadingDigits(s string) string {
	end := 0
	for end < len(s) && s[end] >= '0' && s[end] <= '9' {
		end++
	}

	return s[:end]
}
