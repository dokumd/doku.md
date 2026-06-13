# Tasks: Markdown Documentation Browser

**Input**: Design documents from `specs/001-markdown-doc-browser/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — tests are optional. The focus is on manual
validation after each incremental step.

**Organization**: Phases ordered by the requested priority: bootstrap → open folder
+ SQLite index → file tree → rendering → search → watcher → tabs/bookmarks/recent →
polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1=Open+Browse, US2=Search,
  US3=File Watcher, US4=Tabs+Bookmarks+Recent)
- Include exact file paths in descriptions

## Path Conventions

- **Wails3 app**: `main.go`, `app.go`, `pkg/`, `internal/bindings/`, `frontend/`
- See plan.md for full project tree

---

## Phase 0: Bootstrap

**Purpose**: Scaffold the project, verify the full Wails3 + Vite + Svelte dev
loop works before writing any application code.

**Working style**: One step at a time. Each task modifies exactly one file (or
creates one new file). Stop between tasks.

- [ ] T000 Create project structure: folders `pkg/indexer/`, `pkg/markdown/`,
      `pkg/search/`, `pkg/project/`, `internal/bindings/`, `frontend/src/lib/`,
      `frontend/src/stores/`, `docs/`
      - Reason: Organise the project layout before scaffolding
      - Expected: All directories exist at the project root
      - Manual validation: `ls -d */` shows the expected folder structure
      - File: (mkdir commands, no code change)

- [ ] T001 Initialize Wails3 project with Svelte+TypeScript template
      - Run: `wails3 init -n dokumd -t svelte-ts` in project root
      - Expected: `main.go`, `app.go`, `frontend/` with Svelte scaffold, `wails.json`
      - Manual validation: Run `wails3 dev` and confirm app window opens with default Svelte page
      - One-time bootstrap

- [ ] T002 First successful boot — workaround GTK4 em Ubuntu 22.04
      - Reason: Wails3 alpha.93+ usa GTK4 `GtkFileDialog` que requer GTK 4.10+.
        Ubuntu 22.04 tem GTK 4.6.9. É necessário forçar GTK3.
      - Expected:
        1. Editar `build/config.yml` na secção `dev_mode > executes`:
           ```yaml
           - cmd: wails3 build DEV=true EXTRA_TAGS=gtk3
             type: blocking
           ```
        2. Correr `wails3 dev`. A janela abre com o default Wails/Svelte page.
           Sem erros de compilação.
      - Manual validation: Window appears, no red errors in console

- [ ] T003 Validate that Vite, Svelte and Wails3 bindings work together
      - Reason: Wails3 + Vite + Svelte hot-reload and binding bridges are known to
        have compatibility issues. Validate early before writing real code.
        O hot-reload Go é lento em Ubuntu 22.04 devido ao CGO com GTK3.
      - Expected: Hot-reload works (edit `App.svelte` → UI updates without full rebuild).
        A basic Go binding (e.g., `Greet(name)`) is callable from frontend devtools console.
      - Manual validation: (1) Change text in `App.svelte` → see it update in <2s.
        (2) `window.go.main.App.Greet("test")` in browser console → returns a string.

**Checkpoint**: `wails dev` works, hot reload works, Go bindings work from frontend.

---

## Phase 1: Open Folder + SQLite Indexing

**Purpose**: Implement the "Open Project" flow — folder dialog, selected path
returned to frontend — and immediately index all Markdown files into SQLite FTS5.
The index is the foundation everything else builds on.

- [ ] T004 Add Wails3 Go binding for native folder dialog in `app.go`
      - Reason: Users need to select a project folder via the OS file dialog
      - Expected: `app.go` exposes `OpenProject() (string, error)` using
        `runtime.OpenDirectoryDialog()`. Returns selected path or empty string.
      - Manual validation: Call binding from browser devtools console, verify dialog opens
      - File: `app.go`

- [ ] T005 [US1] Add "Open Folder" button to the left column in `frontend/src/App.svelte`
      - Reason: Users need a UI trigger for the open dialog
      - Expected: Left column header has an "Open Folder" button; clicking it invokes
        the Wails binding and shows the selected path
      - Manual validation: Click "Open Folder" → dialog opens → select folder → path appears in column
      - File: `frontend/src/App.svelte`

- [ ] T005b [US1] Create Titlebar component in `frontend/src/lib/topbar/Titlebar.svelte`
      - Reason: Top bar needs brand, search trigger, Browse button, "?" help
        button, and platform-adapted window buttons
      - Expected: Titlebar includes brand name "doku.md", search area (linked to
        SearchOverlay), Browse button, "?" shortcuts button, and window control
        buttons positioned per platform (left on macOS, right on Linux/Windows)
      - Manual validation: Titlebar renders correctly in both layouts
      - File: `frontend/src/lib/topbar/Titlebar.svelte`

- [ ] T006 Create `ProjectInfo` Go struct and return it from `OpenProject` in `internal/bindings/project.go`
      - Reason: The frontend needs structured project metadata (path, name)
      - Expected: `OpenProject()` returns `{path, name, lastOpened}` instead of raw string.
        Creates `internal/bindings/` package with `project.go`.
      - Manual validation: Console log the returned object after opening a folder
      - File: `internal/bindings/project.go`

- [ ] T007 [P] [US1] Create TypeScript type definitions in `frontend/src/lib/types.ts`
      - Reason: Frontend needs typed interfaces for ProjectInfo and all Wails events
      - Expected: Types file with `ProjectInfo`, `Document`, `SearchResult`, `Bookmark`,
        `FileEvent`, `IndexProgress`, `FileDiscoveredEvent` interfaces matching the
        Go bindings and Wails event payloads
      - Manual validation: Import types in `App.svelte` and verify TypeScript compiles
      - File: `frontend/src/lib/types.ts`

- [ ] T008 Create SQLite indexer with progressive loading in `pkg/indexer/indexer.go`
      - Reason: Manage the `.dokumd/index.sqlite` database with documents table
        and FTS5 virtual table. Must support scanning in two phases (root first,
        subfolders in background) and emit progress events.
      - Expected: `Indexer` struct with:
        - `Open()`, `Close()`, `IndexFile()`, `RemoveFile()`, `GetStatus()`
        - `ScanAndIndex(rootPath string, progressCb func(batch []string, total int))`
          — scans root dir first (one level), indexes those files, then spawns a
          goroutine to walk subdirectories. Calls `progressCb` with each batch of
          discovered files.
        - `IndexDocuments()` blocks until all discovered files are indexed.
        - Internal `state` field (`indexing` | `ready`) prevents watcher from
          starting before initial indexing completes.
        - Creates schema on first open with content-sync FTS5 via triggers.
        - Schema matches data-model.md.
      - Manual validation: Open a project → verify `index.sqlite` created with tables
      - File: `pkg/indexer/indexer.go`

- [ ] T009 Integrate indexer with progressive loading into project open flow in `internal/bindings/project.go`
      - Reason: Indexing should start automatically when a project is opened.
        Use `runtime.EventsEmit` to notify the frontend of incremental discovery
        and progress, so the UI can update without polling.
      - Expected:
        - `OpenProject()` calls `indexer.Open()`, then `indexer.ScanAndIndex()`
        - Scan-and-index emits Wails3 events:
          - `"files:discovered"` payload `{files: string[], total: int}` — each
            batch of discovered files (root first, then subfolders)
          - `"index:progress"` payload `{done: int, total: int}` — as each file
            finishes indexing
        - `OpenProject()` does not block — returns immediately with the
          `ProjectInfo` and an `indexStatus: "indexing"`.
        - When `scanAndIndex` finishes, emits a final `"index:progress"` with
          `done === total` and the scanner transitions state to `"ready"`.
        - The watcher (added in Phase 5) checks `indexer.GetStatus()` before
          starting, preventing race conditions.
      - Manual validation: Open a project with 50+ `.md` files → console logs show
        `files:discovered` and `index:progress` events in sequence
      - File: `internal/bindings/project.go`

- [ ] T010 [US1] Show indexing progress/status in the UI in `frontend/src/App.svelte`
      - Reason: Users need feedback that indexing is happening. Listen for
        `files:discovered` and `index:progress` events from Go.
      - Expected: Left column footer or status bar shows "Scanning..." during
        file discovery, then "Indexing... 45/100 files" during index phase,
        then "Ready: 100 files" when done. Listens to Wails `EventsOn`.
      - Manual validation: Open a project with 50+ files → status shows scanning →
        indexing progress updates in real time → "Ready" when done
      - File: `frontend/src/App.svelte`

**Checkpoint**: Can open a folder, index starts automatically, status visible in UI.

---

## Phase 2: Markdown File Tree

**Purpose**: Scan the indexed folder for `.md` files, build a file tree, display
it in the left column, and handle file selection.

- [ ] T011 Create Go file scanner for Markdown files in `pkg/indexer/scanner.go`
      - Reason: Need to recursively find all `.md` files under a project root,
        skipping hidden dirs (`.git`, `.dokumd`, `node_modules`)
      - Expected: `ScanMarkdownFiles(rootPath string) ([]string, error)` returns
        relative paths of all `.md` files. Skips binary files with `.md` extension.
      - Manual validation: Call from test — verify paths returned for a known folder
      - File: `pkg/indexer/scanner.go`

- [ ] T012 [P] [US1] Create Go binding `GetFileTree` in `internal/bindings/project.go`
      - Reason: Frontend needs the tree structure, not just a flat list of files
      - Expected: `GetFileTree(rootPath string) ([]TreeNode, error)` returns a
        nested structure with folders and files. Folders have `children`.
        `TreeNode{Name, Path, IsDir, Children}`.
      - Manual validation: Call binding after opening a project — verify tree JSON
      - File: `internal/bindings/project.go`

- [ ] T012b [US1] Create Accordion Svelte component in `frontend/src/lib/sidebar/Accordion.svelte`
      - Reason: Sidebar needs a reusable accordion with two sections
        (Project and Bookmarks), one open at a time, independent scroll per section
      - Expected: Generic accordion component accepting sections with title and
        content slot. Supports open/close, only one section open at a time.
        Independent internal scroll per section. Accepts `defaultOpen` index.
      - Manual validation: Accordion renders two sections → click to switch →
        scroll works independently
      - File: `frontend/src/lib/sidebar/Accordion.svelte`

- [ ] T013 [US1] Create FileTree Svelte component in `frontend/src/lib/sidebar/FileTree.svelte`
      - Reason: Render the file tree inside the "Project" accordion section of
        the sidebar
      - Expected: Component receives tree data, renders expandable/collapsible
        folders, clickable file names. Only `.md` files shown. Each file row
        includes space for a bookmark star (added later in Phase 6). The
        component is placed inside the "Project" accordion section which has
        independent internal scroll.
      - Manual validation: Open a project — "Project" section shows tree →
        collapse/expand folders → click a file
      - File: `frontend/src/lib/sidebar/FileTree.svelte`

- [ ] T014 [US1] Integrate FileTree into the left column and handle file selection in `frontend/src/App.svelte`
      - Reason: When a user clicks a file, the center column should react
      - Expected: FileTree replaces "Navigation" placeholder. Clicking a file emits
        an event with the file path. Center column shows "Loading..." for now.
      - Manual validation: Click a file → center column text changes to the file path
      - File: `frontend/src/App.svelte`

**Checkpoint**: Open a project → tree shows `.md` files → click one → center reacts.

---

## Phase 3: Markdown Rendering

**Purpose**: Read the selected Markdown file in Go, render it to HTML, display
in the center column with syntax highlighting and auto-generated table of contents.

- [ ] T015 Create Markdown renderer in `pkg/markdown/renderer.go`
      - Reason: Convert raw Markdown to HTML for display. Use Goldmark with
        extensions for tables, headings, code blocks, lists.
      - Expected: `Render(content string) (html string, headings []Heading, err error)`
        Returns rendered HTML and parsed headings for TOC navigation.
      - Manual validation: Call with sample Markdown — verify HTML output
      - File: `pkg/markdown/renderer.go`

- [ ] T016 [P] [US1] Create TOC extractor in `pkg/markdown/toc.go`
      - Reason: Generate heading-based table of contents for the right panel
      - Expected: `ExtractHeadings(content string) []Heading` returns headings
        with level, text, and anchor ID. Handles duplicate IDs by appending `-1`, `-2`.
      - Manual validation: Test with nested headings — verify hierarchy and IDs
      - File: `pkg/markdown/toc.go`

- [ ] T017 [US1] Create Go binding `GetDocument` in `internal/bindings/project.go`
      - Reason: Frontend calls this when a user clicks a file — it reads and renders
      - Expected: `GetDocument(projectPath, relPath string) (DocumentView, error)` where
        `DocumentView` contains `{html, headings, title, relPath, wordCount}`.
        Reads file, renders with Goldmark, extracts headings.
      - Manual validation: Call binding with a known `.md` file — verify HTML+headings
      - File: `internal/bindings/project.go`

- [ ] T018 [US1] Create DocumentView Svelte component in `frontend/src/lib/center/DocumentView.svelte`
      - Reason: Display rendered HTML in the center column
      - Expected: Component receives HTML string and renders it safely (sanitized).
        Includes a loading state and error state. Document header shows metadata
        (title, file path, word count) and a bookmark star icon that reflects
        the bookmark state from the store. Clicking heading anchors scrolls.
        Clicking the star toggles bookmark for the current document.
      - Manual validation: Click a file → center shows formatted Markdown →
        star in header matches sidebar bookmark state → click star toggles
      - File: `frontend/src/lib/center/DocumentView.svelte`

- [ ] T019 [P] [US1] Integrate DocumentView into the center column of `frontend/src/App.svelte`
      - Reason: Wire file selection → rendering pipeline
      - Expected: Clicking a file in FileTree → calls `GetDocument` binding → displays
        rendered HTML in DocumentView. Center column no longer shows placeholder.
      - Manual validation: Full flow — open project → click file → rendered Markdown appears
      - File: `frontend/src/App.svelte`

- [ ] T020 [US1] Create TableOfContents Svelte component in `frontend/src/lib/center/TableOfContents.svelte`
      - Reason: Show the table of contents in the right column
      - Expected: Component receives headings array and renders a nested list.
        Clicking a heading scrolls the center document to that section.
      - Manual validation: Open a doc with headings → right column shows TOC → click → scrolls
      - File: `frontend/src/lib/center/TableOfContents.svelte`

- [ ] T021 [US1] Add syntax highlighting for code blocks in `frontend/src/lib/center/DocumentView.svelte`
      - Reason: Code blocks should be color-highlighted for readability
      - Expected: After rendering HTML, apply client-side syntax highlighting
        (highlight.js or Shiki) to `<pre><code>` blocks. Support Go, TS, bash, etc.
      - Manual validation: Open a doc with code blocks → blocks are color-highlighted
      - File: `frontend/src/lib/center/DocumentView.svelte`

**Checkpoint**: Full browse flow works — open → tree → click → rendered Markdown + TOC.

---

## Phase 4: FTS5 Search (User Story 2)

**Purpose**: Implement full-text search across all indexed documents using SQLite
FTS5. Support global search, title search, and path search.

- [ ] T022 Create search queries in `pkg/search/search.go`
      - Reason: Wrap FTS5 queries with Go functions for global, title, and path search
      - Expected: `Search(indexer, query, limit)`, `SearchByTitle()`, `SearchByPath()`.
        Returns `[]SearchResult` with snippet, score, headings. Uses FTS5 syntax:
        `MATCH ?` with sanitized input. Snippet via `snippet()` function.
      - Manual validation: Test with known content — verify correct results and snippets
      - File: `pkg/search/search.go`

- [ ] T023 [P] [US2] Create Go search bindings in `internal/bindings/search.go`
      - Reason: Expose search to the frontend via Wails3
      - Expected: `SearchAll(query, limit)`, `SearchByTitle(query, limit)`,
        `SearchByPath(query, limit)` bindings. All return `[]SearchResult`.
      - Manual validation: Call from devtools console after indexing — verify results
      - File: `internal/bindings/search.go`

- [ ] T024 [US2] Create SearchOverlay Svelte component in `frontend/src/lib/overlays/SearchOverlay.svelte`
      - Reason: Global search input in the UI. Placed in the topbar, not the sidebar.
      - Expected: Rendered as an inline element in the topbar, not in the sidebar.
        Format: search icon + label "Search" + platform-adapted kbd shortcut
        (`CTRL+K` on Linux/Windows, `⌘K` on macOS). Detects platform via
        `runtime.Environment()`. Clicking the bar or pressing the shortcut
        focuses the search and opens the search overlay. Emits search query on
        Enter or after 300ms debounce.
      - Manual validation: Topbar shows "Search ⌘K" (macOS) or "Search Ctrl+K"
        (Linux/Windows). Clicking it focuses search. Typing shows results.
      - File: `frontend/src/lib/overlays/SearchOverlay.svelte`

- [ ] T025 [US2] Create SearchResults Svelte component in `frontend/src/lib/overlays/SearchOverlay.svelte` (inline or sub-component)
      - Reason: Display search results with snippets and relevance
      - Expected: Shows a list of results, each with: title, file path, text snippet
        with match highlighted, score. Clicking a result navigates to that document
        (opens in center panel). Empty state when no query. "No results" when query
        yields nothing.
      - Manual validation: Search for a known term → results appear → click → doc opens
      - File: `frontend/src/lib/overlays/SearchOverlay.svelte`

- [ ] T026 [US2] Add store to manage search state in `frontend/src/stores/search.ts`
      - Reason: Centralize search query, results, loading state
      - Expected: Svelte writable store with `query`, `results`, `isSearching`, `active`.
        Components subscribe to reactively update. Debounce logic lives here.
      - Manual validation: Type in search → store updates → results component re-renders
      - File: `frontend/src/stores/search.ts`

- [ ] T027 [US2] Integrate search UI into App.svelte in `frontend/src/App.svelte`
      - Reason: Wire search bar and results into the topbar layout
      - Expected: SearchOverlay placed in the topbar, before the Browse button.
        When searching, results panel opens as an overlay (not replacing sidebar
        content). Clicking a result navigates to the doc and closes the overlay.
        Pressing Escape closes the overlay.
      - Manual validation: Full flow — click Search in topbar (or Ctrl+K/⌘K) →
        overlay opens → type query → results appear → click → doc renders in center
      - File: `frontend/src/App.svelte`

**Checkpoint**: Full search works — type query → see results → click → open doc.

---

## Phase 5: File Watcher (User Story 3)

**Purpose**: Watch the file system for `.md` file changes and keep the SQLite
index in sync without user intervention.

- [ ] T028 Create file watcher in `pkg/indexer/watcher.go`
      - Reason: Monitor file system for `.md` create/modify/delete/rename events
      - Expected: `Watcher` struct using fsnotify with 250ms debounce. Filters
        non-`.md` files and hidden directories. Emits `FileEvent{Type, Path}`.
        Watcher sends `IndexActionRemove` to the indexer queue when a file is
        deleted, and `IndexActionIndex` when a file is created or modified.
      - Manual validation: Create/modify/delete a `.md` file → watcher logs the event
      - File: `pkg/indexer/watcher.go`

- [ ] T029 [US3] Wire watcher events to indexer actions and frontend in `internal/bindings/watcher.go`
      - Reason: When watcher emits an event, trigger the appropriate indexer method
        and notify the frontend so it can rerender if needed.
      - Expected: `StartWatching(projectPath)` starts the watcher. On create/modify:
        call `indexer.IndexFile()`. On delete: `indexer.RemoveFile()`. On rename:
        remove old, index new. Also emits a Wails3 event `file:changed` with
        payload `{ path: string, action: "modified" | "created" | "deleted" }`
        so the frontend can react to changes in the currently open document.
        Errors are logged but don't crash.
      - Manual validation: Create a new `.md` file while app is running → it appears
        in search results within 3 seconds
      - File: `internal/bindings/watcher.go`

- [ ] T030 [US3] Expose watcher status and events to frontend in `internal/bindings/watcher.go`
      - Reason: Frontend needs to react to file changes (update tree, show notifications)
      - Expected: `OnFileChange(callback)` subscribes frontend to file events via
        Wails3 `Events.On`. `GetWatchedPaths()` returns monitored paths.
      - Manual validation: Create/delete file → frontend receives event (console.log)
      - File: `internal/bindings/watcher.go`

- [ ] T031 [US3] React to file changes in the frontend in `frontend/src/stores/project.ts`
      - Reason: File tree and open tabs should update when files change externally.
        If the changed file matches the active tab, rerender automatically.
      - Expected:
        - Listen for `file:changed` event (action: `modified`, `created`, `deleted`)
        - If action is `modified` and `path === activeTabPath`:
          call `GetDocument()` again to rerender the `DocumentView` with new content
        - If action is `deleted` and `path === activeTabPath`:
          show "File deleted" indicator on the tab (do not close the tab)
        - If action is `created`: refresh FileTree (add new entry)
        - If action is `deleted`: remove entry from FileTree
      - Manual validation: Edit a file open in a tab → document rerenders automatically.
        Delete a file open in a tab → shows "File deleted" indicator.
      - File: `frontend/src/stores/project.ts`

**Checkpoint**: File changes are detected and index stays in sync automatically.

---

## Phase 6: Tabs, Bookmarks, Recent Projects (User Story 4)

**Purpose**: Support opening multiple documents in tabs, bookmarking favourites,
and persisting recent projects list.

- [ ] T032 [US4] Create tabs store in `frontend/src/stores/navigation.ts`
      - Reason: Centralize open tab state — which docs are open, which is active
      - Expected: Writable store with `tabs: Tab[]`, `activeTab: string | null`.
        `Tab = {relPath, title}`. Functions: `openTab(path, title)`, `closeTab(path)`,
        `setActiveTab(path)`. No hard limit on tab count — tabs are closed
        manually by the user or via Ctrl+W / ⌘W.
      - Manual validation: Open multiple docs → store has multiple tabs
      - File: `frontend/src/stores/navigation.ts`

- [ ] T033 [P] [US4] Create TabBar Svelte component in `frontend/src/lib/center/TabBar.svelte`
      - Reason: Visual tab bar above the document view
      - Expected: Horizontal tab bar showing open tabs (title, close button).
        Active tab is highlighted and always visible in the bar. Clicking a tab
        switches the document view. Clicking close removes the tab.

        Overflow behaviour:
        - When tabs do not fit in the bar, an arrow button appears at the end.
        - Clicking the arrow opens a dropdown listing tabs that are not visible.
        - The active tab is never in the dropdown — it stays pinned in the bar.
        - Dropdown items ordered by open time DESC (most recent first).
        - Dropdown max height is 60% of viewport with internal scroll.
        - Each item shows filename truncated with ellipsis; full path on hover
          tooltip.
        - No close button in the dropdown — tabs are closed only from the bar.

      - Manual validation: Open 30+ docs → overflow arrow appears → dropdown
        shows overflow tabs ordered by recency → active tab stays in bar
      - File: `frontend/src/lib/center/TabBar.svelte`

- [ ] T034 [US4] Persist bookmarks in SQLite (per-project) in `pkg/indexer/indexer.go`
      - Reason: Bookmarks survive app restarts. Stored per-project in each
        project's own `.dokumd/index.sqlite` — bookmarks from one project are
        never visible in another project.
      - Expected: New `bookmarks` table in the per-project database. Methods:
        `AddBookmark(relPath)`, `RemoveBookmark(relPath)`, `GetBookmarks() []string`.
        Timestamps tracked. No cross-project bookmark sharing.
      - Manual validation: Bookmark a file in project A → open project B →
        bookmarks list is empty. Switch back to A → bookmarks still there.
      - File: `pkg/indexer/indexer.go`

- [ ] T035 [P] [US4] Create bookmark bindings in `internal/bindings/project.go`
      - Reason: Expose bookmark CRUD to the frontend
      - Expected: `AddBookmark(relPath)`, `RemoveBookmark(relPath)`,
        `GetBookmarks() []BookmarkInfo` bindings.
      - Manual validation: Call bindings from devtools — verify CRUD works
      - File: `internal/bindings/project.go`

- [ ] T036 [US4] Create Bookmark UI elements in `frontend/src/lib/sidebar/Bookmarks.svelte`
      - Reason: Users need to see and manage bookmarks. Bookmarks are per-project
        (scoped to index.sqlite) and rendered in an accordion section.
      - Expected: Bookmark list placed inside the "Bookmarks" accordion section of
        the sidebar. "Bookmarks" section starts closed by default. Has independent
        internal scroll. Each file in the tree (FileTree) has a star icon:
        visible on hover, always visible if bookmarked. The same star appears in
        the DocumentView header next to metadata. Clicking the star toggles the
        bookmark. Right-clicking a bookmark in the list shows option to remove.
      - Manual validation: Star a file in tree → star stays visible. Star in
        doc header matches. Bookmarks section shows the file. Restart → persists.
      - File: `frontend/src/lib/sidebar/Bookmarks.svelte`

- [ ] T037 [US4] Persist and restore recent projects list in `internal/bindings/project.go`
      - Reason: Show recently opened projects so users don't re-navigate each time
      - Expected: `GetRecentProjects()` reads from `~/.config/dokumd/projects.json`.
        `OpenProject()` appends to the list. Max 10 entries.
      - Manual validation: Open a folder, close app, reopen — recent list shows the folder
      - File: `internal/bindings/project.go`

- [ ] T038 [US4] Display recent projects in the left column in `frontend/src/lib/RecentProjects.svelte`
      - Reason: Surface recent projects for quick re-opening
      - Expected: Below "Open Folder" button, a list of recent project names is shown.
        Clicking one re-opens that project.
      - Manual validation: Open folder twice → recent list shows both → click to re-open
      - File: `frontend/src/lib/RecentProjects.svelte`

- [ ] T039 [US4] Integrate accordion sidebar, tabs, bookmarks and recent projects into App.svelte in `frontend/src/App.svelte`
      - Reason: Wire everything into the three-column layout
      - Expected: Left sidebar is an accordion with two sections:
        - "Project" (starts open by default) — contains FileTree + indexing status
        - "Bookmarks" (starts closed) — contains Bookmark list
        Only one accordion section open at a time. Each section has independent
        internal scroll. Tab bar above document view. Recent projects shown in
        the topbar or in a recent-files section. Opening a doc from bookmark
        creates a tab.
      - Manual validation: Full accordion — open Project (tree shows), close
        Project, open Bookmarks (list shows). Tabs + bookmarks + recent flow
        works end to end.
      - File: `frontend/src/App.svelte`

**Checkpoint**: Multiple tabs open simultaneously. Bookmarks and recent projects persist.

---

## Phase 7: Polish & Packaging

**Purpose**: Error handling, keyboard shortcuts, performance, and packaging.

- [ ] T040 [P] Add keyboard shortcuts with platform detection in `frontend/src/App.svelte`
      - Reason: Power users expect keyboard navigation. Shortcut labels must
        adapt to platform (⌘ on macOS, Ctrl on Linux/Windows).
      - Expected: Detect platform via Wails3 `runtime.Environment()` on startup.
        Store the platform modifier in a reactive variable. Register these
        shortcuts, using `Meta` on macOS and `Ctrl` on Linux/Windows:
        - **Ctrl+O / ⌘O** — `OpenDirectoryDialog` to open a folder
        - **Ctrl+K / ⌘K** — focus the search bar and open the search overlay
        - **Ctrl+W / ⌘W** — close the active tab
        - **Ctrl+Shift+T / ⌘Shift+T** — reopen the last closed tab (maintain
          a stack of recently closed tab paths)
        - **Ctrl+Tab / ⌘Tab** — navigate to the next tab
        - **Ctrl+Shift+Tab / ⌘Shift+Tab** — navigate to the previous tab
        - **Ctrl+D / ⌘D** — toggle bookmark on the currently open document
        - **Ctrl+F / ⌘F** — open local search in current document
        - **Escape** — close the search overlay or local search
      - File: `frontend/src/App.svelte`

- [ ] T040b [P] Add keyboard shortcut help overlay in `frontend/src/lib/overlays/ShortcutsOverlay.svelte` and `frontend/src/App.svelte`
      - Reason: Users need discoverability of keyboard shortcuts
      - Expected:
        - A "?" button in the topbar, positioned between the Browse button and
          the window buttons. Always on the right side regardless of platform
          (window buttons change side on macOS, the "?" does not).
        - Clicking "?" opens a centred overlay within the content area
          (`dk-wrap`), not covering the topbar or sidebar.
        - Overlay organised by category:
          - **Navigation**: Ctrl+O (⌘O), Ctrl+K (⌘K), Ctrl+W (⌘W),
            Ctrl+Tab (⌘Tab), Ctrl+Shift+Tab (⌘Shift+Tab), Ctrl+Shift+T (⌘Shift+T)
          - **Bookmarks**: Ctrl+D (⌘D)
          - **General**: ?, Esc
        - Pressing "?" (unmodified) opens the overlay when no input is focused.
        - Closes with Esc or clicking the ✕ button on the overlay.
        - All shortcut labels adapt to platform via `runtime.Environment()`
          (Ctrl on Linux/Windows, ⌘ on macOS).
      - File: `frontend/src/lib/overlays/ShortcutsOverlay.svelte` + `frontend/src/App.svelte`

- [ ] T040c [P] Create Toast and ToastContainer components in `frontend/src/lib/feedback/Toast.svelte` and `frontend/src/lib/feedback/ToastContainer.svelte`
      - Reason: User feedback for actions (bookmark toggled, file deleted,
        indexing complete) needs non-blocking notifications
      - Expected: Toast component renders a single notification with message
        and optional type (success, error, info). ToastContainer manages a
        stack of toasts, auto-dismisses after 3s, max 5 visible. Stacks from
        bottom-right. Integrate into App.svelte.
      - Manual validation: Trigger a toast → appears bottom-right → auto-dismisses
      - File: `frontend/src/lib/feedback/Toast.svelte` + `frontend/src/lib/feedback/ToastContainer.svelte` + `frontend/src/App.svelte`

- [ ] T041 [P] Handle edge cases in rendering: corrupted Markdown, binary `.md` files, very large files in `pkg/markdown/renderer.go`
      - Reason: Real-world docs won't always be well-formed
      - Expected: Invalid Markdown renders as plain text (Goldmark fallback).
        Files >1MB show truncated content with "File too large" warning.
        Binary `.md` files are skipped with a log warning.
      - File: `pkg/markdown/renderer.go`

- [ ] T042 [P] Handle indexing edge cases: symlinks, permission errors, very deep folder trees in `pkg/indexer/scanner.go`
      - Reason: Real file systems have edge cases
      - Expected: Symlinks are not followed (security). Permission errors are logged
        and skipped. Max depth of 20 levels to prevent infinite recursion on cycles.
      - File: `pkg/indexer/scanner.go`

- [ ] T043 [P] Configure Wails3 build for distribution in `wails.json`
      - Reason: Package the app for end users. The titlebar must adapt to
        platform conventions detected via `runtime.Environment()`.
      - Expected: `wails.json` has proper app name "dokumd", version, description,
        icon path. Build with `wails build -platform linux/darwin/windows`.
        Titlebar must follow platform convention using the same platform
        detection mechanism as keyboard shortcuts:
        - macOS: window buttons (close, minimize, maximize) on the left,
          traffic-light style. Use Wails3 `Titlebar` or frameless with
          custom titlebar component.
        - Windows/Linux: window buttons on the right, standard order
          (minimize, maximize, close). Default Wails3 behaviour or
          custom titlebar with right-aligned buttons.
      - File: `wails.json` + custom titlebar component if frameless approach used

- [ ] T044 [P] Create desktop build documentation in `docs/desktop-build.md`
      - Reason: Document how to build and package for each platform
      - Expected: Instructions for Linux (AppImage/Flatpak), macOS (.app bundle, notarization),
        Windows (MSI installer). Platform-specific requirements listed.
      - File: `docs/desktop-build.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 Bootstrap**: No dependencies — start immediately
