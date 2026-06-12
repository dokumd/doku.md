import type { FileNode } from '../types.js'

// FileEntry shape as returned by the Go scanner binding.
// Defined here to decouple from the Wails-generated model class.
interface FileEntry {
  path: string
  isDir: boolean
}

/**
 * Converts a flat list of FileEntry items (returned by the Go scanner) into
 * a nested FileNode tree. Each entry's isDir flag is used directly — the
 * frontend never guesses whether something is a file or a directory.
 *
 * Example:
 *   [
 *     { path: "docs/guide.md",  isDir: false },
 *     { path: "docs/api/index.md", isDir: false },
 *     { path: "osmeusficheiros.md", isDir: true },  // a directory named like a file!
 *     { path: "readme.md",      isDir: false },
 *   ]
 *   →
 *   [
 *     { name: "docs", isDir: true, children: [
 *       { name: "guide.md",  path: "docs/guide.md",  isDir: false },
 *       { name: "api",       isDir: true, children: [
 *         { name: "index.md", path: "docs/api/index.md", isDir: false }
 *       ]}
 *     ]},
 *     { name: "osmeusficheiros.md", path: "osmeusficheiros.md", isDir: true },
 *     { name: "readme.md",          path: "readme.md",          isDir: false },
 *   ]
 */
export function buildTree(entries: FileEntry[], expanded: boolean = false): FileNode[] {
  const root: FileNode[] = []

  for (const entry of entries) {
    const parts = entry.path.split('/')
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (isLast) {
        // Leaf node — use the entry's isDir directly from the OS.
        currentLevel.push({
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir: entry.isDir,
        })
      } else {
        // Intermediate segment — always a directory.
        let existing = currentLevel.find(
          (n) => n.isDir && n.name === part,
        ) as FileNode | undefined

        if (!existing) {
          existing = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            isDir: true,
            expanded,
            children: [],
          }
          currentLevel.push(existing)
        }

        currentLevel = existing.children ?? []
      }
    }
  }

  return root
}
