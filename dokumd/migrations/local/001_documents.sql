-- 001_documents.sql
-- Creates the main documents table for indexed Markdown files.
-- Each row represents a single .md file discovered during a scan.
CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY,
    rel_path    TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL DEFAULT '',
    content     TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    word_count  INTEGER DEFAULT 0,
    headings    TEXT NOT NULL DEFAULT '[]',
    indexed_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
