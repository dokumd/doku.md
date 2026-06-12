-- 003_triggers.sql
-- Keeps documents_fts synchronised with the documents table.
-- Uses the content-sync approach: AFTER INSERT → add row to FTS,
-- AFTER DELETE → remove from FTS, AFTER UPDATE → remove old + insert new.
CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents
BEGIN
    INSERT INTO documents_fts(rowid, title, content, path)
    VALUES (new.id, new.title, new.content, new.rel_path);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents
BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content, path)
    VALUES ('delete', old.id, old.title, old.content, old.rel_path);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents
BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content, path)
    VALUES ('delete', old.id, old.title, old.content, old.rel_path);
    INSERT INTO documents_fts(rowid, title, content, path)
    VALUES (new.id, new.title, new.content, new.rel_path);
END;
