// Package services exposes Go methods to the Svelte frontend via Wails3.
// Each exported struct method becomes a callable JS function in the frontend.
package services

import (
	"log"

	"changeme/pkg/indexer"
	"changeme/pkg/scanner"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// FolderService handles opening local folders via the native OS directory picker.
type FolderService struct{}

// NewFolderService creates a new FolderService instance.
func NewFolderService() *FolderService {
	return &FolderService{}
}

// OpenFolder opens the native OS directory picker and returns the selected path.
// The frontend calls this when the user clicks "Browse" or presses Ctrl+O/⌘O.
// Returns the absolute path to the selected folder, or an empty string if cancelled.
func (s *FolderService) OpenFolder() (string, error) {
	path, err := application.Get().Dialog.OpenFile().
		SetTitle("Select Folder").
		CanChooseDirectories(true).
		PromptForSingleSelection()
	if err != nil {
		return "", err
	}
	return path, nil
}

// GetFileTree scans the given rootPath for Markdown files and returns the
// resulting FileEntry slice. Each entry contains the relative path and an
// isDir flag determined by the OS, so the frontend never has to guess.
//
// Excluded directories are resolved via ResolveExcludes, which checks for a
// local .dokuignore file or falls back to global settings.
func (s *FolderService) GetFileTree(rootPath string) ([]scanner.FileEntry, error) {
	excludes, err := ResolveExcludes(rootPath)
	if err != nil {
		excludes = defaultSettings().ExcludeDirs
	}
	return scanner.ScanMarkdownFiles(rootPath, excludes)
}

// IndexProject opens the index database for the given project root, scans all
// Markdown files, and begins indexing them asynchronously. Progress events are
// emitted to the frontend via Wails3 runtime events.
//
// The frontend should call GetFileTree first to display the tree immediately,
// then call IndexProject to start background indexing.
func (s *FolderService) IndexProject(rootPath string) error {
	idx, err := indexer.New(rootPath, func(done, total int, state string) {
		application.Get().Event.Emit("index:progress", map[string]any{
			"done":  done,
			"total": total,
			"state": state,
		})
	})
	if err != nil {
		return err
	}

	excludes, err := ResolveExcludes(rootPath)
	if err != nil {
		excludes = defaultSettings().ExcludeDirs
	}

	entries, err := scanner.ScanMarkdownFiles(rootPath, excludes)
	if err != nil {
		idx.Close()
		return err
	}

	relPaths := make([]string, len(entries))
	for i, e := range entries {
		relPaths[i] = e.Path
	}

	idx.SetTotal(len(relPaths))
	idx.EnqueueBatch(relPaths)
	idx.Start()

	log.Printf("indexer started for %s: %d files", rootPath, len(relPaths))
	return nil
}
