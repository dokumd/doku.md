# Research: Markdown Documentation Browser

## 1. Wails3 Binding Patterns

**Decision**: Use Wails3's built-in `bind` mechanism — export public Go methods from
a struct and register with `application.New(bindings.NewApp())`. Frontend calls them
via `window.go.main.App.Method()`.

**Rationale**: Wails3 provides automatic binding generation. Struct-based bindings with
JSON serialization are idiomatic. Use events (`runtime.EventsEmit`) for push updates
(file watcher events, indexing progress).

**Alternatives considered**: Manual HTTP server inside the app (overhead for IPC);
WebSocket connection (unnecessary complexity for desktop IPC).

---

## 2. SQLite FTS5 Schema Design

**Decision**: Single table `documents` with FTS5 virtual table for search.

```sql
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    rel_path TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    headings TEXT NOT NULL DEFAULT '[]',  -- JSON array of {level, text, id}
    indexed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title, content, path UNINDEXED, content=documents, content_rowid=id
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
    INSERT INTO documents_fts(rowid, title, content, path)
    VALUES (new.id, new.title, new.content, new.rel_path);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content, path)
    VALUES ('delete', old.id, old.title, old.content, old.rel_path);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
    INSERT INTO documents_fts(documents_fts, rowid, title, content, path)
    VALUES ('delete', old.id, old.title, old.content, old.rel_path);
    INSERT INTO documents_fts(rowid, title, content, path)
    VALUES (new.id, new.title, new.content, new.rel_path);
END;
```

**Rationale**: Content-sync FTS keeps the index consistent without manual sync.
External content FTS saves storage (no duplicate content). JSON headings field
avoids a separate table for simple metadata.

**Alternatives considered**: Bleve (Go full-text search library) — adds a dependency
and does not leverage SQLite's built-in FTS5. Separate metadata table for headings —
unnecessary normalization for read-heavy workload.

---

## 3. Markdown Parsing in Go

**Decision**: Use [Goldmark](https://github.com/yuin/goldmark) with extensions.

**Rationale**: Goldmark is the most popular pure-Go Markdown parser, CommonMark
compliant, extensible, and actively maintained. Extensions needed: tables, task
lists, heading IDs (for TOC anchors), typographer, definition lists, footnotes,
strikethrough.

**Alternatives considered**: Blackfriday (less maintained), mmark (focused on
IETF RFCs).

---

## 4. Cross-platform File Watching

**Decision**: Use [fsnotify](https://github.com/fsnotify/fsnotify) with a
debouncing layer (250ms window) to batch rapid file changes.

**Rationale**: fsnotify is the de facto Go file watcher, works on all 3 target
platforms. Debouncing handles bulk operations (git checkout, npm install) that
trigger many events at once. On Linux uses inotify, macOS FSEvents, Windows
ReadDirectoryChanges.

**Implementation**: A `Watcher` struct that receives fsnotify events, debounces
them, and emits batched change notifications. Events are filtered to `.md` files.

**Alternatives considered**: `github.com/rjeczalik/notify` — less maintained.
Custom polling — too expensive for 10k files.

---

## 5. Wails3 Project Structure Conventions

**Decision**: Standard Wails3 v3 project layout.

**Rationale**: Wails3 projects follow a convention:
- Root: `main.go` entry point, `app.go` for app config
- `frontend/`: Svelte app built with Vite
- Go bindings in root package or `internal/`
- `wails.json` for project config
- Built with `wails build`

The frontend communicates with Go via bound methods and events — no custom IPC needed.

**Build considerations**: Use `wails3 task linux:package EXTRA_TAGS=gtk3` for
Linux AppImage builds. macOS and Windows builds require GitHub Actions with
native runners (`macos-latest`, `windows-latest`). macOS also requires
Apple Developer signing for distribution.

---

## 6. GTK3 Workaround (Ubuntu 22.04)

**Decision**: Use `EXTRA_TAGS=gtk3` no build/config.yml para forçar GTK3.

**Rationale**: Wails3 alpha.93+ usa GTK4 com `GtkFileDialog` que requer
GTK 4.10+. Ubuntu 22.04 tem GTK 4.6.9. O GTK3 está disponível e é
totalmente funcional. A flag `EXTRA_TAGS=gtk3` diz ao CGO para ligar
contra GTK3 em vez de GTK4.

**Configuração**:
```yaml
# build/config.yml
dev_mode:
  executes:
    - cmd: wails3 build DEV=true EXTRA_TAGS=gtk3
      type: blocking
```

Build de produção: `wails3 build -tags gtk3`.

**Alternativas consideradas**:
- Atualizar GTK4 via PPA (risco de conflitos com pacotes de sistema)
- Usar Wails3 alpha.79 (compatível, mas perde-se features recentes)
- Docker para desenvolvimento (hot-reload Go lento, complexidade extra)
