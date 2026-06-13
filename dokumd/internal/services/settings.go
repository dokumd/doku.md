// Package services exposes Go methods to the Svelte frontend via Wails3.
package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"dokumd/internal/config"
)

// Settings holds all application-level configuration values.
// Stored as a single JSON file at ~/.config/dokumd/settings.json.
type Settings struct {
	// ExcludeDirs lists directory names to skip when scanning for Markdown files.
	// Default: .git, .dokumd, node_modules, dist, .svelte-kit
	ExcludeDirs []string `json:"excludeDirs"`
}

// defaultSettings returns the Settings struct with sensible defaults.
func defaultSettings() Settings {
	return Settings{
		ExcludeDirs: []string{
            // Version control
            ".git", ".svn", ".hg",
            // doku.md
            ".dokumd",
            // Node/frontend
            "node_modules", "dist", ".svelte-kit", ".cache", ".parcel-cache", ".vite", ".turbo",
            // Next/Nuxt
            ".next", ".nuxt",
            // Go
            "bin", "vendor",
            // IDEs
            ".idea", ".vscode",
            // Python
            "__pycache__",
        },
	}
}

// settingsFilePath returns the absolute path to the global settings file.
func settingsFilePath() (string, error) {
	dataDir, err := config.DataDir()
	if err != nil {
		return "", fmt.Errorf("resolve data dir: %w", err)
	}
	return filepath.Join(dataDir, "settings.json"), nil
}

// LoadSettings reads the global settings file from ~/.config/dokumd/settings.json.
// If the file does not exist, it creates it with default values and returns those.
func LoadSettings() (Settings, error) {
	path, err := settingsFilePath()
	if err != nil {
		return Settings{}, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			def := defaultSettings()
			if err := SaveSettings(def); err != nil {
				return Settings{}, fmt.Errorf("create default settings: %w", err)
			}
			return def, nil
		}
		return Settings{}, fmt.Errorf("read settings: %w", err)
	}

	var s Settings
	if err := json.Unmarshal(data, &s); err != nil {
		return Settings{}, fmt.Errorf("parse settings: %w", err)
	}
	return s, nil
}

// SaveSettings writes the given settings to the global settings file.
func SaveSettings(s Settings) error {
	path, err := settingsFilePath()
	if err != nil {
		return err
	}

	dataDir := filepath.Dir(path)
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("create settings dir: %w", err)
	}

	data, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal settings: %w", err)
	}

	if err := os.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("write settings: %w", err)
	}
	return nil
}

// dokuignorePath returns the path to the .dokuignore file inside the project root.
func dokuignorePath(projectRoot string) string {
	return filepath.Join(projectRoot, ".dokumd", ".dokuignore")
}

// ResolveExcludes returns the list of directory names to ignore when scanning.
// Resolution order:
//  1. If .dokumd/.dokuignore exists inside the project root, read from it (one rule per line).
//  2. Otherwise, copy the global settings ExcludeDirs into .dokumd/.dokuignore and return those.
//
// The .dokumd directory is always added to the exclude list implicitly.
func ResolveExcludes(projectRoot string) ([]string, error) {
	localPath := dokuignorePath(projectRoot)

	// Try reading the local .dokuignore first.
	if data, err := os.ReadFile(localPath); err == nil {
		var dirs []string
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			dirs = append(dirs, line)
		}
		return appendAlways(dirs), nil
	}

	// No local file — load or create global settings.
	settings, err := LoadSettings()
	if err != nil {
		// If we cannot load settings, use default excludes.
		settings = defaultSettings()
	}

	// Write the local .dokuignore for future use.
	localDir := filepath.Dir(localPath)
	if err := os.MkdirAll(localDir, 0755); err == nil {
		var content string
		for _, d := range settings.ExcludeDirs {
			content += d + "\n"
		}
		os.WriteFile(localPath, []byte(content), 0644)
	}

	return appendAlways(settings.ExcludeDirs), nil
}

// appendAlways ensures .dokumd is always in the exclude list.
func appendAlways(dirs []string) []string {
	for _, d := range dirs {
		if d == ".dokumd" {
			return dirs
		}
	}
	return append(dirs, ".dokumd")
}
