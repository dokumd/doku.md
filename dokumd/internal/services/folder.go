// Package services exposes Go methods to the Svelte frontend via Wails3.
// Each exported struct method becomes a callable JS function in the frontend.
package services

import (
	"database/sql"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"

	"dokumd/internal/database"
	"dokumd/pkg/indexer"
	"dokumd/pkg/markdown"
	"dokumd/pkg/scanner"
	"dokumd/pkg/search"

	_ "github.com/mattn/go-sqlite3"
	"github.com/wailsapp/wails/v3/pkg/application"
)

// FolderService handles opening local folders via the native OS directory picker.
// It also manages the file system watcher for the currently open folder.
type FolderService struct {
	mu           sync.Mutex
	watcher      *indexer.Watcher
	migrationsFS fs.FS
}

// NewFolderService creates a new FolderService instance. The migrationsFS
// must contain the "migrations" folder with local SQL migrations.
func NewFolderService(migrationsFS fs.FS) *FolderService {
	return &FolderService{migrationsFS: migrationsFS}
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
	s.mu.Lock()
	// Stop any previous watcher before starting a new one.
	if s.watcher != nil {
		s.watcher.Stop()
		s.watcher = nil
	}
	s.mu.Unlock()

	idx, err := indexer.New(rootPath, func(done, total int, state string) {
		application.Get().Event.Emit("index:progress", map[string]any{
			"done":  done,
			"total": total,
			"state": state,
		})
	}, s.migrationsFS)
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

	// Start file system watcher.
	watcher, err := indexer.NewWatcher(rootPath, idx, func(ev indexer.FileEvent) {
		log.Printf("file event: %s %s", ev.Action, ev.RelPath)
		application.Get().Event.Emit("file:changed", map[string]any{
			"path":   ev.RelPath,
			"action": ev.Action,
		})
	}, excludes)
	if err != nil {
		log.Printf("failed to start watcher: %v", err)
	} else {
		watcher.Start()
		s.mu.Lock()
		s.watcher = watcher
		s.mu.Unlock()
	}

	log.Printf("indexer started for %s: %d files", rootPath, len(relPaths))
	return nil
}

// CloseProject stops the file watcher and cleans up.
func (s *FolderService) CloseProject() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.watcher != nil {
		s.watcher.Stop()
		s.watcher = nil
	}
}

// DocumentResult is the response returned by GetDocument.
type DocumentResult struct {
	HTML     string            `json:"html"`
	Title    string            `json:"title"`
	Headings []markdown.Heading `json:"headings"`
	RelPath  string            `json:"relPath"`
}

// GetDocument reads a Markdown file from disk, renders it to HTML using
// Goldmark, and returns the result along with extracted headings and title.
// The frontend calls this when the user clicks a file in the FileTree.
func (s *FolderService) GetDocument(rootPath, relPath string) (DocumentResult, error) {
	absPath := filepath.Join(rootPath, relPath)
	content, err := os.ReadFile(absPath)
	if err != nil {
		return DocumentResult{}, err
	}

	html, headings, err := markdown.Render(string(content))
	if err != nil {
		return DocumentResult{}, err
	}

	var title string
	if len(headings) > 0 && headings[0].Level == 1 {
		title = headings[0].Text
	}

	return DocumentResult{
		HTML:     html,
		Title:    title,
		Headings: headings,
		RelPath:  relPath,
	}, nil
}

// TabInfo represents a single open tab for persistence.
type TabInfo struct {
	RelPath  string `json:"relPath"`
	Title    string `json:"title"`
	Position int    `json:"position"`
	IsActive bool   `json:"isActive"`
}

// openTabsDB opens the index database for the given root path and returns the handle.
func openTabsDB(rootPath string) (*sql.DB, error) {
	dbPath := filepath.Join(rootPath, ".dokumd", "index.sqlite")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	return db, nil
}

