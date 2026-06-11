// Package config provides application-level configuration helpers.
package config

import (
	"os"
	"path/filepath"
)

// IsDev returns true if the binary was built in development mode.
// The Wails3 build sets DEV=true during `wails3 dev`, which is embedded
// into the binary at compile time.
func IsDev() bool {
	return os.Getenv("DEV") == "true"
}

// DataDir returns the path to the application data directory.
// On Linux this is ~/.config/dokumd, on macOS ~/Library/Application Support/dokumd.
// This directory stores recent projects list, logs, and other per-user state.
func DataDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".config", "dokumd"), nil
}
