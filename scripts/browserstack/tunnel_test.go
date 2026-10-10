package browserstack

import (
	"runtime"
	"testing"
)

func TestPlatformSuffix(t *testing.T) {
	for _, tt := range []struct {
		goos, goarch, want string
	}{
		{"linux", "amd64", "-linux-x64.zip"},
		{"linux", "386", "-linux-ia32.zip"},
		{"linux", "arm64", "-linux-arm64.zip"},
		{"darwin", "amd64", "-darwin-x64.zip"},
		{"darwin", "arm64", "-darwin-arm64.zip"},
		{"windows", "amd64", "win32.zip"},
		{"windows", "arm64", "win32.zip"},
		{"plan9", "amd64", ""},
	} {
		if got := platformSuffix(tt.goos, tt.goarch); got != tt.want {
			t.Errorf("platformSuffix(%q, %q) = %q, want %q", tt.goos, tt.goarch, got, tt.want)
		}
	}
}

func TestArchOf(t *testing.T) {
	for suffix, want := range map[string]string{
		"-linux-x64.zip":    "x64",
		"-darwin-arm64.zip": "arm64",
		"win32.zip":         "win32",
	} {
		if got := archOf(suffix); got != want {
			t.Errorf("archOf(%q) = %q, want %q", suffix, got, want)
		}
	}
}

// TestHostSupportsNative guards the architecture comparison, which has to map
// BrowserStack's naming back onto GOARCH. Comparing the two spellings directly
// makes every x64 build look foreign, so an amd64 or arm64 host warns about
// needing Rosetta on the machine that is actually native.
func TestHostSupportsNative(t *testing.T) {
	for _, tt := range []struct {
		suffix string
		goarch string
		want   bool
	}{
		{suffix: "-darwin-arm64.zip", goarch: "arm64", want: true},
		{suffix: "-linux-x64.zip", goarch: "amd64", want: true},
		{suffix: "-linux-x64.zip", goarch: "arm64", want: false},
		{suffix: "-darwin-x64.zip", goarch: "arm64", want: false},
		{suffix: "-linux-ia32.zip", goarch: "386", want: true},
		{suffix: "win32.zip", goarch: "amd64", want: true},
	} {
		if got := hostSupportsNative(tt.suffix, tt.goarch); got != tt.want {
			t.Errorf("hostSupportsNative(%q, %q) = %t, want %t", tt.suffix, tt.goarch, got, tt.want)
		}
	}
}

// TestHostSupportsNativeThisMachine proves the host's own build is never
// reported as needing emulation.
func TestHostSupportsNativeThisMachine(t *testing.T) {
	suffix := platformSuffix(runtime.GOOS, runtime.GOARCH)

	if !hostSupportsNative(suffix, runtime.GOARCH) {
		t.Errorf("%s/%s reports its own %q build as non-native", runtime.GOOS, runtime.GOARCH, suffix)
	}
}
