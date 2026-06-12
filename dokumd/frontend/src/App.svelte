<script lang="ts">
  import './app.css'
  import {
    IconSearch,
    IconFolderOpen,
    IconHelp,
    IconMinus,
    IconSquare,
    IconX,
    IconChevronDown,
    IconChevronUp,
    IconFolder,
    IconFileText,
    IconStar,
    IconStarFilled,
    IconDatabase,
    IconCircleCheck,
    IconAlertTriangle,
    IconCircleX,
  } from '@tabler/icons-svelte'
  import ShortcutsOverlay from './lib/overlays/ShortcutsOverlay.svelte'
  import SearchOverlay from './lib/overlays/SearchOverlay.svelte'
  import Titlebar from './lib/topbar/Titlebar.svelte'
  import TabBar from './lib/center/TabBar.svelte'
  import DocumentView from './lib/center/DocumentView.svelte'
  import TableOfContents from './lib/center/TableOfContents.svelte'
  import Accordion from './lib/sidebar/Accordion.svelte'
  import FileTree from './lib/sidebar/FileTree.svelte'
  import Bookmarks from './lib/sidebar/Bookmarks.svelte'
  import ToastContainer from './lib/feedback/ToastContainer.svelte'
  import StatusBar from './lib/center/StatusBar.svelte'
  import { OpenFolder, GetFileTree, IndexProject } from '../bindings/changeme/internal/services/folderservice.js'
  import { Minimise, Maximise, Close } from '../bindings/changeme/internal/services/windowservice.js'
  import type { Tab, FileNode, TocItem, Toast } from './lib/types.js'
  import { buildTree } from './lib/helpers/tree.js'
  import { onMount } from 'svelte'
  import { Events } from '@wailsio/runtime'

  // ─── State ───────────────────────────────────────────────────────────────

  let accOpen = $state<string>('project')
  let showSearch = $state(false)
  let showShortcuts = $state(false)
  let overflowOpen = $state(false)
  let projectPath = $state<string | null>(null)

  // Demo tabs
  let tabs = $state<Tab[]>([
    { id: '1', name: 'spec.md',         path: 'specs/001-markdown-doc-browser/spec.md', active: true  },
    { id: '2', name: 'plan.md',          path: 'specs/001-markdown-doc-browser/plan.md', active: false },
    { id: '3', name: 'tasks.md',         path: 'specs/001-markdown-doc-browser/tasks.md', active: false },
    { id: '4', name: 'architecture.md',  path: 'docs/architecture.md', active: false },
    { id: '5', name: 'quickstart.md',    path: 'docs/quickstart.md', active: false },
    { id: '6', name: 'constitution.md',  path: '.specify/memory/constitution.md', active: false },
    { id: '7', name: 'indexer.md',       path: 'specs/contracts/indexer.md', active: false },
    { id: '8', name: 'data-model.md',    path: 'specs/001-markdown-doc-browser/data-model.md', active: false },
    { id: '9', name: 'README.md',        path: 'README.md', active: false },
    { id: '10', name: 'AGENTS.md',       path: 'AGENTS.md', active: false },
  ])

  // Overflow tabs (demo)
  let overflowTabs = $state<Tab[]>(
          Array.from({ length: 20 }, (_, i) => ({
            id: `o${i}`,
            name: `document-0${90 - i}.md`,
            path: `docs/section-${(i % 5) + 1}/document-0${90 - i}.md`,
            active: false,
          }))
  )

  // File tree — populated when the user opens a folder.
  let tree = $state<FileNode[]>([])
  let indexCount = $state(0)
  let indexStatus = $state<string>('idle')

  // Demo TOC
  const toc: TocItem[] = [
    { text: 'Overview',        level: 1, active: true  },
    { text: 'User stories',    level: 2, active: false },
    { text: 'Technical stack', level: 2, active: false },
    { text: 'Success criteria',level: 2, active: false },
    { text: 'Requirements',    level: 1, active: false },
    { text: 'Functional',      level: 2, active: false },
    { text: 'Key entities',    level: 2, active: false },
    { text: 'Assumptions',     level: 1, active: false },
    { text: 'Edge cases',      level: 3, active: false },
    { text: 'Out of scope',    level: 3, active: false },
  ]

  // Demo toasts
  let toasts = $state<Toast[]>([
    // { id: '1', type: 'success', message: 'Bookmark added — spec.md'                               },
    // { id: '2', type: 'warning', message: 'architecture.md was modified externally. Reload?'       },
    // { id: '3', type: 'error',   message: 'Failed to index document-042.md — permission denied'    },
  ])

  // ─── Derived ─────────────────────────────────────────────────────────────

  let bookmarked = $derived(
          tree.flatMap(n => n.children ?? []).filter(f => f.bookmarked)
  )

  // ─── Handlers ────────────────────────────────────────────────────────────

  function toggleAcc(section: string) {
    accOpen = accOpen === section ? '' : section
  }

  function toggleFolder(node: FileNode) {
    node.expanded = !node.expanded
  }

  function toggleBookmark(node: FileNode) {
    node.bookmarked = !node.bookmarked
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

  async function openFolder() {
    const path = await OpenFolder()
    if (path) {
      projectPath = path
      indexStatus = 'indexing'
      const files = await GetFileTree(path)
      tree = buildTree(files)
      IndexProject(path)
    }
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

  onMount(() => {
    Events.On('index:progress', (ev: any) => {
      indexCount = ev.data.done
      indexStatus = ev.data.state
    })
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="dk">

  <Titlebar
    onsearch={() => showSearch = true}
    onbrowse={openFolder}
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
          onselectfile={() => {}}
        />
      {/snippet}
      {#snippet bookmarksContent()}
        <Bookmarks
          items={bookmarked.map(b => ({ name: b.name, path: b.path }))}
          onselect={() => {}}
        />
      {/snippet}

      <Accordion
        sections={[
          { id: 'project', title: 'Project', snippet: projectContent },
          { id: 'bookmarks', title: 'Bookmarks', snippet: bookmarksContent },
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
          {overflowTabs}
          onactivetab={activateTab}
          onclosetab={closeTab}
          ontoggleoverflow={() => overflowOpen = !overflowOpen}
          {overflowOpen}
        />

        <DocumentView
          title="Feature Specification: Markdown Documentation Browser"
          path="specs/001-markdown-doc-browser"
          date="2026-06-10"
          status="Draft"
          bookmarked={true}
        >
          <h2>Overview</h2>
          <p>Desktop application for browsing, searching, and understanding Markdown-based technical documentation.</p>
          <h2>User Stories</h2>
          <p>The core experience is opening a project folder and navigating its documentation through a file tree.</p>
          <h2>Technical Stack</h2>
          <div class="dk-codeblock">
            <pre><span class="ck-kw">const</span><span class="ck-tx"> stack</span> = &#123;
              backend:  <span class="ck-st">'Wails3 + Go 1.22'</span>,
              frontend: <span class="ck-st">'Svelte 5 + TypeScript'</span>,
              storage:  <span class="ck-st">'SQLite + FTS5'</span>,
              watcher:  <span class="ck-st">'fsnotify'</span>,
            &#125;</pre>
          </div>
          <h2>Success Criteria</h2>
          <p>Open a project with <code>1000</code> files in under <code>5s</code>.</p>
        </DocumentView>

        <StatusBar path={projectPath} indexedCount={indexCount} {indexStatus} />
      </div>

      <TableOfContents items={toc} indexedCount={1842} status="Ready" />

      <!-- ─── Search overlay ────────────────────────────────────── -->
      <SearchOverlay show={showSearch} onclose={() => showSearch = false} />

      <ShortcutsOverlay show={showShortcuts} onclose={() => showShortcuts = false} />

    </div>
  </div>
</div>

<ToastContainer items={toasts} ondismiss={dismissToast} />