- **Phase 1 Open Folder + Index**: Depends on Phase 0 (needs working Wails app)
- **Phase 2 File Tree**: Depends on Phase 1 (needs folder path + index)
- **Phase 3 Rendering**: Depends on Phase 2 (needs file selection)
- **Phase 4 Search**: Depends on Phase 1 (needs index)
- **Phase 5 Watcher**: Depends on Phase 1 (needs indexer)
- **Phase 6 Tabs/Bookmarks/Recent**: Depends on Phase 3 (needs document viewing).
  Parallels Phase 4+5.
- **Phase 7 Polish**: Depends on all phases complete

### Within Each Phase

Tasks within a phase run sequentially (one file at a time). Tasks marked [P]
can run in parallel if you choose to work on multiple files in one step.

### Parallel Opportunities

- Phase 3 (rendering) can be done before or in parallel with Phase 4+5
- Phase 4 (search) and Phase 5 (watcher) can be done in parallel
- Phase 6 (tabs) can be done in parallel with Phase 4-5
- All Phase 7 tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP (Phase 0-3 complete)

After completing Phases 0-3, the app can:
- Open a project folder and index all Markdown
- Browse the file tree
- Render Markdown documents with syntax highlighting and TOC

This is a functional MVP. Stop and validate here.

### Incremental Delivery

1. Phase 0-3: Basic browsing MVP (open + index + tree + render)
2. Phase 4: Add search
3. Phase 5: Add file watcher
4. Phase 6: Add tabs, bookmarks, recent projects
5. Phase 7: Polish and packaging
