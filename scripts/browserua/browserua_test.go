package browserua

import "testing"

func TestNewParsesShortForm(t *testing.T) {
	cases := []struct {
		in      string
		family  string
		version string
	}{
		{"chrome/32.0", "chrome", "32.0.0"},
		{"chrome/151.0", "chrome", "151.0.0"},
		{"edge/15.0", "edge", "15.0.0"},
		{"firefox/38.0", "firefox", "38.0.0"},
		{"safari/9.1", "safari", "9.1.0"},
		{"ie/11.0", "ie", "11.0.0"},
		{"ios_saf/13", "ios_saf", "13.0.0"},
		{"ios_saf/26", "ios_saf", "26.0.0"},
		// Below the family baseline, so unrecognised.
		{"chrome/14.0", "other", "0.0.0"},
		{"firefox/3.6", "other", "0.0.0"},
		{"ie/6.0", "other", "0.0.0"},
		{"ie/8.0", "other", "0.0.0"},
		{"safari/5.1", "other", "0.0.0"},
		{"safari/8.0", "other", "0.0.0"},
		{"opera/12.15", "other", "0.0.0"},
		// Opera 20 is Chromium 33.
		{"opera/20.0", "chrome", "33.0.0"},
		{"opera/67.0", "chrome", "80.0.0"},
		// Garbage in, unknown out.
		{"", "other", "0.0.0"},
		{"not a browser", "other", "0.0.0"},
	}

	for _, c := range cases {
		ua := New(c.in)

		if ua.Family() != c.family {
			t.Errorf("New(%q).Family() = %q, want %q", c.in, ua.Family(), c.family)
		}

		if ua.Version() != c.version {
			t.Errorf("New(%q).Version() = %q, want %q", c.in, ua.Version(), c.version)
		}
	}
}

func TestSatisfies(t *testing.T) {
	cases := []struct {
		browser  string
		rangeStr string
		want     bool
	}{
		{"chrome/32.0", "32 - 63", true},
		{"chrome/32.0", "29 - 31", false},
		{"chrome/151.0", "32 - 63", false},
		{"safari/9.1", "8.0 - 11.1", true},
		{"safari/27.0", "8.0 - 11.1", false},
		{"ios_saf/13", "8.0 - 11.3", false},
		{"ios_saf/13", "12 - 18", true},
		{"ios_saf/26", "26", true},
		{"edge/15.0", "13 - 17", true},
		{"firefox/38.0", "29 - 57", true},
		{"ie/11.0", "<=11", true},
		{"ie/11.0", ">11", false},
		// An unparseable range must not silently exclude a browser.
		{"chrome/32.0", "not a range", true},
	}

	for _, c := range cases {
		if got := New(c.browser).Satisfies(c.rangeStr); got != c.want {
			t.Errorf("New(%q).Satisfies(%q) = %t, want %t", c.browser, c.rangeStr, got, c.want)
		}
	}
}

func TestFromBrowserEntry(t *testing.T) {
	if got := FromBrowserEntry("ios/13"); got != "ios_saf/13" {
		t.Errorf("FromBrowserEntry(ios/13) = %q, want ios_saf/13", got)
	}

	if got := FromBrowserEntry("chrome/32.0"); got != "chrome/32.0" {
		t.Errorf("FromBrowserEntry(chrome/32.0) = %q, want chrome/32.0", got)
	}
}

func TestFamilyOf(t *testing.T) {
	cases := map[string]string{
		"ios/13":                 "ios_saf",
		"chrome/32.0":            "chrome",
		"chromeForTesting/141.0": "chromefortesting",
	}

	for entry, want := range cases {
		if got := FamilyOf(entry); got != want {
			t.Errorf("FamilyOf(%q) = %q, want %q", entry, got, want)
		}
	}
}

// TestKnownEntry covers the guard against a new BrowserStack family being
// skipped silently: a known family is accepted even when below baseline, while
// an unmapped family is not.
func TestKnownEntry(t *testing.T) {
	cases := map[string]bool{
		"chrome/32.0":            true,
		"ios/13":                 true,
		"firefox/3.6":            true,
		"chromeForTesting/141.0": false,
	}

	for entry, want := range cases {
		if got := KnownEntry(entry); got != want {
			t.Errorf("KnownEntry(%q) = %t, want %t", entry, got, want)
		}
	}
}

func TestNormalize(t *testing.T) {
	if got := Normalize("ios_saf/13"); got != "ios_saf/13.0.0" {
		t.Errorf("Normalize = %q, want ios_saf/13.0.0", got)
	}

	if got := Normalize("ie/8.0"); got != Unknown {
		t.Errorf("Normalize(ie/8.0) = %q, want %q", got, Unknown)
	}
}
