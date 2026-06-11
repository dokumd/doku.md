// Package database manages the SQLite connection for application-level storage.
// This stores data that is NOT per-project: recent projects list, app settings, etc.
// Per-project document indexes are handled by the indexer service.
package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
	"changeme/internal/config"
)

// DB is the global application database handle.
// It is initialised once during startup and used by all services.
var DB *sql.DB

// Init opens (or creates) the application database at the data directory.
// Creates the app_settings table if it does not exist.
func Init() error {
	dataDir, err := config.DataDir()
	if err != nil {
		return fmt.Errorf("resolve data dir: %w", err)
	}

	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return fmt.Errorf("create data dir: %w", err)
	}

	dbPath := filepath.Join(dataDir, "dokumd.db")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return fmt.Errorf("ping database: %w", err)
	}

	// Enable WAL mode for better concurrent read performance.
	if _, err := db.Exec("PRAGMA journal_mode=WAL"); err != nil {
		return fmt.Errorf("enable WAL: %w", err)
	}

	DB = db
	return nil
}

// Close closes the global database handle.
func Close() error {
	if DB != nil {
		return DB.Close()
	}
	return nil
}
