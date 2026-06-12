-- 001_recent_folders.sql
-- Persists recently opened folders so the app can restore the last session
-- and display a list of recent folders in the sidebar accordion.
CREATE TABLE IF NOT EXISTS recent_folders (
    path       TEXT PRIMARY KEY,
    last_opened TEXT NOT NULL DEFAULT (datetime('now'))
);
