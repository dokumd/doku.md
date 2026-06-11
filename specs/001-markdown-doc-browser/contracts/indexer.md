# Indexer Contract

## Go Interface

```go
// Indexer manages the SQLite FTS5 index for a project's Markdown documents.
type Indexer interface {
    // Open initializes or opens the index for the given project path.
    // Index database is at <projectPath>/.dokumd/index.sqlite.
    Open(projectPath string) error

    // Close closes the index database.
    Close() error

    // IndexDocuments indexes all Markdown files under the project path.
    // Returns a count of indexed files and any errors encountered.
    IndexDocuments() (count int, err error)

    // IndexFile indexes a single file by its absolute path.
    IndexFile(absPath string) error

    // RemoveFile removes a file from the index by its absolute path.
    RemoveFile(absPath string) error

    // Search performs a full-text search across indexed documents.
    // Query uses FTS5 syntax. Limit caps results (default 50).
    Search(query string, limit int) ([]SearchResult, error)

    // SearchByTitle searches documents by title (LIKE or FTS).
    SearchByTitle(title string, limit int) ([]SearchResult, error)

    // SearchByPath searches documents by file path substring.
    SearchByPath(path string, limit int) ([]SearchResult, error)
}

// SearchResult represents a single search hit.
type SearchResult struct {
    RelPath   string   `json:"relPath"`
    Title     string   `json:"title"`
    Snippet   string   `json:"snippet"`   // Surrounding context around match
    Score     float64  `json:"score"`     // FTS5 rank
    Headings  []Heading `json:"headings"` // Document headings for context
}

// Heading represents a Markdown heading in a document.
type Heading struct {
    Level int    `json:"level"`
    Text  string `json:"text"`
    ID    string `json:"id"` // Anchor ID for navigation
}
```

## Wails3 Frontend Bindings (Exposed to JS)

```typescript
// Bindings exposed to the Svelte frontend via Wails3.

interface ProjectAPI {
    OpenProject(path: string): Promise<ProjectInfo>;
    GetRecentProjects(): Promise<ProjectInfo[]>;
    RemoveRecentProject(path: string): Promise<void>;
}

interface IndexerAPI {
    GetIndexStatus(): Promise<IndexStatus>;
    ReindexAll(): Promise<number>;              // returns file count
}

interface SearchAPI {
    SearchAll(query: string, limit?: number): Promise<SearchResult[]>;
    SearchByTitle(title: string, limit?: number): Promise<SearchResult[]>;
    SearchByPath(path: string, limit?: number): Promise<SearchResult[]>;
}

interface WatcherAPI {
    OnFileChange(callback: (event: FileEvent) => void): void;  // event subscription
    GetWatchedPaths(): Promise<string[]>;
}

// Types
interface ProjectInfo {
    path: string;
    name: string;
    lastOpened: string;
    indexStatus: 'idle' | 'indexing' | 'ready' | 'error';
}

interface SearchResult {
    relPath: string;
    title: string;
    snippet: string;
    score: number;
    headings: { level: number; text: string; id: string }[];
}

interface FileEvent {
    type: 'created' | 'modified' | 'deleted' | 'renamed';
    path: string;
    timestamp: string;
}

interface IndexStatus {
    totalFiles: number;
    indexedFiles: number;
    status: 'idle' | 'indexing' | 'ready' | 'error';
    lastIndexed: string | null;
}
```
