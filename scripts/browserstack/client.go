// Package browserstack contains the BrowserStack integration: credentials, the
// BrowserStackLocal tunnel and a W3C-only WebDriver session client. It never
// sends "desiredCapabilities" or negotiates BiDi, so it does not depend on the
// JSON Wire Protocol that BrowserStack retires in December 2026.
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

// BrowsersAPIURL lists every browser and version BrowserStack offers.
const BrowsersAPIURL = "https://api.browserstack.com/automate/browsers.json"

// PlanAPIURL reports the account's plan, including its parallel allowance.
const PlanAPIURL = "https://api.browserstack.com/automate/plan.json"

// Credentials are the BrowserStack account details.
type Credentials struct {
	UserName  string
	AccessKey string
}

// Valid reports whether both credentials are present.
func (c Credentials) Valid() bool {
	return c.UserName != "" && c.AccessKey != ""
}

// Client talks to the BrowserStack REST API.
type Client struct {
	http        *http.Client
	credentials Credentials
}

// Config configures a Client.
type Config struct {
	Credentials Credentials
}

// New builds a Client that authenticates every request with HTTP Basic auth.
func New(config Config) *Client {
	transport := roundTripperFunc(func(req *http.Request) (*http.Response, error) {
		req.SetBasicAuth(config.Credentials.UserName, config.Credentials.AccessKey)

		return http.DefaultTransport.RoundTrip(req)
	})

	return &Client{
		credentials: config.Credentials,
		http: &http.Client{
			Transport: transport,
		},
	}
}

// HTTPClient is the authenticated HTTP client, used for WebDriver calls.
func (c *Client) HTTPClient() *http.Client {
	return c.http
}

// Credentials returns the configured credentials.
func (c *Client) Credentials() Credentials {
	return c.credentials
}

// Browsers fetches every browser and version BrowserStack offers.
func (c *Client) Browsers(ctx context.Context) ([]Browser, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, BrowsersAPIURL, nil)
	if err != nil {
		return nil, err
	}

	res, err := c.http.Do(req)
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

// Plan is the account plan, of which the parallel session allowance is used.
type Plan struct {
	AutomatePlan               string `json:"automate_plan"`
	ParallelSessionsMaxAllowed int    `json:"parallel_sessions_max_allowed"`
	ParallelSessionsRunning    int    `json:"parallel_sessions_running"`
}

// Plan reads the account plan. Best effort: the caller supplies a default.
func (c *Client) Plan(ctx context.Context) (Plan, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, PlanAPIURL, nil)
	if err != nil {
		return Plan{}, err
	}

	res, err := c.http.Do(req)
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

type roundTripperFunc func(*http.Request) (*http.Response, error)

func (f roundTripperFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

// dialHost is the hostname BrowserStackLocal resolves to the tunnel machine.
const dialHost = "bs-local.com"

// tunnelURL builds a URL the remote browser can reach through the tunnel.
func tunnelURL(port int, path string, query url.Values) string {
	u := url.URL{
		Scheme:   "http",
		Host:     fmt.Sprintf("%s:%d", dialHost, port),
		Path:     path,
		RawQuery: query.Encode(),
	}

	return u.String()
}
