// Package browserstack contains the BrowserStack integration: credentials, the
// BrowserStackLocal tunnel and a W3C-only WebDriver session client. It never
// sends "desiredCapabilities" or negotiates BiDi.
package browserstack

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// HubURL is the BrowserStack Automate WebDriver endpoint.
const HubURL = "https://hub-cloud.browserstack.com/wd/hub"

// hubURLEnv overrides the WebDriver endpoint, for tests.
const hubURLEnv = "POLYFILLS_BROWSERSTACK_HUB"

// Hub returns the WebDriver endpoint to use.
func Hub() string {
	if override := os.Getenv(hubURLEnv); override != "" {
		return override
	}

	return HubURL
}

// apiBaseEnv overrides the BrowserStack REST base URL, for tests.
const apiBaseEnv = "POLYFILLS_BROWSERSTACK_API"

// APIBase is the BrowserStack REST base URL. It is read per call so tests can
// point it at a local server.
func APIBase() string {
	if override := os.Getenv(apiBaseEnv); override != "" {
		return strings.TrimSuffix(override, "/")
	}

	return "https://api.browserstack.com"
}

// The REST paths the harness reads, all relative to APIBase.
const (
	browsersAPIPath = "/automate/browsers.json"
	planAPIPath     = "/automate/plan.json"
	sessionsAPIPath = "/automate/sessions/"
)

// Credentials are the BrowserStack account details.
type Credentials struct {
	UserName  string
	AccessKey string
}

// Valid reports whether both credentials are present.
func (c Credentials) Valid() bool {
	return c.UserName != "" && c.AccessKey != ""
}

// ProjectName is the BrowserStack project every session is filed under.
const ProjectName = "polyfill-library"

// Client talks to the BrowserStack REST API and starts WebDriver sessions.
type Client struct {
	http        *http.Client
	credentials Credentials
}

// Config configures a Client.
type Config struct {
	Credentials Credentials
}

// New builds a Client. Credentials are applied per request by do, so the client
// itself carries no auth state.
func New(config Config) *Client {
	return &Client{
		credentials: config.Credentials,
		http:        &http.Client{},
	}
}

// Dial starts one BrowserStack session for a browser: it builds the
// capabilities and the session request, so a caller never reassembles the HTTP
// transport, the hub URL or the credentials.
func (c *Client) Dial(ctx context.Context, browser Browser, sessionName string) (Driver, error) {
	caps := CapabilitiesFor(browser, sessionName, ProjectName, "")

	return NewSession(ctx, c.http, Hub(), caps, c.credentials)
}

// Browsers fetches every browser and version BrowserStack offers.
func (c *Client) Browsers(ctx context.Context) ([]Browser, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	res, err := do(ctx, c.http, c.credentials, http.MethodGet, APIBase()+browsersAPIPath, nil)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	// Auth failures come back as plain text, not a JSON error envelope.
	if strings.Contains(string(body), "HTTP Basic: Access denied.") {
		return nil, errors.New("access denied")
	}

	if res.StatusCode != http.StatusOK {
		return nil, decodeError(res.StatusCode, body)
	}

	var browsers []Browser
	if err := json.Unmarshal(body, &browsers); err != nil {
		return nil, fmt.Errorf("parsing browsers list: %w", err)
	}

	return browsers, nil
}

// Plan is the account plan; only the parallel session allowance is used.
type Plan struct {
	AutomatePlan               string `json:"automate_plan"`
	ParallelSessionsMaxAllowed int    `json:"parallel_sessions_max_allowed"`
	ParallelSessionsRunning    int    `json:"parallel_sessions_running"`
}

// Plan reads the account plan. Best effort: the caller supplies a default.
func (c *Client) Plan(ctx context.Context) (Plan, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	res, err := do(ctx, c.http, c.credentials, http.MethodGet, APIBase()+planAPIPath, nil)
	if err != nil {
		return Plan{}, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return Plan{}, err
	}

	if res.StatusCode != http.StatusOK {
		return Plan{}, decodeError(res.StatusCode, body)
	}

	var plan Plan
	if err := json.Unmarshal(body, &plan); err != nil {
		return Plan{}, fmt.Errorf("parsing account plan: %w", err)
	}

	return plan, nil
}

// SessionDetails is what BrowserStack recorded for one session: its outcome and
// the links to its recording and logs. The console, network and Selenium log
// URLs are pre-signed and expire, so they are fetched fresh at reporting time.
type SessionDetails struct {
	HashedID string `json:"hashed_id"`
	Name     string `json:"name"`
	Status   string `json:"status"`
	Reason   string `json:"reason"`

	// PublicURL opens the session dashboard without signing in.
	PublicURL string `json:"public_url"`
	VideoURL  string `json:"video_url"`

	// LogsURL is the dashboard's combined session log.
	LogsURL        string `json:"logs"`
	ConsoleLogsURL string `json:"browser_console_logs_url"`
	NetworkLogsURL string `json:"har_logs_url"`
}

// SessionDetails reads what BrowserStack recorded for a session.
func (c *Client) SessionDetails(ctx context.Context, id string) (SessionDetails, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	res, err := do(ctx, c.http, c.credentials, http.MethodGet, sessionTarget(id)+".json", nil)
	if err != nil {
		return SessionDetails{}, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return SessionDetails{}, err
	}

	if res.StatusCode != http.StatusOK {
		return SessionDetails{}, decodeError(res.StatusCode, body)
	}

	var parsed struct {
		Session SessionDetails `json:"automation_session"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return SessionDetails{}, fmt.Errorf("parsing session details: %w", err)
	}

	return parsed.Session, nil
}

// ConsoleLogs reads the browser console output BrowserStack captured for a
// session, as plain text. Browsers that do not report console logs answer with
// an empty body, which is not an error.
func (c *Client) ConsoleLogs(ctx context.Context, id string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	res, err := do(ctx, c.http, c.credentials, http.MethodGet, sessionTarget(id)+"/consolelogs", nil)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	if res.StatusCode != http.StatusOK {
		return "", decodeError(res.StatusCode, body)
	}

	return string(body), nil
}

// sessionTarget is the REST target for one session, with the id escaped so it
// cannot alter the path.
func sessionTarget(id string) string {
	return APIBase() + sessionsAPIPath + url.PathEscape(id)
}

// apiError is BrowserStack's JSON error envelope.
type apiError struct {
	StatusCode int    `json:"-"`
	Message    string `json:"message"`
	Errors     []struct {
		Field string `json:"field"`
		Code  string `json:"code"`
	} `json:"errors"`
}

func (e apiError) Error() string {
	if e.Message == "" {
		return fmt.Sprintf("browserstack api error (%d)", e.StatusCode)
	}

	return fmt.Sprintf("browserstack api error (%d): %s", e.StatusCode, e.Message)
}

func decodeError(statusCode int, body []byte) error {
	var apiErr apiError
	if err := json.Unmarshal(body, &apiErr); err == nil && apiErr.Message != "" {
		apiErr.StatusCode = statusCode

		return apiErr
	}

	return fmt.Errorf("browserstack api error (%d): %s", statusCode, strings.TrimSpace(string(body)))
}
