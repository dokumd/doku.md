<script lang="ts">
  import { IconFolderOpen } from '@tabler/icons-svelte'

  // Props: path is the currently open project folder, or null if none.
  let { path }: { path: string | null } = $props()

  // Truncates a file path so the beginning and end are preserved,
  // replacing the middle with "/..../". This keeps the meaningful parts visible.
  // Example: /home/user/projects/docs/section-1/file.md → /home/user/..../docs/section-1/file.md
  function truncatePath(p: string, maxLen: number = 60): string {
    if (!p || p.length <= maxLen) return p ?? ''
    const parts = p.split('/')
    if (parts.length < 3) return p

    // Keep first two segments (e.g. /home/user) and the last segment (filename or deepest folder).
    const first = parts[0] + '/' + parts[1]
    const last = parts[parts.length - 1]
    const middle = parts.slice(2, -1)

    // Try shortest truncation first: /first/..../last
    let result = first + '/.../' + last
    // If still under maxLen, add more middle segments from the end.
    if (result.length > maxLen) {
      result = first + '/.../' + middle.slice(-2).join('/') + '/' + last
    }
    if (result.length > maxLen) {
      result = first + '/.../' + last
    }
    return result
  }
</script>

<div class="dk-statusbar">
  {#if path}
    <span class="dk-statusbar-path" title={path}><IconFolderOpen size={14} style="margin-right: 4px; vertical-align: text-bottom;" /> {truncatePath(path)}</span>
  {:else}
    <span class="dk-statusbar-path muted">No project open</span>
  {/if}
</div>

<style>
  .dk-statusbar {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    border-top: 0.5px solid var(--border, #333);
    font-size: 12px;
    color: var(--muted, #888);
    min-height: 26px;
    flex-shrink: 0;
  }
  .dk-statusbar-path {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dk-statusbar-path.muted {
    font-style: italic;
  }
</style>
