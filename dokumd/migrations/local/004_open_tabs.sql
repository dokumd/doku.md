-- 004_open_tabs.sql
-- Persists open tabs per project so they can be restored when reopening a folder.
CREATE TABLE IF NOT EXISTS open_tabs (
    rel_path  TEXT PRIMARY KEY,
    title     TEXT NOT NULL DEFAULT '',
    position  INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 0
);
