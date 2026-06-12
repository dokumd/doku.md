// Package database manages the SQLite connection for application-level storage.
package database

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// RunMigrations reads all .sql files from the given directory (sorted by name),
// checks which have already been applied by querying the _migrations table,
// and executes any that are missing.
//
// The first migration (000_migrations.sql) creates the _migrations table.
// For that file, the query against _migrations will fail because the table
// does not exist yet — that is treated as "not yet applied", and the file
// is executed. All subsequent migrations find the table in place and work
// normally.
func RunMigrations(db *sql.DB, migrationsDir string) error {
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir %s: %w", migrationsDir, err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	for _, name := range files {
		applied, checkErr := isMigrationApplied(db, name)
		if applied {
			continue
		}

		// If the check failed because _migrations does not exist, or simply
		// because this migration is not in the table, execute the file.
		if checkErr != nil && !isNoSuchTable(checkErr) {
			return fmt.Errorf("check migration %s: %w", name, checkErr)
		}

		sqlBytes, err := os.ReadFile(filepath.Join(migrationsDir, name))
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}

		if _, err := db.Exec(string(sqlBytes)); err != nil {
			return fmt.Errorf("execute migration %s: %w", name, err)
		}

		// Register as applied (table now exists after 000_migrations.sql).
		if _, err := db.Exec("INSERT INTO _migrations (name) VALUES (?)", name); err != nil {
			return fmt.Errorf("record migration %s: %w", name, err)
		}
	}

	return nil
}

// isMigrationApplied checks whether a given migration name is recorded
// in the _migrations table. If the table does not exist, it returns an error.
func isMigrationApplied(db *sql.DB, name string) (bool, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM _migrations WHERE name = ?", name).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// isNoSuchTable returns true if the error is a SQLite "no such table" error.
func isNoSuchTable(err error) bool {
	return strings.Contains(err.Error(), "no such table")
}
