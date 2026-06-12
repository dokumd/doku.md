-- 005_bookmarks.sql
-- Persists bookmarked documents per project so they survive restarts.
-- Each bookmark is validated against the filesystem when retrieved.
CREATE TABLE IF NOT EXISTS bookmarks (
    rel_path   TEXT PRIMARY KEY,
    title      TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
