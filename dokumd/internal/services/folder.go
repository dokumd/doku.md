// Package services exposes Go methods to the Svelte frontend via Wails3.
// Each exported struct method becomes a callable JS function in the frontend.
package services

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"changeme/pkg/indexer"
	"changeme/pkg/markdown"
	"changeme/pkg/scanner"
	"changeme/pkg/search"

	_ "github.com/mattn/go-sqlite3"
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

