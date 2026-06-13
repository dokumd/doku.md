<script lang="ts">
  import type { TocItem } from '../types.js'

  // Right panel showing the table of contents for the current document
  // and the indexing status of the project.
  let { items, indexedCount, status, onnavigate }: {
    items: TocItem[]
    indexedCount: number
    status: string
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
  <div class="dk-status">TO CHANGE SOON</div>
</div>
