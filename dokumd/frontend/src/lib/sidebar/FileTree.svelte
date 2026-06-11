<script lang="ts">
  import { IconChevronDown, IconChevronUp, IconFolder, IconFileText, IconStar, IconStarFilled } from '@tabler/icons-svelte'
  import type { FileNode } from '../types.js'

  // Renders a tree of folders and files. Each file row includes a clickable
  // star icon (bookmark toggle) visible on hover and always visible if bookmarked.
  let { nodes, ontogglefolder, ontogglebookmark, onselectfile }: {
    nodes: FileNode[]
    ontogglefolder: (node: FileNode) => void
    ontogglebookmark: (node: FileNode) => void
    onselectfile: (node: FileNode) => void
  } = $props()
</script>

<div class="dk-tree">
  {#each nodes as node}
    <div
      class="dk-folder"
      onclick={() => ontogglefolder(node)}
      role="button"
      tabindex="0"
    >
      {#if node.expanded}
        <IconChevronDown size={14} />
      {:else}
        <IconChevronUp size={14} />
      {/if}
      <IconFolder size={14} />
      {node.name}
    </div>

    {#if node.expanded && node.children}
      {#each node.children as file}
        <div
          class="dk-file"
          onclick={() => onselectfile(file)}
          role="button"
          tabindex="0"
        >
          <IconFileText size={14} />
          <span>{file.name}</span>
          <span
            class="star {file.bookmarked ? 'on' : ''}"
            onclick={(e: MouseEvent) => { e.stopPropagation(); ontogglebookmark(file) }}
            role="button"
            tabindex="0"
          >
            {#if file.bookmarked}
              <IconStarFilled size={13} />
            {:else}
              <IconStar size={13} />
            {/if}
          </span>
        </div>
      {/each}
    {/if}
  {/each}
</div>
