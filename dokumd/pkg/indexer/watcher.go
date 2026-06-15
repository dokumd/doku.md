// Package indexer manages per-project SQLite FTS5 indexes and file system watching.
package indexer

import (
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"
)

// FileEvent describes a single file system change relevant to the index.
type FileEvent struct {
	RelPath string `json:"relPath"`
	Action  string `json:"action"` // "created" | "modified" | "deleted"
}

// FileEventCallback is invoked whenever a file system change is detected.
type FileEventCallback func(FileEvent)

// Watcher monitors a project directory for changes to .md files.
// It debounces rapid events (e.g. editor autosave) and filters out
// non-Markdown files and excluded directories.
type Watcher struct {
	rootPath     string
	fsWatcher    *fsnotify.Watcher
	indexer      *Indexer
	onEvent      FileEventCallback
	excludeDirs  []string
	debounce     time.Duration
	pending      map[string]fsnotify.Op
	mu           sync.Mutex
	stopCh       chan struct{}
	wg           sync.WaitGroup
}

// NewWatcher creates a file system watcher for the given project root.
// It watches all subdirectories for .md file changes and sends index
// requests to the provided Indexer. The onEvent callback is called for
// each detected change so the frontend can update the UI.
func NewWatcher(rootPath string, idx *Indexer, onEvent FileEventCallback, excludeDirs []string) (*Watcher, error) {
	fsWatcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	w := &Watcher{
		rootPath:    rootPath,
		fsWatcher:   fsWatcher,
		indexer:     idx,
		onEvent:     onEvent,
		excludeDirs: excludeDirs,
		debounce:    250 * time.Millisecond,
		pending:     make(map[string]fsnotify.Op),
		stopCh:      make(chan struct{}),
	}

	return w, nil
}

// Start begins watching the project directory and all subdirectories.
// It spawns two goroutines: one for walking directories and adding
// watches, and another for consuming fsnotify events with debounce.
func (w *Watcher) Start() {
	// Walk all subdirectories and add them to the watcher.
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		filepath.Walk(w.rootPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil
			}
			if info.IsDir() {
				// Skip excluded directories.
				for _, ex := range w.excludeDirs {
					if info.Name() == ex {
						return filepath.SkipDir
					}
				}
				w.fsWatcher.Add(path)
			}
			return nil
		})
	}()

	// Process events with debounce.
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		w.processLoop()
	}()

	// Periodic flush of debounced events (safety net).
	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		ticker := time.NewTicker(w.debounce * 2)
		defer ticker.Stop()
		for {
			select {
			case <-w.stopCh:
				return
			case <-ticker.C:
				w.flushPending()
			}
		}
	}()
}

// Stop shuts down the watcher and closes all goroutines.
func (w *Watcher) Stop() {
	close(w.stopCh)
	w.fsWatcher.Close()
	w.wg.Wait()
}

// processLoop reads fsnotify events, debounces them, and flushes periodically.
func (w *Watcher) processLoop() {
	for {
		select {
		case <-w.stopCh:
			return
		case event := <-w.fsWatcher.Events:
			w.handleEvent(event)
		case err := <-w.fsWatcher.Errors:
			if err != nil {
				log.Printf("watcher error: %v", err)
			}
		}
	}
}

// handleEvent stores the event in the pending map for debouncing.
func (w *Watcher) handleEvent(event fsnotify.Event) {
	rel, err := filepath.Rel(w.rootPath, event.Name)
	if err != nil {
		return
	}

	// Normalise path separators.
	rel = strings.ReplaceAll(rel, "\\", "/")

	// Ignore non-.md files.
	if !strings.HasSuffix(strings.ToLower(rel), ".md") {
		return
	}

	w.mu.Lock()
	// Merge operations: if we had a CREATE and now a WRITE, keep CREATE.
	existing, ok := w.pending[rel]
	if ok && existing == fsnotify.Create && event.Op&fsnotify.Write != 0 {
		// Already registered as created, keep create.
	} else {
		w.pending[rel] = event.Op
	}
	w.mu.Unlock()

	// Schedule flush after debounce period.
	time.AfterFunc(w.debounce, w.flushPending)
}

// flushPending processes all accumulated events and resets the map.
func (w *Watcher) flushPending() {
	w.mu.Lock()
	if len(w.pending) == 0 {
		w.mu.Unlock()
		return
	}
	pending := w.pending
	w.pending = make(map[string]fsnotify.Op)
	w.mu.Unlock()

	for relPath, op := range pending {
		action := "modified"
		switch {
		case op&fsnotify.Create != 0:
			action = "created"
		case op&fsnotify.Remove != 0:
			action = "deleted"
		case op&fsnotify.Rename != 0:
			action = "deleted"
		}

		// Update the index.
		if action == "deleted" {
			w.indexer.Enqueue(relPath, IndexActionRemove)
		} else {
			w.indexer.Enqueue(relPath, IndexActionIndex)
		}

		// Notify frontend.
		if w.onEvent != nil {
			w.onEvent(FileEvent{RelPath: relPath, Action: action})
		}
	}
}
