package browsercmp

import "testing"

func TestCoerce(t *testing.T) {
	cases := map[string]string{
		"32.0":       "32.0.0",
		"13":         "13.0.0",
		"9.1":        "9.1.0",
		"152.0 beta": "152.0.0",
		"":           "0.0.0",
		"beta":       "0.0.0",
	}

	for in, want := range cases {
		if got := Coerce(in); got != want {
			t.Errorf("Coerce(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestEntryLess(t *testing.T) {
	if !EntryLess("chrome/9.0", "chrome/100.0") {
		t.Error("versions must compare numerically, so 9.0 sorts before 100.0")
	}

	if EntryLess("chrome/100.0", "chrome/9.0") {
		t.Error("100.0 must not sort before 9.0")
	}

	if !EntryLess("chrome/100.0", "firefox/38.0") {
		t.Error("families sort lexically, so chrome sorts before firefox")
	}
}

func TestVersionLess(t *testing.T) {
	if !VersionLess("9.0", "100.0") {
		t.Error("9.0 should sort before 100.0")
	}

	if VersionLess("100.0", "9.0") {
		t.Error("100.0 should not sort before 9.0")
	}

	if VersionLess("32.0", "32.0") {
		t.Error("equal versions are not less")
	}
}
