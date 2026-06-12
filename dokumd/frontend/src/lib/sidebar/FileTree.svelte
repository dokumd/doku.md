<script lang="ts">
  import { IconChevronDown, IconChevronRight, IconFolder, IconFileText, IconStar, IconStarFilled } from '@tabler/icons-svelte'
  import type { FileNode } from '../types.js'

  // Renders a tree of folders and files. Each file row includes a clickable
  // star icon (bookmark toggle) visible on hover and always visible if bookmarked.
  // The isDir flag comes from the backend scanner and determines how each node is rendered.
  // bookmarkedPaths is a Set of relative paths to show the star as filled.
  let { nodes, ontogglefolder, ontogglebookmark, onselectfile, bookmarkedPaths = new Set<string>() }: {
    nodes: FileNode[]
    ontogglefolder: (node: FileNode) => void
    ontogglebookmark: (node: FileNode) => void
    onselectfile: (node: FileNode) => void
    bookmarkedPaths?: Set<string>
  } = $props()
</script>

<div class="dk-tree">
  {#each nodes as node}
    {#if node.isDir}
      <div
        class="dk-folder"
        onclick={() => ontogglefolder(node)}
        role="button"
        tabindex="0"
      >
        {#if node.expanded}
          <IconChevronDown size={14} />
        {:else}
          <IconChevronRight size={14} />
        {/if}
        <IconFolder size={14} />
        {node.name}
      </div>

      {#if node.expanded && node.children}
        <svelte:self nodes={node.children} {ontogglefolder} {ontogglebookmark} {onselectfile} {bookmarkedPaths} />
      {/if}
    {:else}
      <div
        class="dk-file"
        onclick={() => onselectfile(node)}
        role="button"
        tabindex="0"
      >
        <IconFileText size={14} />
        <span>{node.name}</span>
        <span
          class="star {bookmarkedPaths.has(node.path) ? 'on' : ''}"
          onclick={(e: MouseEvent) => { e.stopPropagation(); ontogglebookmark(node) }}
          role="button"
          tabindex="0"
        >
          {#if bookmarkedPaths.has(node.path)}
            <IconStarFilled size={13} />
          {:else}
            <IconStar size={13} />
          {/if}
        </span>
      </div>
    {/if}
  {/each}
</div>
