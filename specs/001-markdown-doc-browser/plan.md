# Implementation Plan: Markdown Documentation Browser

**Branch**: `` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-markdown-doc-browser/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Desktop application (Wails3 + Svelte + TypeScript) that lets developers browse,
search, and understand Markdown documentation from local project folders. Uses
SQLite with FTS5 for indexing and full-text search, file watcher for live
reindexing, and a three-column UI (navigation | document | context).

## Technical Context

**Language/Version**: Go 1.22+ (Wails3 backend), TypeScript 5.x (Svelte 5 frontend)

**Primary Dependencies**: Wails 3, Svelte 5, SQLite via go-sqlite3 or modernc.org/sqlite,
FTS5 for full-text search, fsnotify for file watching, Goldmark or similar for
Markdown rendering, highlight.js or Shiki for syntax highlighting

**Storage**: SQLite with FTS5 — one database per project at `.dokumd/index.sqlite`

**Testing**: `go test` for Go backend, Vitest for TypeScript/Svelte frontend

**Target Platform**: Linux, macOS, Windows (desktop via Wails3 native window)

**Project Type**: desktop-app

**Performance Goals**: 1000-folder project open in <5s, search results in <1s,
file changes reflected in <3s

**Constraints**: <200MB RAM when indexing 1000 files; fully offline-capable;
single-user desktop app

**Scale/Scope**: 10 to 10,000 Markdown files per project; single project open at a time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Mandatory Code Comments in English)**: All Go, TypeScript, and
  Svelte code MUST include English comments per language doc standard (GoDoc,
  JSDoc/TSDoc). No violations expected — this is a new project.
- **Governance**: Plan includes Constitution Check section. Complexity Tracking
  table will be filled if any violations arise.

**Status**: PASS — no constitutional violations anticipated.

## Project Structure

### Documentation (this feature)

```text
specs/001-markdown-doc-browser/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── indexer.md       # Indexer contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
main.go                  # Wails3 app entry point
app.go                   # Application lifecycle (startup, project open, menu)
pkg/
├── indexer/
│   ├── indexer.go       # SQLite indexer with FTS5
│   ├── watcher.go       # File system watcher (fsnotify)
│   └── indexer_test.go
├── markdown/
│   ├── renderer.go      # Markdown to HTML rendering
│   ├── toc.go           # Table of contents from headings
│   └── renderer_test.go
├── project/
│   ├── project.go       # Project model, recent list, config
│   └── project_test.go
└── search/
    ├── search.go        # FTS5 query builder
    └── search_test.go

frontend/
├── src/
│   ├── App.svelte              # Shell: layout 3 colunas + estado global
│   ├── lib/
│   │   ├── sidebar/
│   │   │   ├── Accordion.svelte     # Acordeão reutilizável
│   │   │   ├── FileTree.svelte      # Árvore de ficheiros
│   │   │   └── Bookmarks.svelte     # Lista de bookmarks
│   │   ├── topbar/
│   │   │   └── Titlebar.svelte      # Barra de topo (brand, acções, botões janela)
│   │   ├── center/
│   │   │   ├── TabBar.svelte        # Barra de tabs com overflow dropdown
│   │   │   ├── DocumentView.svelte  # Rendering Markdown
│   │   │   └── TableOfContents.svelte # Painel direito com TOC
│   │   ├── overlays/
│   │   │   ├── SearchOverlay.svelte    # Overlay de pesquisa global
│   │   │   └── ShortcutsOverlay.svelte # Overlay de atalhos de teclado
│   │   ├── feedback/
│   │   │   ├── Toast.svelte           # Toast individual
│   │   │   └── ToastContainer.svelte  # Pilha de toasts
│   │   └── types.ts               # TypeScript interfaces
│   ├── stores/
│   │   ├── project.ts      # Current project state
│   │   ├── navigation.ts   # Tree, tabs, bookmarks
│   │   └── search.ts       # Search state
│   └── main.ts             # Wails3 frontend entry
├── tests/
│   └── components/         # Vitest component tests
└── package.json

internal/
└── bindings/              # Wails3 Go-to-frontend bindings
    ├── project.go         # Open project, recent list
    ├── indexer.go         # Index status, reindex
    ├── search.go          # Search query
    └── watcher.go         # File change events
```

**Structure Decision**: Wails3 standard structure — Go backend in `main.go` + `pkg/`,
Svelte/TypeScript frontend in `frontend/`, Wails3 bindings in `internal/bindings/`.
The `pkg/` packages are independent and testable without the GUI.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to track.

---

## Phase 0: Research & Resolve Unknowns

**No NEEDS CLARIFICATION markers exist.** Technologies are specified by the user.
Research tasks focus on confirming best practices for the chosen stack.

### Research tasks

1. **Research Wails3 binding patterns**: How to structure Go bindings for Svelte;
   best practices for passing file system events to the frontend.
2. **Research SQLite FTS5 schema design**: Best schema for multi-file Markdown search
   (title, path, body columns); incremental vs batch indexing strategies.
3. **Research Markdown parsing in Go**: Goldmark vs alternatives; extension support
   (tables, code blocks, heading IDs for TOC).
4. **Research cross-platform file watching**: fsnotify behavior on Linux, macOS, Windows;
   debouncing strategies for bulk operations.
5. **Research Wails3 project structure conventions**: Standard layout, build tooling,
   packaging for distribution.

**Output**: research.md with consolidated findings for each task.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for full entity definitions.

**Core entities**:
- **Project** — path, name, last-opened timestamp, index status
- **Document** — path (rel to project), title, content, headings[], word-count, content-hash
- **Bookmark** — document-rel-path, created-at
- **IndexQueue** — pending file paths for indexing (triggers from watcher)

### Contracts

See [contracts/](./contracts/) for the indexer contract defining the
`Indexer` interface and the `Watcher` interface.

### Quickstart

See [quickstart.md](./quickstart.md) for validation scenarios.

### Agent context update

AGENTS.md updated with reference to this plan file.
