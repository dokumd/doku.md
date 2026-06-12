<script lang="ts">
  // Renders the Markdown document content in the center panel.
  // The title is shown as the document heading, path as metadata.
  // The document body is rendered via the default slot as raw HTML.
  let { title = '', path = '' }: { title?: string; path?: string } = $props()
</script>

<div class="dk-doc">
  {#if title}
    <h1>{title}</h1>
    <div class="meta">
      <span>{path}</span>
    </div>
  {/if}
  <slot />
</div>
