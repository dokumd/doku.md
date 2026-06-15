// Package database manages the SQLite connection for application-level storage.
package database

import (
	"database/sql"
	"fmt"
	"io/fs"
	"sort"
	"strings"
)

// RunMigrations reads all .sql files from migrationsFS at the given prefix
// (sorted by name), checks which have already been applied by querying the
// _migrations table, and executes any that are missing.
//
// The first migration (000_migrations.sql) creates the _migrations table.
// For that file, the query against _migrations will fail because the table
// does not exist yet — that is treated as "not yet applied", and the file
// is executed. All subsequent migrations find the table in place and work
// normally.
//
// Using fs.FS allows the same code to work both in development (os.DirFS)
// and in production (embed.FS from the compiled binary).
func RunMigrations(db *sql.DB, migrationsFS fs.FS, prefix string) error {
	entries, err := fs.ReadDir(migrationsFS, prefix)
	if err != nil {
		return fmt.Errorf("read migrations dir %s: %w", prefix, err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)
	_ = prefix // prefix is used for fs.ReadDir above; individual files are read with full path

	for _, name := range files {
		applied, checkErr := isMigrationApplied(db, name)
		if applied {
			continue
		}

		if checkErr != nil && !isNoSuchTable(checkErr) {
			return fmt.Errorf("check migration %s: %w", name, checkErr)
		}

		path := prefix + "/" + name
		sqlBytes, err := fs.ReadFile(migrationsFS, path)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", path, err)
		}

		if _, err := db.Exec(string(sqlBytes)); err != nil {
			return fmt.Errorf("execute migration %s: %w", name, err)
		}

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
