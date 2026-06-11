# Feature Specification: Markdown Documentation Browser

**Feature Branch**: `001-markdown-doc-browser`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Desktop app for browsing, searching, and understanding Markdown-based technical documentation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open a project and browse its docs (Priority: P1)

A developer opens an existing project folder and browses the Markdown documentation
through a file tree, selecting documents to read. This is the core experience — the
reason the application exists.

**Why this priority**: Without the ability to open and browse documentation, there is no product. Everything else depends on this foundation.

**Independent Test**: Can be fully tested by opening any folder containing Markdown files and verifying the tree displays them and selecting a file renders its content.

**Acceptance Scenarios**:

1. **Given** the user has a folder with Markdown files, **When** they select that folder, **Then** the app displays a file tree showing only Markdown files and subfolders.
2. **Given** the file tree is displayed, **When** the user clicks a Markdown file, **Then** the app renders its content with proper Markdown formatting.

---

### User Story 2 - Search across all documentation (Priority: P1)

A developer searches all documentation in a project to find specific information,
using full-text search, title search, and path search. This is the second core pillar —
finding information quickly.

**Why this priority**: Browsing is insufficient when documentation spans hundreds of files. Search is essential for rapid context recovery.

**Independent Test**: Can be tested by creating several Markdown files with known content, then searching for specific terms and verifying results appear.

**Acceptance Scenarios**:

1. **Given** a project with multiple indexed Markdown files, **When** the user types a search query, **Then** matching results appear grouped by relevance.
2. **Given** search results are displayed, **When** the user clicks a result, **Then** they navigate to that document.
3. **Given** the user searches by a document title, **When** they type a partial title, **Then** the matching document appears in results.

---

### User Story 3 - Keep the index in sync with file changes (Priority: P2)

Files in the project are created, modified, moved, or deleted. The index updates
automatically without requiring manual reindexing or restarts.

**Why this priority**: A stale index leads to broken searches and missing documents, destroying trust in the tool.

**Independent Test**: Can be tested by adding a new Markdown file while the app is running, then searching for its content and verifying it appears.

**Acceptance Scenarios**:

1. **Given** the app is open and watching a project, **When** a new Markdown file is created, **Then** it appears in the index within seconds.
2. **Given** an indexed file is modified, **When** the file is saved, **Then** the index updates with the new content.
3. **Given** an indexed file is deleted, **When** the file system change is detected, **Then** the file is removed from the index.

---

### User Story 4 - Navigate with tabs and bookmarks (Priority: P2)

A developer opens multiple documents in tabs and bookmarks frequently accessed
files for quick access.

**Why this priority**: Tabs and bookmarks enable efficient multi-document workflows, which are common when understanding a complex project.

**Independent Test**: Can be tested by opening several documents in tabs, bookmarking a file, restarting the app, and verifying bookmarks persist.

**Acceptance Scenarios**:

1. **Given** a document is open, **When** the user clicks a bookmark icon, **Then** the document is saved to a bookmarks list.
2. **Given** multiple documents are open, **When** the user clicks between tabs, **Then** each tab displays its respective document.
3. **Given** the app is restarted, **When** the user opens the project again, **Then** bookmarks from the previous session are preserved.

### Edge Cases

- What happens when a project folder contains thousands of Markdown files?
- How does the system handle corrupted or invalid Markdown files?
- What happens when a file is deleted while it is open in a tab?
- How are symlinks or files outside the project root handled?
- How does the system handle binary files with a `.md` extension?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to open a local folder as a project.
- **FR-002**: System MUST display a file tree showing only Markdown files and subfolders.
- **FR-003**: System MUST render Markdown documents with proper formatting, including headings, lists, code blocks, tables, and images.
- **FR-004**: System MUST generate an automatic table of contents from document headings.
- **FR-005**: System MUST provide full-text search across all indexed documents.
- **FR-006**: System MUST support search by document title.
- **FR-007**: System MUST support search by file path.
- **FR-008**: System MUST index documents automatically on project open.
- **FR-009**: System MUST watch the file system for changes and reindex automatically.
- **FR-010**: System MUST remove deleted files from the index.
- **FR-011**: System MUST keep a list of recently opened projects.
- **FR-012**: System MUST support opening multiple documents in tabs.
- **FR-013**: System MUST allow users to bookmark documents and persist bookmarks across sessions.
- **FR-014**: System MUST display syntax highlighting in code blocks.
- **FR-015**: System MUST provide quick navigation between document sections via table of contents.

### Key Entities *(include if feature involves data)*

- **Project**: A local folder containing Markdown documentation. Has a path, a name, recent-open timestamp, and an associated SQLite index.
- **Document**: A Markdown file within a project. Has a path, title, content hash, indexed content, and metadata (headings, word count).
- **Bookmark**: A saved reference to a document. Has a project association, document path, and creation timestamp.
- **Search Index**: A per-project FTS index stored in SQLite. Contains document content, titles, and paths for fast lookups.
- **File Watcher**: A per-project service that monitors file system changes and triggers reindexing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can open a project with 1000 Markdown files and start browsing within 5 seconds.
- **SC-002**: Full-text search across 1000 documents returns results in under 1 second.
- **SC-003**: File system changes (create/modify/delete) are reflected in the index within 3 seconds.
- **SC-004**: A developer can open a project they haven't visited in 6 months and understand its documentation structure within 2 minutes.
- **SC-005**: The application consumes under 200MB of RAM when indexing 1000 files.
- **SC-006**: 90% of users can complete their first search successfully without referring to documentation.

## Assumptions

- Users have a local folder with Markdown files — no remote or cloud storage is required.
- Mobile and web versions are out of scope for MVP.
- The application is a desktop-native app focused on reading, not editing documents.
- Documents are standard Markdown files — no proprietary extensions required.
- Projects range from 10 to 10,000 Markdown files for typical use cases.
- No authentication or user management is needed — the app is single-user.
