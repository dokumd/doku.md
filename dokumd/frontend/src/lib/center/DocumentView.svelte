<script lang="ts">
  import { IconStarFilled } from '@tabler/icons-svelte'

  // Renders the Markdown document content in the center panel.
  // Metadata (path, date, status) is shown in the header alongside a bookmark star.
  // The document body is rendered via the default slot, allowing arbitrary HTML.
  let { title, path, date, status, onbookmark, bookmarked }: {
    title: string
    path: string
    date: string
    status: string
    onbookmark?: () => void  // If provided, shows a clickable bookmark star
    bookmarked?: boolean
  } = $props()
</script>

<div class="dk-doc">
  <h1>{title}</h1>
  <div class="meta">
    <span>{path}</span>
    <span>·</span>
    <span>{date}</span>
    <span>·</span>
    <span>{status}</span>
    {#if onbookmark}
      <span class="star-doc {bookmarked ? 'on' : ''}" onclick={onbookmark} role="button" tabindex="0">
        <IconStarFilled size={16} />
      </span>
    {/if}
  </div>
  <slot />
</div>
