<script lang="ts">
  import { IconStarFilled } from '@tabler/icons-svelte'

  // Renders the Markdown document content in the center panel.
  // The title is shown as the document heading, path as metadata.
  // The document body is rendered via children snippet as raw HTML.
  // bookmarked and onbookmark control the bookmark star in the header.
  let { title = '', path = '', bookmarked = false, onbookmark, children }: {
    title?: string
    path?: string
    bookmarked?: boolean
    onbookmark?: () => void
    children?: import('svelte').Snippet
  } = $props()
</script>

<div class="dk-doc">
  {#if title}
    <h1>{title}</h1>
    <div class="meta">
      <span>{path}</span>
      {#if onbookmark}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span class="star-doc {bookmarked ? 'on' : ''}" onclick={onbookmark} role="button" tabindex="0">
          <IconStarFilled size={16} />
        </span>
      {/if}
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
