// Package indexer manages a per-project SQLite FTS5 index of Markdown files.
// Each opened folder has its own index at .dokumd/index.sqlite.
// Indexing is asynchronous: files are submitted via a channel and processed
// sequentially by a background goroutine, which avoids race conditions with
// the file watcher (added later).
package indexer

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	_ "github.com/mattn/go-sqlite3"
	"changeme/internal/database"
)

// IndexAction represents the type of operation to perform on the index.
type IndexAction int

const (
	IndexActionIndex  IndexAction = iota // Index or re-index a file
	IndexActionRemove                     // Remove a file from the index
)

// IndexRequest is a single unit of work submitted to the indexer queue.
type IndexRequest struct {
	RelPath string
	Action  IndexAction
}

// Status describes the current state of the indexer.
type Status struct {
	Total int    `json:"total"` // Total files submitted
	Done  int    `json:"done"`  // Files processed so far
	State string `json:"state"` // "idle" | "indexing" | "ready" | "error"
}

// ProgressFunc is a callback invoked after each file is indexed so the caller
// can emit progress events to the frontend.
type ProgressFunc func(done, total int, state string)

// Indexer manages a per-project SQLite FTS5 index.
type Indexer struct {
	db          *sql.DB
	projectRoot string
	queue       chan IndexRequest
	status      Status
	mu          sync.RWMutex
	onProgress  ProgressFunc
	stopCh      chan struct{}
	wg          sync.WaitGroup
}

// New opens (or creates) the index database for the given project root.
// It runs local migrations, then returns a ready-to-use Indexer.
// The caller must call Start() to begin processing the queue.
func New(projectRoot string, onProgress ProgressFunc) (*Indexer, error) {
	dokumdDir := filepath.Join(projectRoot, ".dokumd")
	if err := os.MkdirAll(dokumdDir, 0755); err != nil {
		return nil, fmt.Errorf("create .dokumd dir: %w", err)
	}

	dbPath := filepath.Join(dokumdDir, "index.sqlite")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open index db: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping index db: %w", err)
	}

	// Run local migrations.
	if err := database.RunMigrations(db, "migrations/local"); err != nil {
		db.Close()
		return nil, fmt.Errorf("run migrations: %w", err)
	}

	idx := &Indexer{
		db:          db,
		projectRoot: projectRoot,
		queue:       make(chan IndexRequest, 1024),
		status:      Status{State: "idle"},
		onProgress:  onProgress,
		stopCh:      make(chan struct{}),
	}

	return idx, nil
}

// Start launches the background goroutine that processes the index queue.
// Call this after submitting the initial batch of files.
func (idx *Indexer) Start() {
	idx.wg.Add(1)
	go idx.processQueue()
}

// Enqueue adds a single file to the index queue (thread-safe).
func (idx *Indexer) Enqueue(relPath string, action IndexAction) {
	idx.queue <- IndexRequest{RelPath: relPath, Action: action}
}

// EnqueueBatch adds multiple files to the index queue (thread-safe).
func (idx *Indexer) EnqueueBatch(relPaths []string) {
	for _, p := range relPaths {
		idx.queue <- IndexRequest{RelPath: p, Action: IndexActionIndex}
	}
}

// GetStatus returns the current indexer status (thread-safe).
func (idx *Indexer) GetStatus() Status {
	idx.mu.RLock()
	defer idx.mu.RUnlock()
	return idx.status
}

// Close shuts down the indexer, waits for pending work, and closes the database.
func (idx *Indexer) Close() error {
	close(idx.stopCh)
	idx.wg.Wait()
	return idx.db.Close()
}

// processQueue is the background goroutine that consumes index requests.
func (idx *Indexer) processQueue() {
	defer idx.wg.Done()

	for {
		select {
		case <-idx.stopCh:
			return
		case req := <-idx.queue:
			switch req.Action {
			case IndexActionIndex:
				idx.indexFile(req.RelPath)
			case IndexActionRemove:
				idx.removeFile(req.RelPath)
			}
		}
	}
}

// indexFile reads the file from disk and upserts it into the database.
func (idx *Indexer) indexFile(relPath string) {
	absPath := filepath.Join(idx.projectRoot, relPath)
	content, err := os.ReadFile(absPath)
	if err != nil {
		idx.trackProgress(false)
		return
	}

	title := extractTitle(string(content))
	contentStr := string(content)

	_, err = idx.db.Exec(`
		INSERT INTO documents (rel_path, title, content, content_hash, word_count)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(rel_path) DO UPDATE SET
			title = excluded.title,
			content = excluded.content,
			content_hash = excluded.content_hash,
			word_count = excluded.word_count,
			indexed_at = datetime('now')
	`, relPath, title, contentStr, contentHash(contentStr), wordCount(contentStr))

	idx.trackProgress(err == nil)
}

// removeFile deletes a document from the index by its relative path.
func (idx *Indexer) removeFile(relPath string) {
	_, err := idx.db.Exec("DELETE FROM documents WHERE rel_path = ?", relPath)
	idx.trackProgress(err == nil)
}

// trackProgress updates the internal counters and fires the progress callback.
func (idx *Indexer) trackProgress(success bool) {
	idx.mu.Lock()
	idx.status.Done++
	if idx.status.State == "idle" || idx.status.State == "" {
		idx.status.State = "indexing"
	}
	done := idx.status.Done
	total := idx.status.Total
	idx.mu.Unlock()

	idx.onProgress(done, total, "indexing")

	// When all files are processed, mark as ready.
	if done >= total {
		idx.mu.Lock()
		idx.status.State = "ready"
		idx.mu.Unlock()
		idx.onProgress(done, total, "ready")
	}
}

// SetTotal sets the total number of files to be indexed (called before Start).
func (idx *Indexer) SetTotal(total int) {
	idx.mu.Lock()
	defer idx.mu.Unlock()
	idx.status.Total = total
}

// extractTitle returns the first H1 heading content, or the filename if none.
func extractTitle(content string) string {
	// Simple extraction: find first line starting with "# "
	for _, line := range splitLines(content) {
		if len(line) > 2 && line[0] == '#' && line[1] == ' ' {
			return line[2:]
		}
	}
	return ""
}

// contentHash returns a simple hash of the content for change detection.
func contentHash(content string) string {
	// For now, a simple length-based hash. Can be improved later.
	return fmt.Sprintf("%x", len(content))
}

// wordCount counts whitespace-separated words in the content.
func wordCount(content string) int {
	count := 0
	inWord := false
	for _, c := range content {
		if c == ' ' || c == '\n' || c == '\t' {
			inWord = false
		} else if !inWord {
			count++
			inWord = true
		}
	}
	return count
}

// splitLines splits a string into lines.
func splitLines(s string) []string {
	var lines []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' {
			lines = append(lines, s[start:i])
			start = i + 1
		}
	}
	if start < len(s) {
		lines = append(lines, s[start:])
	}
	return lines
}
