-- 000_migrations.sql
-- Creates the _migrations table that tracks which migrations have been applied.
-- This migration always runs on a fresh database; subsequent runs are skipped
-- because the table already exists and this file is recorded in it.
CREATE TABLE IF NOT EXISTS _migrations (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
