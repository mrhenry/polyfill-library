package browserstack

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestSessionDetailsReadsLinks proves the harness reads back the dashboard link
// and log URLs for a session, authenticated.
func TestSessionDetailsReadsLinks(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/automate/sessions/abc123.json" {
			t.Errorf("unexpected path %q", r.URL.Path)
		}

		user, pass, ok := r.BasicAuth()
		if !ok || user != "user" || pass != "key" {
			t.Errorf("request was not authenticated: %q %q %v", user, pass, ok)
		}

		_ = json.NewEncoder(w).Encode(map[string]any{
			"automation_session": map[string]any{
				"hashed_id":                "abc123",
				"status":                   "failed",
				"reason":                   "TEST_FAILED",
				"public_url":               "https://automate.browserstack.com/abc123?auth_token=x",
				"video_url":                "https://automate.browserstack.com/abc123/video",
				"browser_console_logs_url": "https://automate.browserstack.com/abc123/console",
				"har_logs_url":             "https://automate.browserstack.com/abc123/network",
			},
		})
	}))
	t.Cleanup(srv.Close)
	t.Setenv(apiBaseEnv, srv.URL)

	client := New(Config{Credentials: Credentials{UserName: "user", AccessKey: "key"}})

	details, err := client.SessionDetails(context.Background(), "abc123")
	if err != nil {
		t.Fatal(err)
	}

	if details.Status != "failed" || details.Reason != "TEST_FAILED" {
		t.Errorf("status/reason = %q/%q, want failed/TEST_FAILED", details.Status, details.Reason)
	}

	if details.PublicURL == "" || details.VideoURL == "" || details.ConsoleLogsURL == "" || details.NetworkLogsURL == "" {
		t.Errorf("details = %+v, want every link populated", details)
	}
}

// TestConsoleLogsReadsText proves the raw browser console log is returned.
func TestConsoleLogsReadsText(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/automate/sessions/abc123/consolelogs" {
			t.Errorf("unexpected path %q", r.URL.Path)
		}

		_, _ = w.Write([]byte("1599563924892:SEVERE:Uncaught TypeError: x\n"))
	}))
	t.Cleanup(srv.Close)
	t.Setenv(apiBaseEnv, srv.URL)

	client := New(Config{Credentials: Credentials{UserName: "user", AccessKey: "key"}})

	logs, err := client.ConsoleLogs(context.Background(), "abc123")
	if err != nil {
		t.Fatal(err)
	}

	if want := "1599563924892:SEVERE:Uncaught TypeError: x"; logs != want+"\n" {
		t.Errorf("ConsoleLogs = %q, want %q", logs, want+"\n")
	}
}

// TestSessionAPIErrors proves a refused session is an error, not an empty
// success.
func TestSessionAPIErrors(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte("HTTP Basic: Access denied."))
	}))
	t.Cleanup(srv.Close)
	t.Setenv(apiBaseEnv, srv.URL)

	client := New(Config{Credentials: Credentials{UserName: "user", AccessKey: "key"}})

	if _, err := client.SessionDetails(context.Background(), "abc123"); err == nil {
		t.Error("SessionDetails should fail on a non-200 response")
	}

	if _, err := client.ConsoleLogs(context.Background(), "abc123"); err == nil {
		t.Error("ConsoleLogs should fail on a non-200 response")
	}
}

// TestSessionTargetEscapesTheID guards the URL the session id is pasted into.
func TestSessionTargetEscapesTheID(t *testing.T) {
	t.Setenv(apiBaseEnv, "https://api.example/")

	if got, want := sessionTarget("a/b"), "https://api.example/automate/sessions/a%2Fb"; got != want {
		t.Errorf("sessionTarget = %q, want %q", got, want)
	}
}
