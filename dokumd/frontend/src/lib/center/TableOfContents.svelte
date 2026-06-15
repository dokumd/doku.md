<script lang="ts">
  import type { TocItem } from '../types.js'

  // Right panel showing the table of contents for the current document
  // and metadata about the current project.
  let { items, fileCount = 0, bookmarkCount = 0, onnavigate }: {
    items: TocItem[]
    fileCount?: number
    bookmarkCount?: number
    onnavigate?: (id: string) => void
  } = $props()
</script>

<div class="dk-right">
  <div class="dk-toc">
    <div class="dk-toc-title">On this page</div>
    {#each items as item}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="dk-toc-item {item.active ? 'active' : ''} {item.level === 2 ? 'l2' : item.level === 3 ? 'l3' : ''}"
        onclick={() => onnavigate?.(item.id)}
        role="button"
        tabindex="0"
      >
        {item.text}
      </div>
    {/each}
  </div>
  <div class="dk-meta">
    <span>{fileCount} files</span>
    {#if bookmarkCount > 0}
      <span>· {bookmarkCount} bookmarks</span>
    {/if}
  </div>
</div>

<style>
  .dk-meta {
    padding: 8px 12px;
    font-size: 12px;
    color: var(--muted, #888);
    border-top: 0.5px solid var(--border);
  }
</style>
