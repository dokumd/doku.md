<script lang="ts">
  import './app.css'
  import ShortcutsOverlay from './lib/overlays/ShortcutsOverlay.svelte'
  import SearchOverlay from './lib/overlays/SearchOverlay.svelte'
  import Titlebar from './lib/topbar/Titlebar.svelte'
  import TabBar from './lib/center/TabBar.svelte'
  import DocumentView from './lib/center/DocumentView.svelte'
  import TableOfContents from './lib/center/TableOfContents.svelte'
  import Accordion from './lib/sidebar/Accordion.svelte'
  import FileTree from './lib/sidebar/FileTree.svelte'
  import Bookmarks from './lib/sidebar/Bookmarks.svelte'
  import RecentFolders from './lib/sidebar/RecentFolders.svelte'
  import ToastContainer from './lib/feedback/ToastContainer.svelte'
  import StatusBar from './lib/center/StatusBar.svelte'
  import { OpenFolder, GetFileTree, IndexProject, GetDocument, SaveOpenTabs, GetOpenTabs, AddRecentFolder, GetRecentFolders, GetLastFolder, AddBookmark, RemoveBookmark, GetBookmarks } from '../bindings/changeme/internal/services/folderservice.js'
  import type { Tab, FileNode, TocItem, Toast } from './lib/types.js'
  import { buildTree } from './lib/helpers/tree.js'
  import { onMount } from 'svelte'
  import { Events, System } from '@wailsio/runtime'

  // ─── State ───────────────────────────────────────────────────────────────

  let accOpen = $state<string>('folder')
  let showSearch = $state(false)
  let showShortcuts = $state(false)
  let modifier = $state(System.IsMac() ? '⌘' : 'CTRL')
  let projectPath = $state<string | null>(null)

  // Open tabs — populated when the user clicks files in the tree.
  let tabs = $state<Tab[]>([])
  let nextTabId = $state(1)

  // File tree — populated when the user opens a folder.
  let tree = $state<FileNode[]>([])
  let indexCount = $state(0)
  let indexStatus = $state<string>('idle')
  let activeDoc = $state<{ html: string; title: string; headings: TocItem[] } | null>(null)
  let recentFolders = $state<{ path: string; lastOpened: string }[]>([])
  let bookmarksList = $state<{ relPath: string; title: string }[]>([])

  // Demo toasts
  let toasts = $state<Toast[]>([
    // { id: '1', type: 'success', message: 'Bookmark added — spec.md'                               },
    // { id: '2', type: 'warning', message: 'architecture.md was modified externally. Reload?'       },
    // { id: '3', type: 'error',   message: 'Failed to index document-042.md — permission denied'    },
  ])

  // ─── Derived ─────────────────────────────────────────────────────────────

  let bookmarked = $derived(
          bookmarksList
  )

  let activeTabPath = $derived(tabs.find(t => t.active)?.path ?? '')

  // When the active tab changes (user clicks a different tab or opens a file),
  // fetch and render the document.
  // When the active tab changes (user clicks a different tab or opens a file),
  // fetch and render the document.
  $effect(() => {
    const path = activeTabPath
    if (path && projectPath) {
      GetDocument(projectPath, path).then((result) => {
        activeDoc = {
          html: result.html,
          title: result.title,
          headings: result.headings,
        }
      })
    } else {
      activeDoc = null
    }
  })

  // Persist open tabs whenever the tabs array changes.
  // Uses a short debounce to avoid writing on every single-tab change.
  let tabTimer: ReturnType<typeof setTimeout> | undefined
  $effect(() => {
    const currentTabs = tabs
    if (projectPath && currentTabs.length > 0) {
      clearTimeout(tabTimer)
      const pp: string = projectPath
      tabTimer = setTimeout(() => {
        SaveOpenTabs(pp, currentTabs.map((t, i) => ({
          relPath: t.path,
          title: t.name,
          position: i,
          isActive: t.active,
        })))
      }, 500)
    }
    return () => clearTimeout(tabTimer)
  })

  // ─── Handlers ────────────────────────────────────────────────────────────

  function toggleAcc(section: string) {
    accOpen = accOpen === section ? '' : section
  }

  function toggleFolder(node: FileNode) {
    node.expanded = !node.expanded
  }

  async function toggleBookmark(node: FileNode) {
    if (!projectPath) return
    const relPath = node.path
    const isBookmarked = bookmarksList.some(b => b.relPath === relPath)
    if (isBookmarked) {
      await RemoveBookmark(projectPath, relPath)
    } else {
      const title = node.name.replace(/\.md$/, '')
      await AddBookmark(projectPath, relPath, title)
    }
    bookmarksList = await GetBookmarks(projectPath)
  }

  function closeTab(id: string) {
    const idx = tabs.findIndex(t => t.id === id)
    tabs = tabs.filter(t => t.id !== id)
    if (tabs.length && tabs[idx - 1]) tabs[idx - 1].active = true
    else if (tabs.length)             tabs[0].active = true
  }

  function activateTab(id: string) {
    tabs = tabs.map(t => ({ ...t, active: t.id === id }))
  }

  function dismissToast(id: string) {
    toasts = toasts.filter(t => t.id !== id)
  }

  async function openFolder(path?: string) {
    const folderPath = path ?? await OpenFolder()
    if (folderPath) {
      projectPath = folderPath
      indexStatus = 'indexing'
      const files = await GetFileTree(folderPath)
      tree = buildTree(files)

      await IndexProject(folderPath)
      AddRecentFolder(folderPath)
      recentFolders = await GetRecentFolders()
      bookmarksList = await GetBookmarks(folderPath)

      const saved = await GetOpenTabs(folderPath)
      if (saved.length > 0) {
        tabs = saved.map((t: any, i: number) => ({
          id: String(i + 1),
          name: t.relPath.split('/').pop() ?? t.relPath,
          path: t.relPath,
          active: t.isActive ?? i === 0,
        }))
        nextTabId = saved.length + 1
      } else {
        tabs = []
      }
    }
  }

  function scrollToHeading(id: string) {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  // ─── Keyboard shortcuts ───────────────────────────────────────────────────

  function handleKeydown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key === 'k') { e.preventDefault(); showSearch = true;    return }
    if (ctrl && e.key === 'o') { e.preventDefault(); openFolder();        return }
    if (e.key === 'Escape')    { showSearch = false; showShortcuts = false; return }
    if (e.key === '?' && !(e.target instanceof HTMLInputElement)) {
      showShortcuts = true
    }
  }

  onMount(async () => {
    Events.On('index:progress', (ev: any) => {
      indexCount = ev.data.done
      indexStatus = ev.data.state
    })

    // Load recent folders and auto-open the last one if it still exists.
    recentFolders = await GetRecentFolders()
    const lastPath = await GetLastFolder()
    if (lastPath) {
      projectPath = lastPath
      indexStatus = 'indexing'
      const files = await GetFileTree(lastPath)
      tree = buildTree(files)
      IndexProject(lastPath)
      bookmarksList = await GetBookmarks(lastPath)
      const saved = await GetOpenTabs(lastPath)
      if (saved.length > 0) {
        tabs = saved.map((t: any, i: number) => ({
          id: String(i + 1),
          name: t.relPath.split('/').pop() ?? t.relPath,
          path: t.relPath,
          active: t.isActive ?? i === 0,
        }))
        nextTabId = saved.length + 1
      }
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="dk">

  <Titlebar
    onsearch={() => showSearch = true}
    onbrowse={() => openFolder()}
    onshortcuts={() => showShortcuts = true}
  />

  <!-- ─── Body ─────────────────────────────────────────────────────────── -->
  <div class="dk-body">

    <div class="dk-left">
      {#snippet projectContent()}
        <FileTree
          nodes={tree}
          ontogglefolder={toggleFolder}
          ontogglebookmark={toggleBookmark}
          bookmarkedPaths={new Set(bookmarksList.map(b => b.relPath))}
          onselectfile={(file) => {
            const id = String(nextTabId++)
            const exists = tabs.find(t => t.path === file.path)
            if (exists) {
              tabs = tabs.map(t => ({ ...t, active: t.path === file.path }))
            } else {
              tabs = [...tabs.map(t => ({ ...t, active: false })), { id, name: file.name, path: file.path, active: true }]
            }
          }}
        />
      {/snippet}
      {#snippet bookmarksContent()}
        <Bookmarks
          items={bookmarksList.map(b => ({ name: b.title || b.relPath.split('/').pop() || b.relPath, path: b.relPath }))}
          onselect={(b) => {
            const id = String(nextTabId++)
            const exists = tabs.find(t => t.path === b.path)
            if (exists) {
              tabs = tabs.map(t => ({ ...t, active: t.path === b.path }))
            } else {
              tabs = [...tabs.map(t => ({ ...t, active: false })), { id, name: b.name, path: b.path, active: true }]
            }
          }}
        />
      {/snippet}
      {#snippet recentFoldersContent()}
        <RecentFolders
          items={recentFolders}
          onselect={(p) => openFolder(p)}
        />
      {/snippet}

      <Accordion
        sections={[
          { id: 'folder', title: 'FOLDER', snippet: projectContent },
          { id: 'bookmarks', title: 'BOOKMARKS', snippet: bookmarksContent },
          { id: 'recent', title: 'RECENT FOLDERS', snippet: recentFoldersContent },
        ]}
        open={accOpen}
        ontoggle={toggleAcc}
      />
    </div>

    <!-- ─── Center + Right ─────────────────────────────────────────── -->
    <div class="dk-wrap">
      <div class="dk-center">

        <TabBar
          {tabs}
          onactivetab={activateTab}
          onclosetab={closeTab}
        />

        {#if activeDoc}
          <DocumentView title={activeDoc.title} path={activeTabPath}>
            {@html activeDoc.html}
          </DocumentView>
        {:else}
          <DocumentView title="doku.md" path="">
            <p style="color: var(--muted); padding: 2rem; display: flex;">
              Open a folder or <button class="dk-btn" onclick={() => openFolder()}>Browse</button> documentation.
            </p>
          </DocumentView>
        {/if}

        <StatusBar path={projectPath} indexedCount={indexCount} {indexStatus} />
      </div>

      <TableOfContents items={activeDoc?.headings ?? []} indexedCount={indexCount} status={indexStatus === 'ready' ? 'Ready' : indexStatus === 'indexing' ? 'Indexing...' : 'Idle'} onnavigate={scrollToHeading} />

      <!-- ─── Search overlay ────────────────────────────────────── -->
      <SearchOverlay
        show={showSearch}
        onclose={() => showSearch = false}
        {projectPath}
        onselect={(result: any) => {
          showSearch = false
          const id = String(nextTabId++)
          const path = result.relPath
          const name = path.split('/').pop() ?? path
          const exists = tabs.find(t => t.path === path)
          if (exists) {
            tabs = tabs.map(t => ({ ...t, active: t.path === path }))
          } else {
            tabs = [...tabs.map(t => ({ ...t, active: false })), { id, name, path, active: true }]
          }
        }}
      />

      <ShortcutsOverlay show={showShortcuts} {modifier} onclose={() => showShortcuts = false} />

    </div>
  </div>
</div>

<ToastContainer items={toasts} ondismiss={dismissToast} />