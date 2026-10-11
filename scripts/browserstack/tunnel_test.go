package browserstack

import (
	"runtime"
	"testing"
	"time"
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

// TestHostSupportsNative guards the architecture comparison, which maps
// BrowserStack's naming back onto GOARCH.
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

// TestHostSupportsNativeThisMachine proves the host's own build is native.
func TestHostSupportsNativeThisMachine(t *testing.T) {
	suffix := platformSuffix(runtime.GOOS, runtime.GOARCH)

	if !hostSupportsNative(suffix, runtime.GOARCH) {
		t.Errorf("%s/%s reports its own %q build as non-native", runtime.GOOS, runtime.GOARCH, suffix)
	}
}

// TestLatestChrome covers the tunnel probe's browser selection.
func TestLatestChrome(t *testing.T) {
	browsers := []Browser{
		{Browser: "firefox", BrowserVersion: "151.0"},
		{Browser: "chrome", BrowserVersion: "100.0"},
		{Browser: "chrome", BrowserVersion: "151.0 beta"},
		{Browser: "chrome", BrowserVersion: "9.0"},
		{Browser: "chrome", BrowserVersion: "151.0"},
	}

	got, ok := latestChrome(browsers)
	if !ok {
		t.Fatal("latestChrome found no chrome")
	}

	if got.BrowserVersion != "151.0" {
		t.Errorf("latestChrome() = %q, want the newest non-beta chrome 151.0", got.BrowserVersion)
	}

	if _, ok := latestChrome([]Browser{{Browser: "firefox", BrowserVersion: "151.0"}}); ok {
		t.Error("latestChrome must report no chrome when none is present")
	}
}

// TestNextProbeWait covers the tunnel probe backoff.
func TestNextProbeWait(t *testing.T) {
	cases := map[time.Duration]time.Duration{
		5 * time.Second:  10 * time.Second,
		10 * time.Second: 20 * time.Second,
		20 * time.Second: 30 * time.Second,
		30 * time.Second: 30 * time.Second,
	}

	for in, want := range cases {
		if got := nextProbeWait(in); got != want {
			t.Errorf("nextProbeWait(%s) = %s, want %s", in, got, want)
		}
	}
}
