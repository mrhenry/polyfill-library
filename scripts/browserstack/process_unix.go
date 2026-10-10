//go:build !windows

package browserstack

import (
	"os/exec"
	"syscall"
)

// configureProcessGroup puts the tunnel in its own process group so the whole
// tree can be terminated at once. BrowserStackLocal forks helper processes,
// and killing only the parent orphans them.
func configureProcessGroup(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
}

// killProcessGroup terminates the tunnel and anything it forked.
func killProcessGroup(cmd *exec.Cmd) {
	if cmd.Process == nil {
		return
	}

	// A negative pid signals the whole process group.
	_ = syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
}
