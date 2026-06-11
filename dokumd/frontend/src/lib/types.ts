// ─── Project / Folder ──────────────────────────────────────────

export interface ProjectInfo {
  path: string
  name: string
  lastOpened: string
}

// ─── File Tree ─────────────────────────────────────────────────

export interface FileNode {
  name: string
  path: string
  isDir: boolean
  bookmarked?: boolean
  children?: FileNode[]
  expanded?: boolean
}

// ─── Tabs ──────────────────────────────────────────────────────

export interface Tab {
  id: string
  name: string
  path: string
  active: boolean
}

// ─── Bookmark ──────────────────────────────────────────────────

export interface Bookmark {
  name: string
  path: string
}

// ─── Table of Contents ─────────────────────────────────────────

export interface TocItem {
  text: string
  level: number
  active?: boolean
}

// ─── Document ──────────────────────────────────────────────────

export interface DocumentView {
  html: string
  headings: TocItem[]
  title: string
  relPath: string
  wordCount: number
}

// ─── Search ────────────────────────────────────────────────────

export interface SearchResult {
  relPath: string
  title: string
  snippet: string
  score: number
  headings: TocItem[]
}

// ─── Indexing ──────────────────────────────────────────────────

export interface IndexProgress {
  done: number
  total: number
}

export interface FileDiscoveredEvent {
  files: string[]
  total: number
}

export type IndexStatus = 'idle' | 'indexing' | 'ready' | 'error'

// ─── File Watcher ──────────────────────────────────────────────

export interface FileEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed'
  path: string
  timestamp: string
}

// ─── Toast / Feedback ──────────────────────────────────────────

export interface Toast {
  id: string
  type: 'success' | 'warning' | 'error'
  message: string
}

// ─── Accordion ─────────────────────────────────────────────────

export type AccSection = 'project' | 'bookmarks'
