# Data Model: Markdown Documentation Browser

## Project

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Absolute path to the project folder |
| `name` | string | Folder name (derived from path) |
| `lastOpened` | timestamp | ISO 8601 timestamp of last open |
| `indexStatus` | enum | `idle`, `indexing`, `ready`, `error` |

**Storage**: Recent projects list in a JSON file at platform config dir
(`~/.config/dokumd/projects.json`).

---

## Document

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `relPath` | string | Path relative to project root |
| `title` | string | First H1 heading content, or filename if no H1 |
| `content` | text | Raw Markdown content |
| `contentHash` | string | SHA256 of content (for change detection) |
| `wordCount` | integer | Approximate word count |
| `headings` | json | Array of `{level: number, text: string, id: string}` |
| `indexedAt` | timestamp | When this document was last indexed |

**Storage**: SQLite `documents` table, one database per project at `.dokumd/index.sqlite`.

---

## Bookmark

| Field | Type | Description |
|-------|------|-------------|
| `projectPath` | string | Project this bookmark belongs to |
| `relPath` | string | Document path relative to project root |
| `createdAt` | timestamp | When bookmarked |

**Storage**: Per-project SQLite `bookmarks` table.

---

## FTS Index (Virtual)

| Column | Type | Description |
|--------|------|-------------|
| `title` | text | FTS-indexed document title |
| `content` | text | FTS-indexed document body |
| `path` | text | UNINDEXED — stored for filtering/sorting |

**Storage**: SQLite FTS5 virtual table `documents_fts`, kept in sync via triggers.

---

## Index Queue (In-Memory)

Not persisted. A buffered channel of `string` (relative paths) consumed by the
indexer goroutine. File watcher pushes paths; debouncer coalesces within 250ms.

---

## Entity Relationships

```
Project (1) ──── has many ──── Document (many)
Project (1) ──── has many ──── Bookmark (many)
Document (1) ──── has one ──── FTS Entry (virtual, 1:1 via rowid)
FileWatcher (1) ──── produces ──── IndexQueue (many)
```

---

## State Transitions

### Project lifecycle
```
closed ──→ opened ──→ indexing ──→ ready
              ↑                       │
              └── re-index ───────────┘
```

### Document lifecycle
```
discovered ──→ indexed ──→ re-indexed (on change) ──→ removed (on delete)
```

### Search lifecycle
```
idle ──→ querying ──→ results ──→ idle
```
