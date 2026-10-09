package browserstack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// Session is a W3C WebDriver session.
//
// Only four W3C endpoints are used: create session, navigate, execute script
// and delete session. In particular this client never calls
// GET /session/{id}/window, which older drivers do not implement, and never
// requests a BiDi websocket, so it works against the whole pinned browser
// matrix without per-browser capability workarounds.
type Session struct {
	client    *http.Client
	baseURL   string
	sessionID string
	userName  string
	accessKey string
	meta      map[string]any
}

// sessionResponse is the W3C New Session response.
//
// BrowserStack answers with the W3C shape {"value":{"sessionId":...}} for a
// session whose capabilities it honoured, and with the legacy JSON Wire
// Protocol shape {"status":0,"sessionId":...,"value":{...caps}} otherwise. Both
// are accepted here so the reason for a bad session is visible in the error
// rather than silently yielding a browser that is not the one requested.
type sessionResponse struct {
	Value struct {
		SessionID    string         `json:"sessionId"`
		Capabilities map[string]any `json:"capabilities"`
	} `json:"value"`
	Status    int            `json:"status"`
	SessionID string         `json:"sessionId"`
	LegacyCap map[string]any `json:"capabilities"`
}

// commandResponse is the W3C command response envelope.
type commandResponse struct {
	Value json.RawMessage `json:"value"`
}

// NewSession starts a W3C WebDriver session on BrowserStack.
//
// capabilities is sent verbatim: Capabilities.MarshalJSON already renders the
// complete {"capabilities":{"alwaysMatch":...,"firstMatch":[{}]}} body, so it
// must not be wrapped again. No desiredCapabilities fallback is attempted, so
// a driver that only speaks JSON Wire Protocol fails loudly here rather than
// part way through a test run.
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
	meta := parsed.Value.Capabilities

	// A legacy shaped reply means BrowserStack did not honour the requested
	// capabilities, so the session is almost certainly not routed through the
	// tunnel. Refuse it instead of running the suite against the wrong browser.
	if sessionID == "" && parsed.SessionID != "" {
		return nil, fmt.Errorf(
			"browserstack ignored the requested capabilities and returned a legacy JSON Wire Protocol session "+
				"(browserVersion=%v): the session will not be routed through the tunnel",
			parsed.LegacyCap["browserVersion"])
	}

	if sessionID == "" {
		return nil, fmt.Errorf("new session response contained no sessionId: %s", strings.TrimSpace(string(raw)))
	}

	return &Session{
		client:    httpClient,
		baseURL:   hubURL,
		sessionID: sessionID,
		userName:  creds.UserName,
		accessKey: creds.AccessKey,
		meta:      meta,
	}, nil
}

// ID is the WebDriver session identifier.
func (s *Session) ID() string {
	return s.sessionID
}

// Capabilities are the capabilities the server reported back, which for
// BrowserStack include the real browser version.
func (s *Session) Capabilities() map[string]any {
	return s.meta
}

// Navigate sends a W3C Navigate To command.
func (s *Session) Navigate(ctx context.Context, target string) error {
	body, err := json.Marshal(map[string]string{"url": target})
	if err != nil {
		return err
	}

	res, err := do(ctx, s.client, s.credentials(), http.MethodPost, s.commandURL("/url"), body)
	if err != nil {
		return err
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
	if args == nil {
		args = []any{}
	}

	body, err := json.Marshal(map[string]any{"script": script, "args": args})
	if err != nil {
		return nil, err
	}

	res, err := do(ctx, s.client, s.credentials(), http.MethodPost, s.commandURL("/execute/sync"), body)
	if err != nil {
		return nil, err
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

// ExecuteBool runs a script and coerces the result to a bool, matching the
// leniency of the JavaScript harness where a missing global is not an error.
func (s *Session) ExecuteBool(ctx context.Context, script string) (bool, error) {
	value, err := s.ExecuteScript(ctx, script, nil)
	if err != nil {
		return false, err
	}

	result, ok := value.(bool)

	return ok && result, nil
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
			return fmt.Errorf("webdriver error (%d): %s: %s", statusCode, code, message)
		}
	}

	return fmt.Errorf("webdriver error (%d): %s", statusCode, strings.TrimSpace(string(body)))
}

// IsSessionStartFailure reports whether an error came from creating a
// session, as opposed to a test failing afterwards. Session starts are
// retried; test failures are not.
func IsSessionStartFailure(err error) bool {
	if err == nil {
		return false
	}

	message := err.Error()

	return strings.Contains(message, "All parallel tests are currently in use") ||
		strings.Contains(message, "Could not start Mobile Browser") ||
		strings.Contains(message, "There was an error. Please try again.") ||
		strings.Contains(message, "Failed to create session") ||
		strings.Contains(message, "unknown command") ||
		strings.Contains(message, "not implemented")
}
