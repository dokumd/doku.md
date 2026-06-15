# doku.md

A desktop Markdown documentation browser for developers.

Built with [Wails3](https://v3.wails.io/) (Go), [Svelte 5](https://svelte.dev/), and [TypeScript](https://www.typescriptlang.org/).

## Features

- **Browse** — open any local folder and navigate its `.md` files via a file tree
- **Read** — rendered Markdown with syntax highlighting, table of contents, and scroll navigation
- **Search** — full-text search across all indexed documents using FTS5 with trigram tokenizer
- **Index** — automatic SQLite indexing with FTS5, runs in background on folder open
- **Watch** — file system watcher keeps the index in sync; document reloads automatically if modified
- **Tabs** — open multiple documents, switch between them, restore on next session
- **Bookmarks** — star your favourite files, persist across sessions
- **Recent folders** — quickly reopen previously visited folders
- **Local search** — CTRL+F within a document with TreeWalker-based highlighting
- **Platform-aware** — keyboard shortcuts adapt to macOS (⌘) and Linux/Windows (Ctrl)

## Quick start

```bash
# Install dependencies (Ubuntu 24.04+)
sudo apt install build-essential pkg-config libgtk-4-dev libwebkitgtk-6.0-dev

# Ubuntu 22.04 — use GTK3 instead
sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev

# Install Go 1.22+, Node 20+, then:
go install github.com/wailsapp/wails/v3/cmd/wails3@latest

# Run in development mode
cd dokumd && wails3 dev
```

## Build

### AppImage (recommended)

```bash
cd dokumd && wails3 task linux:package EXTRA_TAGS=gtk3
```

Output: `build/linux/appimage/dokumd-x86_64.AppImage`

## Configuration

Excluded directories are defined in `~/.config/dokumd/settings.json`.
On first open of a folder, a local `.dokumd/.dokuignore` is created.
Edit this file to include or exclude specific directories from indexing.

## Project structure

```
dokumd/
├── main.go                  # Entry point, Wails3 app setup
├── internal/
│   ├── config/              # DataDir, IsDev
│   ├── database/            # SQLite connection, migration runner
│   └── services/            # Go bindings (folder, window, settings)
├── pkg/
│   ├── indexer/             # SQLite FTS5 indexer, file watcher
│   ├── markdown/            # Goldmark renderer, TOC extraction
│   ├── scanner/             # .md file scanner with exclusions
│   └── search/              # FTS5 search queries
├── frontend/
│   └── src/
│       ├── App.svelte       # Main app shell
│       └── lib/             # Svelte components
│           ├── sidebar/     # Accordion, FileTree, Bookmarks, RecentFolders
│           ├── topbar/      # Titlebar with window controls
│           ├── center/      # TabBar, DocumentView, TableOfContents, StatusBar
│           ├── overlays/    # SearchOverlay, ShortcutsOverlay
│           └── feedback/    # Toast, ToastContainer
├── migrations/
│   ├── global/              # App-level database migrations
│   └── local/               # Per-project index migrations
└── docs/
    └── desktop-build.md     # Build and packaging instructions
```

## License

MIT
