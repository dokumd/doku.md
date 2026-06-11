<script lang="ts">
  import type { TocItem } from '../types.js'

  // Right panel showing the table of contents for the current document
  // and the indexing status of the project.
  let { items, indexedCount, status }: {
    items: TocItem[]
    indexedCount: number  // Total number of indexed Markdown files
    status: string         // Indexer status: idle / indexing / ready / error
  } = $props()
</script>

<div class="dk-right">
  <div class="dk-toc">
    <div class="dk-toc-title">On this page</div>
    {#each items as item}
      <div class="dk-toc-item {item.active ? 'active' : ''} {item.level === 2 ? 'l2' : item.level === 3 ? 'l3' : ''}">
        {item.text}
      </div>
    {/each}
  </div>
  <div class="dk-status">
    <span>{indexedCount} docs indexed</span>
    <span class="dk-badge">{status}</span>
  </div>
</div>
