//go:build windows

package browserstack

import "os/exec"

// configureProcessGroup is a no-op on Windows, which has no process groups.
func configureProcessGroup(_ *exec.Cmd) {}

// killProcessGroup kills the tunnel process.
func killProcessGroup(cmd *exec.Cmd) {
	if cmd.Process != nil {
		_ = cmd.Process.Kill()
	}
}
