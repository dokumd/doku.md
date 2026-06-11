// Package services exposes Go methods to the Svelte frontend via Wails3.
package services

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

// WindowService exposes native window operations (minimise, maximise, close) to the frontend.
// These replace the system titlebar since the app uses a custom titlebar.
type WindowService struct{}

// NewWindowService creates a new WindowService instance.
func NewWindowService() *WindowService {
	return &WindowService{}
}

// currentWindow returns the current active window, or nil.
func (s *WindowService) currentWindow() application.Window {
	return application.Get().Window.Current()
}

// Minimise minimises the application window.
func (s *WindowService) Minimise() {
	if w := s.currentWindow(); w != nil {
		w.Minimise()
	}
}

// Maximise toggles the window between maximised and normal state.
func (s *WindowService) Maximise() {
	w := s.currentWindow()
	if w == nil {
		return
	}
	if w.IsMaximised() {
		w.UnMaximise()
	} else {
		w.Maximise()
	}
}

// Close closes the application window and terminates the app.
func (s *WindowService) Close() {
	if w := s.currentWindow(); w != nil {
		w.Close()
	}
}
