// Package scanner walks a directory tree and finds all Markdown files (.md).
// It respects a list of directory names to exclude (e.g. .git, node_modules).
// The exclude list is configurable and typically resolved from app settings or a
// local .dokuignore file.
package scanner

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// maxScanDepth is the maximum directory depth the scanner will traverse.
// Paths deeper than this are skipped to avoid infinite recursion and
// excessive scan times on deeply nested project structures.
const maxScanDepth = 30

// FileEntry represents a single item found during a directory scan.
// The backend determines isDir from the OS; the frontend should not guess it.
type FileEntry struct {
	Path  string `json:"path"`
	IsDir bool   `json:"isDir"`
}

// ScanMarkdownFiles walks the given rootPath recursively and returns all
// Markdown files found as FileEntry structs. Directories whose base name is
// in the excludeDirs list are skipped entirely (including their contents).
//
// Edge cases handled:
//   - Symlinks are not followed (security, prevents infinite loops).
//   - Permission errors are silently skipped (continue scanning).
//   - Maximum directory depth is limited to maxScanDepth (30 levels).
//
// The returned paths are relative to rootPath. Binary files with a .md
// extension are detected by content type and skipped.
//
// Unlike a flat []string return, FileEntry preserves the isDir information
// obtained from the OS, so the frontend never has to guess whether something
// is a file or a directory.
func ScanMarkdownFiles(rootPath string, excludeDirs []string) ([]FileEntry, error) {
	excludeSet := make(map[string]bool, len(excludeDirs))
	for _, d := range excludeDirs {
		excludeSet[d] = true
	}

	var entries []FileEntry

	err := filepath.Walk(rootPath, func(path string, info os.FileInfo, err error) error {
		// Permission denied or similar — skip and continue scanning.
		if err != nil {
			return nil
		}

		if path == rootPath {
			return nil
		}

		// Compute depth: how many path segments below the root.
		rel, err := filepath.Rel(rootPath, path)
		if err != nil {
			return fmt.Errorf("compute relative path for %s: %w", path, err)
		}
		depth := len(strings.Split(rel, string(filepath.Separator)))

		// Enforce maximum scan depth to prevent excessive recursion.
		if depth > maxScanDepth {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// Do not follow symlinks — they can create infinite directory loops.
		if info.Mode()&os.ModeSymlink != 0 {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		if info.IsDir() {
			if excludeSet[info.Name()] {
				return filepath.SkipDir
			}
			return nil
		}

		if !strings.HasSuffix(strings.ToLower(info.Name()), ".md") {
			return nil
		}

		if isBinary(path) {
			return nil
		}

		entries = append(entries, FileEntry{Path: rel, IsDir: false})
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("walk %s: %w", rootPath, err)
	}

	return entries, nil
}

// isBinary does a quick check by reading the first 512 bytes of the file.
// If a null byte is found, the file is considered binary.
func isBinary(path string) bool {
	f, err := os.Open(path)
	if err != nil {
		return false
	}
	defer f.Close()

	buf := make([]byte, 512)
	n, _ := f.Read(buf)
	for i := 0; i < n; i++ {
		if buf[i] == 0 {
			return true
		}
	}
	return false
}
