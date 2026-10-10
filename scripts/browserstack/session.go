package browserstack

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// ErrSessionStart marks an error raised while creating a WebDriver session.
// Session starts are retried, so every NewSession failure is wrapped in this.
var ErrSessionStart = errors.New("creating webdriver session")

// ErrCommandTimeout marks a command against an established session that did
// not answer in time, which means the remote browser has wedged.
var ErrCommandTimeout = errors.New("webdriver command timed out")

// ErrPageCrash marks a session whose remote renderer has crashed.
var ErrPageCrash = errors.New("remote browser renderer crashed")

const (
	// commandTimeout bounds an execute command; a live browser answers in
	// milliseconds, so this only fires when the session has wedged.
	commandTimeout = 60 * time.Second

	// navigateTimeout bounds a navigation, which returns only once the page
	// load completes.
	navigateTimeout = 3 * time.Minute
)

// commandTimeoutError tags a deadline as a wedged browser.
func commandTimeoutError(err error) error {
	if errors.Is(err, context.DeadlineExceeded) {
		return fmt.Errorf("%w: %w", ErrCommandTimeout, err)
	}

	return err
}

// Session is a W3C WebDriver session.
//
// Only create, navigate, execute script and delete are used, so the whole
// pinned browser matrix works without per-browser capability workarounds.
type Session struct {
	client    *http.Client
	baseURL   string
	sessionID string
	userName  string
	accessKey string
}

// sessionResponse is the W3C New Session response.
//
// BrowserStack answers with the legacy JSON Wire Protocol shape when it did not
// honour the requested capabilities. Both are accepted so the reason is visible
// in the error rather than yielding a browser that is not the one requested.
type sessionResponse struct {
	Value struct {
		SessionID string `json:"sessionId"`
		Message   string `json:"message"`
	} `json:"value"`
	Status    int            `json:"status"`
	SessionID string         `json:"sessionId"`
	LegacyCap map[string]any `json:"capabilities"`
}

// newSessionRejected carries BrowserStack's reason for refusing a session.
type newSessionRejected struct {
	message string
}

func (e *newSessionRejected) Error() string {
	return "browserstack refused to create the session: " + e.message
}

// tunnelNotConnectedMessage is what BrowserStack says when a local session is
// requested before the tunnel has finished registering.
const tunnelNotConnectedMessage = "local testing through BrowserStack is not connected"

// ErrTunnelNotConnected reports whether BrowserStack refused the session
// because the tunnel is not yet usable.
func ErrTunnelNotConnected(err error) bool {
	var rejected *newSessionRejected
	if errors.As(err, &rejected) {
		return strings.Contains(rejected.message, tunnelNotConnectedMessage)
	}

	return false
}

// commandResponse is the W3C command response envelope.
type commandResponse struct {
	Value json.RawMessage `json:"value"`
}

// NewSession starts a W3C WebDriver session on BrowserStack.
//
// No desiredCapabilities fallback is attempted, so a driver that only speaks
// JSON Wire Protocol fails loudly here.
func NewSession(ctx context.Context, httpClient *http.Client, hubURL string, caps Capabilities, creds Credentials) (*Session, error) {
	body, err := json.Marshal(caps)
	if err != nil {
		return nil, err
	}

	res, err := do(ctx, httpClient, creds, http.MethodPost, hubURL+"/session", body)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	raw, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	if res.StatusCode != http.StatusOK {
		return nil, newProtocolError(res.StatusCode, raw)
	}

	var parsed sessionResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, fmt.Errorf("parsing new session response: %w", err)
	}

	sessionID := parsed.Value.SessionID

	// A legacy shaped reply means the requested capabilities were not honoured,
	// so the session is almost certainly not routed through the tunnel.
	if sessionID == "" && parsed.SessionID != "" {
		return nil, fmt.Errorf(
			"browserstack ignored the requested capabilities and returned a legacy JSON Wire Protocol session "+
				"(browserVersion=%v): the session will not be routed through the tunnel",
			parsed.LegacyCap["browserVersion"])
	}

	if sessionID == "" {
		// BrowserStack answers HTTP 200 with the reason in value.message, for
		// example when the tunnel has not finished registering.
		if parsed.Value.Message != "" {
			return nil, &newSessionRejected{message: parsed.Value.Message}
		}

		return nil, fmt.Errorf("new session response contained no sessionId: %s", strings.TrimSpace(string(raw)))
	}

	return &Session{
		client:    httpClient,
		baseURL:   hubURL,
		sessionID: sessionID,
		userName:  creds.UserName,
		accessKey: creds.AccessKey,
	}, nil
}

// Navigate sends a W3C Navigate To command.
func (s *Session) Navigate(ctx context.Context, target string) error {
	ctx, cancel := context.WithTimeout(ctx, navigateTimeout)
	defer cancel()

	body, err := json.Marshal(map[string]string{"url": target})
	if err != nil {
		return err
	}

	res, err := do(ctx, s.client, s.credentials(), http.MethodPost, s.commandURL("/url"), body)
	if err != nil {
		return commandTimeoutError(err)
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		return newProtocolError(res.StatusCode, raw)
	}

	return nil
}

