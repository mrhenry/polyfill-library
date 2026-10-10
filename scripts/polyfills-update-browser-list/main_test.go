package main

import (
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"testing"

	"github.com/mrhenry/polyfill-library/scripts/browserstack"
)

// writeBrowsersTOML writes a browsers.toml to a temp dir and returns its path.
func writeBrowsersTOML(t *testing.T, content string) string {
	t.Helper()

	path := filepath.Join(t.TempDir(), "browsers.toml")
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}

	return path
}

func TestParseEntry(t *testing.T) {
	cases := []struct {
		name    string
		line    string
		entry   string
		comment string
		ok      bool
	}{
		{
			name:  "enabled without comment",
			line:  `  "chrome/32.0",`,
			entry: "chrome/32.0",
			ok:    true,
		},
		{
			name:    "enabled with comment",
			line:    `  "edge/80.0", # oldest chromium edge version we can test`,
			entry:   "edge/80.0",
			comment: "oldest chromium edge version we can test",
			ok:      true,
		},
		{
			name:  "disabled without comment",
			line:  `  # "chrome/33.0",`,
			entry: "chrome/33.0",
			ok:    true,
		},
		{
			name:    "disabled with comment",
			line:    `  # "chrome/34.0", # flaky on CI`,
			entry:   "chrome/34.0",
			comment: "flaky on CI",
			ok:      true,
		},
		{
			name: "array header",
			line: `browsers = [`,
			ok:   false,
		},
		{
			name: "plain note",
			line: `  # a plain note with no entry`,
			ok:   false,
		},
		{
			name: "closing bracket",
			line: `]`,
			ok:   false,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			entry, comment, ok := parseEntry(tc.line)

			if ok != tc.ok {
				t.Fatalf("parseEntry(%q) ok = %t, want %t", tc.line, ok, tc.ok)
			}

			if !ok {
				return
			}

			if entry != tc.entry {
				t.Errorf("entry = %q, want %q", entry, tc.entry)
			}

			if comment != tc.comment {
				t.Errorf("comment = %q, want %q", comment, tc.comment)
			}
		})
	}
}

// TestReadEntryStatesPreservesCuration covers the whole point of the updater:
// which entries a maintainer commented out and the notes beside them must be
// read back so they can be re-rendered.
func TestReadEntryStatesPreservesCuration(t *testing.T) {
	raw := header +
		"browsers = [\n" +
		"  # \"chrome/33.0\", # flaky on CI\n" +
		"  \"chrome/35.0\",\n" +
		"  \"edge/80.0\", # oldest chromium edge version we can test\n" +
		"]\n"

	states := readEntryStates(writeBrowsersTOML(t, raw))

	if got := states["chrome/33.0"]; !got.disabled || got.comment != "flaky on CI" {
		t.Errorf("chrome/33.0 = %+v, want disabled with comment \"flaky on CI\"", got)
	}

	if got := states["chrome/35.0"]; got.disabled || got.comment != "" {
		t.Errorf("chrome/35.0 = %+v, want enabled with no comment", got)
	}

	if got := states["edge/80.0"]; got.disabled || got.comment != "oldest chromium edge version we can test" {
		t.Errorf("edge/80.0 = %+v, want enabled with its note", got)
	}
}

// TestRenderBrowsersTOMLRoundTrip proves a maintainer's curation survives a
// rewrite, including a note beside a commented-out entry, and that re-reading
// the rendered output yields the same state.
func TestRenderBrowsersTOMLRoundTrip(t *testing.T) {
	raw := header +
		"browsers = [\n" +
		"  # \"chrome/33.0\", # flaky on CI\n" +
		"  \"chrome/35.0\",\n" +
		"  \"edge/80.0\", # oldest chromium edge version we can test\n" +
		"]\n"

	path := writeBrowsersTOML(t, raw)
	states := readEntryStates(path)

	entries := []string{"chrome/33.0", "chrome/35.0", "edge/80.0"}

	got := renderBrowsersTOML(entries, states)

	for _, want := range []string{
		`  # "chrome/33.0", # flaky on CI`,
		`  "chrome/35.0",`,
		`  "edge/80.0", # oldest chromium edge version we can test`,
	} {
		if !strings.Contains(got, want) {
			t.Errorf("rendered TOML missing %q:\n%s", want, got)
		}
	}

	round := readEntryStates(writeBrowsersTOML(t, got))

	for _, entry := range entries {
		if round[entry] != states[entry] {
			t.Errorf("%s state changed on round-trip: %+v -> %+v", entry, states[entry], round[entry])
		}
	}
}

// TestRenderBrowsersTOMLAddsNewEntriesUncommented covers newly offered browsers:
// they have no recorded state, so they must be written enabled and ready for a
// maintainer to review.
func TestRenderBrowsersTOMLAddsNewEntriesUncommented(t *testing.T) {
	got := renderBrowsersTOML([]string{"chrome/152.0"}, map[string]entryState{})

	want := "  \"chrome/152.0\",\n"
	if !strings.Contains(got, want) {
		t.Errorf("rendered TOML missing %q:\n%s", want, got)
	}

	if strings.Contains(got, "# \"chrome/152.0\"") {
		t.Errorf("a new entry should not be commented out:\n%s", got)
	}
}

