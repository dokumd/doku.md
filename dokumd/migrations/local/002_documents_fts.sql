-- 002_documents_fts.sql
-- Creates the FTS5 virtual table for full-text search.
-- Uses external content referencing the documents table so that the actual
-- content lives only in documents, not duplicated in the index.
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title,
    content,
    path UNINDEXED,
    content=documents,
    content_rowid=id
);
