<script lang="ts">
  // Renders the Markdown document content in the center panel.
  // The title is shown as the document heading, path as metadata.
  // The document body is rendered via children snippet as raw HTML.
  let { title = '', path = '', children }: { title?: string; path?: string; children?: import('svelte').Snippet } = $props()
</script>

<div class="dk-doc">
  {#if title}
    <h1>{title}</h1>
    <div class="meta">
      <span>{path}</span>
    </div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>
