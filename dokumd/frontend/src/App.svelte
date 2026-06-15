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
  import { OpenFolder, GetFileTree, IndexProject, GetDocument, SaveOpenTabs, GetOpenTabs, AddRecentFolder, GetRecentFolders, GetLastFolder, AddBookmark, RemoveBookmark, GetBookmarks } from '../bindings/dokumd/internal/services/folderservice.js'
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
  let showLocalSearch = $state(false)
  let localSearchQuery = $state('')

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
    // Ao mudar de tab, fechar o local search e limpar estado.
    showLocalSearch = false
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

  // Percorre a árvore recursivamente para encontrar um FileNode pelo path.
  // Necessário porque a tree pode ter profundidade >1 (ex: docs/sub/file.md),
  // e o flatMap simples só desce um nível. Sem esta função, a estrela de
  // bookmark no DocumentView não consegue encontrar nós em sub-subpastas.
  function findNodeByPath(nodes: FileNode[], targetPath: string): FileNode | null {
    for (const node of nodes) {
      if (!node.isDir && node.path === targetPath) return node
      if (node.children) {
        const found = findNodeByPath(node.children, targetPath)
        if (found) return found
      }
    }
    return null
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

      // Construir set de paths válidos para filtrar tabs persistentes
      // que já não existem em disco (ex: ficheiro renomeado/apagado).
      const validPaths = new Set(files.map((f: any) => f.path))

      const saved = await GetOpenTabs(folderPath)
      if (saved.length > 0) {
        const restored = saved.filter((t: any) => validPaths.has(t.relPath))
        tabs = restored.map((t: any, i: number) => ({
          id: String(i + 1),
          name: t.relPath.split('/').pop() ?? t.relPath,
          path: t.relPath,
          active: t.isActive ?? i === 0,
        }))
        nextTabId = restored.length + 1
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
    if (ctrl && e.key === 'f') { e.preventDefault(); if (activeDoc) showLocalSearch = true; return }
    if (e.key === 'Escape')    { showSearch = false; showShortcuts = false; showLocalSearch = false; return }
    if (e.key === '?' && !(e.target instanceof HTMLInputElement)) {
      showShortcuts = true
    }
  }

  onMount(async () => {
    Events.On('index:progress', (ev: any) => {
      indexCount = ev.data.done
      indexStatus = ev.data.state
    })

    Events.On('file:changed', (ev: any) => {
      const changedPath = ev.data.path as string
      const action = ev.data.action as string
      if (!projectPath) return

      // Se o ficheiro alterado está aberto no tab ativo, rerender.
      if (action === 'modified' && changedPath === activeTabPath && projectPath) {
        GetDocument(projectPath, changedPath).then((result) => {
          activeDoc = {
            html: result.html,
            title: result.title,
            headings: result.headings,
          }
        })
      }

      // Se o ficheiro foi apagado (ou renomeado — o watcher vê como delete do antigo):
      // fechar o tab se estiver aberto, atualizar tree, recarregar bookmarks.
      if (action === 'created' || action === 'deleted') {
        if (action === 'deleted') {
          const tabToClose = tabs.find(t => t.path === changedPath)
          if (tabToClose) closeTab(tabToClose.id)
        }
        GetFileTree(projectPath).then((files) => {
          tree = buildTree(files)
        })
        // Recarregar bookmarks (o bookmark com path antigo foi removido).
        GetBookmarks(projectPath).then((list) => {
          bookmarksList = list
        })
      }
    })

    // Load recent folders and auto-open the last one if it still exists.
    recentFolders = await GetRecentFolders()
    const lastPath = await GetLastFolder()
    if (lastPath) {
      projectPath = lastPath
      indexStatus = 'indexing'
      const files = await GetFileTree(lastPath)
      tree = buildTree(files)
      const validPaths = new Set(files.map((f: any) => f.path))

      IndexProject(lastPath)
      bookmarksList = await GetBookmarks(lastPath)
      const saved = await GetOpenTabs(lastPath)
      if (saved.length > 0) {
        const restored = saved.filter((t: any) => validPaths.has(t.relPath))
        tabs = restored.map((t: any, i: number) => ({
          id: String(i + 1),
          name: t.relPath.split('/').pop() ?? t.relPath,
          path: t.relPath,
          active: t.isActive ?? i === 0,
        }))
        nextTabId = restored.length + 1
      }
    }

    // Timer de health check: verifica a cada 10s se a pasta principal ainda existe.
    // Se tiver sido apagada ou renomeada, fecha o projeto.
    setInterval(async () => {
      if (projectPath) {
        try {
          // Tentar listar a pasta — se falhar, o projeto fechou.
          await GetFileTree(projectPath)
        } catch {
          projectPath = null
          tree = []
          tabs = []
          activeDoc = null
          indexStatus = 'idle'
          indexCount = 0
        }
      }
    }, 10000)
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
          <DocumentView
            title={activeDoc.title}
            path={activeTabPath}
            bookmarked={bookmarksList.some(b => b.relPath === activeTabPath)}
            onbookmark={() => {
              const file = findNodeByPath(tree, activeTabPath)
              if (file) toggleBookmark(file)
            }}
            showLocalSearch={showLocalSearch && activeDoc !== null}
            localSearchQuery={localSearchQuery}
            onlocalSearchQuery={(q: string) => localSearchQuery = q}
            oncloseLocalSearch={() => showLocalSearch = false}
          >
            {@html activeDoc.html}
          </DocumentView>
        {:else}
          <DocumentView title="" path="">
            <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <img src="/logo.svg" alt="" style="width: 200px; height: 200px;" />
              <h1>doku<span style="font-weight: 100; color: var(--text-2); font-size: 14px;">.md</span></h1>
              <p style="color: var(--muted); padding: 2rem; display: flex;">
                <button class="dk-btn" onclick={() => openFolder()}>Browse documentation</button>
              </p>
            </div>

          </DocumentView>
        {/if}

        <StatusBar path={projectPath} indexedCount={indexCount} {indexStatus} />
      </div>

      <TableOfContents items={activeDoc?.headings ?? []} fileCount={indexCount || tree.flatMap(n => n.children ?? []).length} bookmarkCount={bookmarksList.length} onnavigate={scrollToHeading} />

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