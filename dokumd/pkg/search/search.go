// Package search provides FTS5 full-text search across indexed Markdown documents.
// It queries the documents_fts virtual table created by the indexer.
package search

import (
	"database/sql"
	"fmt"
	"strings"
)

// Result represents a single search hit.
type Result struct {
	RelPath string  `json:"relPath"`
	Title   string  `json:"title"`
	Snippet string  `json:"snippet"`
	Score   float64 `json:"score"`
}

// Search runs a full-text query against all indexed documents.
// Results are ordered by relevance (rank).
func Search(db *sql.DB, query string, limit int) ([]Result, error) {
	safe := sanitise(query)
	if safe == "" {
		return nil, nil
	}
	if limit <= 0 {
		limit = 50
	}
	rows, err := db.Query(`
		SELECT d.rel_path, d.title, substr(d.content, 1, 200), rank
		FROM documents_fts
		JOIN documents d ON d.id = documents_fts.rowid
		WHERE documents_fts MATCH ?
		ORDER BY rank
		LIMIT ?
	`, safe, limit)
	if err != nil {
		return nil, fmt.Errorf("fts5 search: %w", err)
	}
	defer rows.Close()

	return scanResults(rows)
}

// SearchByTitle restricts the FTS5 query to the title column only.
func SearchByTitle(db *sql.DB, query string, limit int) ([]Result, error) {
	safe := sanitise(query)
	if safe == "" {
		return nil, nil
	}
	if limit <= 0 {
		limit = 50
	}
	rows, err := db.Query(`
		SELECT d.rel_path, d.title, substr(d.content, 1, 200), rank
		FROM documents_fts
		JOIN documents d ON d.id = documents_fts.rowid
		WHERE documents_fts MATCH 'title:' || ?
		ORDER BY rank
		LIMIT ?
	`, safe, limit)
	if err != nil {
		return nil, fmt.Errorf("fts5 title search: %w", err)
	}
	defer rows.Close()

	return scanResults(rows)
}

// SearchByPath searches for documents whose relative path contains the given substring.
// This uses a LIKE query on the documents table directly (not FTS5).
func SearchByPath(db *sql.DB, query string, limit int) ([]Result, error) {
	like := "%" + query + "%"
	rows, err := db.Query(`
		SELECT rel_path, title, '' AS snippet, 0.0 AS rank
		FROM documents
		WHERE rel_path LIKE ?
		ORDER BY rel_path
		LIMIT ?
	`, like, limit)
	if err != nil {
		return nil, fmt.Errorf("path search: %w", err)
	}
	defer rows.Close()

	return scanResults(rows)
}

// scanResults scans all rows into a Result slice.
func scanResults(rows *sql.Rows) ([]Result, error) {
	var results []Result
	for rows.Next() {
		var r Result
		if err := rows.Scan(&r.RelPath, &r.Title, &r.Snippet, &r.Score); err != nil {
			return nil, err
		}
		r.Snippet = cleanSnippet(r.Snippet)
		results = append(results, r)
	}
	return results, rows.Err()
}

// cleanSnippet removes FTS5 highlight markers from the snippet.
func cleanSnippet(s string) string {
	s = strings.ReplaceAll(s, "<mark>", "")
	s = strings.ReplaceAll(s, "</mark>", "")
	return s
}

// sanitise prepares a user-supplied query string for safe use with FTS5.
// With the trigram tokenizer, most characters are safe. Only strip quotes
// and parens to prevent FTS5 syntax errors.
func sanitise(query string) string {
	query = strings.TrimSpace(query)
	if query == "" {
		return ""
	}
	var b strings.Builder
	for _, r := range query {
		if strings.ContainsRune(`"():`, r) {
			b.WriteRune(' ')
		} else {
			b.WriteRune(r)
		}
	}
	return b.String()
}