// ExecuteScript sends a W3C Execute Script command and returns the decoded
// result value.
func (s *Session) ExecuteScript(ctx context.Context, script string, args []any) (any, error) {
	ctx, cancel := context.WithTimeout(ctx, commandTimeout)
	defer cancel()

	if args == nil {
		args = []any{}
	}

	body, err := json.Marshal(map[string]any{"script": script, "args": args})
	if err != nil {
		return nil, err
	}

	res, err := do(ctx, s.client, s.credentials(), http.MethodPost, s.commandURL("/execute/sync"), body)
	if err != nil {
		return nil, commandTimeoutError(err)
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		return nil, newProtocolError(res.StatusCode, raw)
	}

	var parsed commandResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, fmt.Errorf("parsing execute response: %w", err)
	}

	if len(parsed.Value) == 0 {
		return nil, nil
	}

	var value any
	if err := json.Unmarshal(parsed.Value, &value); err != nil {
		return nil, fmt.Errorf("decoding execute result: %w", err)
	}

	return value, nil
}

// Delete ends the session.
func (s *Session) Delete(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, s.commandURL(""), nil)
	if err != nil {
		return err
	}

	req.SetBasicAuth(s.userName, s.accessKey)

	res, err := s.client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(res.Body)

	// A session that has already gone away is not worth reporting.
	if res.StatusCode != http.StatusOK && res.StatusCode != http.StatusNotFound {
		return newProtocolError(res.StatusCode, raw)
	}

	return nil
}

func (s *Session) credentials() Credentials {
	return Credentials{UserName: s.userName, AccessKey: s.accessKey}
}

func (s *Session) commandURL(suffix string) string {
	return s.baseURL + "/session/" + s.sessionID + suffix
}

func do(ctx context.Context, client *http.Client, creds Credentials, method, target string, body []byte) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, target, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json; charset=utf-8")
	req.Header.Set("Accept", "application/json")
	req.SetBasicAuth(creds.UserName, creds.AccessKey)

	return client.Do(req)
}

// protocolError is a W3C error response.
type protocolError struct {
	StatusCode int
	Body       string
}

func newProtocolError(statusCode int, body []byte) error {
	text := protocolErrorMessage(statusCode, body)

	// A crashed renderer is an ordinary protocol error, but the session is not
	// usable again, so it is tagged for the caller to replace.
	if isPageCrash(text) {
		return fmt.Errorf("%w: %s", ErrPageCrash, text)
	}

	return errors.New(text)
}

// protocolErrorMessage renders a WebDriver error response as a single line,
// accepting both the W3C and the legacy JSON Wire Protocol envelopes.
func protocolErrorMessage(statusCode int, body []byte) string {
	var envelope struct {
		Value struct {
			Error   string `json:"error"`
			Message string `json:"message"`
		} `json:"value"`
		Error   string `json:"error"`
		Message string `json:"message"`
	}

	if err := json.Unmarshal(body, &envelope); err == nil {
		code := envelope.Value.Error
		if code == "" {
			code = envelope.Error
		}

		message := envelope.Value.Message
		if message == "" {
			message = envelope.Message
		}

		if code != "" || message != "" {
			return fmt.Sprintf("webdriver error (%d): %s: %s", statusCode, code, message)
		}
	}

	return fmt.Sprintf("webdriver error (%d): %s", statusCode, strings.TrimSpace(string(body)))
}

// pageCrashMarkers are the substrings Chromedriver and BrowserStack use when
// the remote renderer has crashed. None of those sessions recover in place.
var pageCrashMarkers = []string{
	"session deleted because of page crash",
	"tab crashed",
	"page crashed",
}

// isPageCrash reports whether an error message describes a crashed renderer.
func isPageCrash(text string) bool {
	lower := strings.ToLower(text)

	for _, marker := range pageCrashMarkers {
		if strings.Contains(lower, marker) {
			return true
		}
	}

	return false
}

// IsSessionStartFailure reports whether an error came from creating a session,
// as opposed to a test failing afterwards. Session starts are retried.
func IsSessionStartFailure(err error) bool {
	if err == nil {
		return false
	}

	if errors.Is(err, context.Canceled) {
		return false
	}

	// Every NewSession error is tagged, which covers transport timeouts that
	// the message list below cannot name.
	if errors.Is(err, ErrSessionStart) {
		return true
	}

	message := err.Error()

	return strings.Contains(message, "All parallel tests are currently in use") ||
		strings.Contains(message, "Could not start Mobile Browser") ||
		strings.Contains(message, "Could not start Browser") ||
		strings.Contains(message, "There was an error. Please try again.") ||
		strings.Contains(message, "Failed to create session") ||
		strings.Contains(message, "unknown command") ||
		strings.Contains(message, "not implemented")
}
