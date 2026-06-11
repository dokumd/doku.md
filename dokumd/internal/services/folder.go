// Package services exposes Go methods to the Svelte frontend via Wails3.
// Each exported struct method becomes a callable JS function in the frontend.
package services

import (
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