func TestUniqueEntries(t *testing.T) {
	browsers := []browserstack.Browser{
		{Browser: "chrome", BrowserVersion: "32.0"},
		{Browser: "chrome", BrowserVersion: "32.0"},
		{OS: "ios", OSVersion: "13", Browser: "iphone", Device: "iPhone 11"},
		{OS: "ios", OSVersion: "13", Browser: "ipad", Device: "iPad 6th"},
	}

	got := uniqueEntries(browsers)
	want := []string{"chrome/32.0", "ios/13"}

	if !reflect.DeepEqual(got, want) {
		t.Errorf("uniqueEntries() = %v, want %v", got, want)
	}
}

func TestEntryLessSortsByFamilyThenVersion(t *testing.T) {
	entries := []string{
		"safari/10.1",
		"chrome/100.0",
		"ios/13",
		"chrome/9.0",
		"edge/151.0",
		"chrome/32.0",
		"ios/9",
		"edge/15.0",
	}

	sort.SliceStable(entries, func(i, j int) bool {
		return entryLess(entries[i], entries[j])
	})

	want := []string{
		"chrome/9.0",
		"chrome/32.0",
		"chrome/100.0",
		"edge/15.0",
		"edge/151.0",
		"ios/9",
		"ios/13",
		"safari/10.1",
	}

	if !reflect.DeepEqual(entries, want) {
		t.Errorf("sorted entries = %v, want %v", entries, want)
	}
}

// TestBrowserLessOrdersDesktopVersionsAscending covers the browser_version rule.
func TestBrowserLessOrdersDesktopVersionsAscending(t *testing.T) {
	older := browserstack.Browser{Browser: "chrome", BrowserVersion: "32.0"}
	newer := browserstack.Browser{Browser: "chrome", BrowserVersion: "100.0"}

	if !browserLess(older, newer) {
		t.Error("chrome/32.0 should sort before chrome/100.0")
	}

	if browserLess(newer, older) {
		t.Error("chrome/100.0 should not sort before chrome/32.0")
	}
}

// TestBrowserLessOrdersDesktopPlatformsDescending covers the newest-OS-first
// rule for Windows and OS X, which keeps one platform per browser version.
func TestBrowserLessOrdersDesktopPlatformsDescending(t *testing.T) {
	for _, os := range []string{"Windows", "OS X"} {
		newest := browserstack.Browser{Browser: "chrome", BrowserVersion: "100.0", OS: os, OSVersion: "11"}
		oldest := browserstack.Browser{Browser: "chrome", BrowserVersion: "100.0", OS: os, OSVersion: "10"}

		if !browserLess(newest, oldest) {
			t.Errorf("%s 11 should sort before %s 10", os, os)
		}

		if browserLess(oldest, newest) {
			t.Errorf("%s 10 should not sort before %s 11", os, os)
		}
	}
}

func TestRenderBrowserStackTOML(t *testing.T) {
	out := renderBrowserStackTOML([]browserstack.Browser{
		{OS: "Windows", OSVersion: "10", Browser: "chrome", BrowserVersion: "32.0"},
		{OS: "ios", OSVersion: "13", Browser: "iphone", Device: "iPhone 11", RealMobile: true},
	})

	for _, want := range []string{
		"[[browsers]]",
		`os = "Windows"`,
		`os_version = "10"`,
		`browser = "chrome"`,
		`browser_version = "32.0"`,
		`os = "ios"`,
		`device = "iPhone 11"`,
		"real_mobile = true",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("rendered TOML missing %q:\n%s", want, out)
		}
	}

	// Empty fields must be omitted, matching the generated file.
	for _, forbidden := range []string{`device = ""`, `browser_version = ""`, `os_version = ""`} {
		if strings.Contains(out, forbidden) {
			t.Errorf("rendered TOML should omit empty field %q:\n%s", forbidden, out)
		}
	}
}

// TestRenderBrowserStackTOMLFieldOrder locks the field order to what the
// committed browserstackBrowsers.toml uses, so regenerating it produces no
// spurious diff.
func TestRenderBrowserStackTOMLFieldOrder(t *testing.T) {
	out := renderBrowserStackTOML([]browserstack.Browser{
		{OS: "ios", OSVersion: "13", Browser: "iphone", Device: "iPhone 11", RealMobile: true},
	})

	wantOrder := []string{`os = `, `os_version = `, `browser = `, `device = `, `real_mobile = `}

	last := -1
	for _, field := range wantOrder {
		at := strings.Index(out, field)
		if at == -1 {
			t.Fatalf("rendered TOML missing %q:\n%s", field, out)
		}

		if at < last {
			t.Errorf("field %q is out of order in:\n%s", field, out)
		}

		last = at
	}
}
