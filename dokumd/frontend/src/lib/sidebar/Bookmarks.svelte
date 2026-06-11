<script lang="ts">
  import { IconStarFilled } from '@tabler/icons-svelte'
  import type { Bookmark } from '../types.js'

  // Renders the list of bookmarked documents in the sidebar's Bookmarks section.
  // Each item is clickable and opens the corresponding document.
  let { items, onselect }: {
    items: Bookmark[]
    onselect: (item: Bookmark) => void
  } = $props()
</script>

<div class="dk-bm-list">
  {#each items as item}
    <div class="dk-bm-item" onclick={() => onselect(item)} role="button" tabindex="0">
      <IconStarFilled size={14} />
      {item.name}
    </div>
  {/each}
</div>