// SaveOpenTabs persists the list of open tabs for a project.
// It replaces all existing entries with the provided list.
func (s *FolderService) SaveOpenTabs(rootPath string, tabs []TabInfo) error {
	db, err := openTabsDB(rootPath)
	if err != nil {
		return err
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	if _, err := tx.Exec("DELETE FROM open_tabs"); err != nil {
		tx.Rollback()
		return err
	}

	stmt, err := tx.Prepare("INSERT INTO open_tabs (rel_path, title, position, is_active) VALUES (?, ?, ?, ?)")
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for _, t := range tabs {
		isActive := 0
		if t.IsActive {
			isActive = 1
		}
		if _, err := stmt.Exec(t.RelPath, t.Title, t.Position, isActive); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit()
}

// GetOpenTabs retrieves the persisted open tabs for a project, ordered by position.
func (s *FolderService) GetOpenTabs(rootPath string) ([]TabInfo, error) {
	db, err := openTabsDB(rootPath)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	rows, err := db.Query("SELECT rel_path, title, position, is_active FROM open_tabs ORDER BY position")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tabs []TabInfo
	for rows.Next() {
		var t TabInfo
		var isActive int
		if err := rows.Scan(&t.RelPath, &t.Title, &t.Position, &isActive); err != nil {
			return nil, err
		}
		t.IsActive = isActive == 1
		tabs = append(tabs, t)
	}

	return tabs, rows.Err()
}

// openIndexDB opens the per-project index database for the given root path.
func openIndexDB(rootPath string) (*sql.DB, error) {
	dbPath := filepath.Join(rootPath, ".dokumd", "index.sqlite")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	// Prevent SQL_BUSY errors when the indexer is writing concurrently.
	db.Exec("PRAGMA busy_timeout=5000")
	return db, nil
}

// SearchAll runs a full-text search across all indexed documents in the project.
func (s *FolderService) SearchAll(rootPath string, query string, limit int) ([]search.Result, error) {
	db, err := openIndexDB(rootPath)
	if err != nil {
		log.Printf("SearchAll: open index db: %v", err)
		return nil, err
	}
	defer db.Close()
	results, err := search.Search(db, query, limit)
	if err != nil {
		log.Printf("SearchAll: query=%q root=%s err=%v", query, rootPath, err)
		return nil, err
	}
	return results, nil
}

// SearchByTitle restricts the search to document titles only.
func (s *FolderService) SearchByTitle(rootPath string, query string, limit int) ([]search.Result, error) {
	db, err := openIndexDB(rootPath)
	if err != nil {
		return nil, err
	}
	defer db.Close()
	return search.SearchByTitle(db, query, limit)
}

// SearchByPath searches for documents whose relative path contains the query.
func (s *FolderService) SearchByPath(rootPath string, query string, limit int) ([]search.Result, error) {
	db, err := openIndexDB(rootPath)
	if err != nil {
		return nil, err
	}
	defer db.Close()
	return search.SearchByPath(db, query, limit)
}

// RecentFolder represents a single entry in the recent folders list.
type RecentFolder struct {
	Path       string `json:"path"`
	LastOpened string `json:"lastOpened"`
}

// AddRecentFolder inserts or updates a folder in the recent list.
// Called every time the user opens a folder successfully.
func (s *FolderService) AddRecentFolder(path string) error {
	_, err := database.DB.Exec(
		`INSERT INTO recent_folders (path, last_opened) VALUES (?, ?)
		 ON CONFLICT(path) DO UPDATE SET last_opened = ?`,
		path, time.Now().UTC().Format(time.RFC3339), time.Now().UTC().Format(time.RFC3339))
	return err
}

// GetRecentFolders returns up to 50 recent folders, validating each against
// the filesystem. Entries whose path no longer exists are removed from the
// database automatically so the list never shows stale entries.
func (s *FolderService) GetRecentFolders() ([]RecentFolder, error) {
	rows, err := database.DB.Query(
		`SELECT path, last_opened FROM recent_folders ORDER BY last_opened DESC LIMIT 50`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var valid []RecentFolder
	var toRemove []string

	for rows.Next() {
		var r RecentFolder
		if err := rows.Scan(&r.Path, &r.LastOpened); err != nil {
			return nil, err
		}
		if _, err := os.Stat(r.Path); err == nil {
			valid = append(valid, r)
		} else {
			toRemove = append(toRemove, r.Path)
		}
	}

	// Remove stale entries outside the scan loop to keep the query short.
	for _, p := range toRemove {
		database.DB.Exec("DELETE FROM recent_folders WHERE path = ?", p)
	}

	return valid, rows.Err()
}

// GetLastFolder returns the most recently opened folder, but only if it still
// exists on disk. If the path was deleted or the recent list is empty, returns
// an empty string. This is the folder that will be auto-opened on startup.
func (s *FolderService) GetLastFolder() (string, error) {
	var path string
	err := database.DB.QueryRow(
		`SELECT path FROM recent_folders ORDER BY last_opened DESC LIMIT 1`).Scan(&path)
	if err == sql.ErrNoRows {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return "", nil
	}
	return path, nil
}

// RemoveRecentFolder deletes a single entry from the recent folders list.
func (s *FolderService) RemoveRecentFolder(path string) error {
	_, err := database.DB.Exec("DELETE FROM recent_folders WHERE path = ?", path)
	return err
}

// Bookmark represents a single bookmarked document.
type Bookmark struct {
	RelPath   string `json:"relPath"`
	Title     string `json:"title"`
	CreatedAt string `json:"createdAt"`
}

// AddBookmark adds a document to the bookmarks table for the given project.
func (s *FolderService) AddBookmark(rootPath string, relPath string, title string) error {
	db, err := openIndexDB(rootPath)
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec(
		`INSERT OR IGNORE INTO bookmarks (rel_path, title, created_at) VALUES (?, ?, datetime('now'))`,
		relPath, title)
	return err
}

// RemoveBookmark removes a document from the bookmarks table.
func (s *FolderService) RemoveBookmark(rootPath string, relPath string) error {
	db, err := openIndexDB(rootPath)
	if err != nil {
		return err
	}
	defer db.Close()
	_, err = db.Exec("DELETE FROM bookmarks WHERE rel_path = ?", relPath)
	return err
}

// GetBookmarks returns all bookmarks for the given project, validating each
// against the filesystem. Stale entries (deleted or renamed files) are
// automatically removed from the database.
func (s *FolderService) GetBookmarks(rootPath string) ([]Bookmark, error) {
	db, err := openIndexDB(rootPath)
	if err != nil {
		return nil, err
	}
	defer db.Close()

	rows, err := db.Query("SELECT rel_path, title, created_at FROM bookmarks ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var valid []Bookmark
	var toRemove []string

	for rows.Next() {
		var b Bookmark
		if err := rows.Scan(&b.RelPath, &b.Title, &b.CreatedAt); err != nil {
			return nil, err
		}
		fullPath := filepath.Join(rootPath, b.RelPath)
		if _, err := os.Stat(fullPath); err == nil {
			valid = append(valid, b)
		} else {
			toRemove = append(toRemove, b.RelPath)
		}
	}

	for _, p := range toRemove {
		db.Exec("DELETE FROM bookmarks WHERE rel_path = ?", p)
	}

	return valid, rows.Err()
}

