<script lang="ts">
  import { IconFolderOpen } from '@tabler/icons-svelte'

  // Props: path is the currently open project folder, or null if none.
  // indexedCount and indexStatus reflect the background indexing progress.
  let { path, indexedCount = 0, indexStatus = 'idle' }: {
    path: string | null
    indexedCount?: number
    indexStatus?: string
  } = $props()

  function truncatePath(p: string, maxLen: number = 60): string {
    if (!p || p.length <= maxLen) return p ?? ''
    const parts = p.split('/')
    if (parts.length < 3) return p

    const first = parts[0] + '/' + parts[1]
    const last = parts[parts.length - 1]
    const middle = parts.slice(2, -1)

    let result = first + '/.../' + last
    if (result.length > maxLen) {
      result = first + '/.../' + middle.slice(-2).join('/') + '/' + last
    }
    if (result.length > maxLen) {
      result = first + '/.../' + last
    }
    return result
  }

  // Status colour based on index state.
  let statusClass = $derived(
    indexStatus === 'indexing' ? 'status-yellow' :
    indexStatus === 'ready' ? 'status-green' :
    indexStatus === 'error' ? 'status-red' : ''
  )
</script>

<div class="dk-statusbar">
  <div class="dk-statusbar-left">
    {#if path}
      <span class="dk-statusbar-path" title={path}>
        <IconFolderOpen size={14} style="margin-right: 4px; vertical-align: text-bottom;" />
        {truncatePath(path)}
      </span>
    {:else}
      <span class="dk-statusbar-path muted">No project open</span>
    {/if}
  </div>
  <div class="dk-statusbar-right {statusClass}">
    {#if indexStatus === 'idle' && !path}
      <span></span>
    {:else if indexStatus === 'indexing'}
      <span>Indexing {indexedCount} files</span>
    {:else if indexStatus === 'ready'}
      <span>{indexedCount} docs indexed</span>
    {:else if indexStatus === 'error'}
      <span>Index error</span>
    {/if}
  </div>
</div>

<style>
  .dk-statusbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 12px;
    border-top: 0.5px solid var(--border, #333);
    font-size: 12px;
    color: var(--muted, #888);
    min-height: 26px;
    flex-shrink: 0;
  }
  .dk-statusbar-left {
    flex: 1;
    min-width: 0;
  }
  .dk-statusbar-path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dk-statusbar-path.muted {
    font-style: italic;
  }
  .dk-statusbar-right {
    flex-shrink: 0;
    margin-left: 12px;
  }
  .status-yellow { color: #eab308; }
  .status-green  { color: #22c55e; }
  .status-red    { color: #ef4444; }
</style>
