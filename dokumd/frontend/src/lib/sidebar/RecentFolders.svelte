<script lang="ts">
  import { IconFolderOpen } from '@tabler/icons-svelte'

  let { items, onselect }: {
    items: { path: string; lastOpened: string }[]
    onselect: (path: string) => void
  } = $props()
</script>

<div class="dk-folder-list">
  {#each items as item}
    <div class="dk-folder-item" onclick={() => onselect(item.path)} role="button" tabindex="0" title={item.path}>
      <IconFolderOpen size={14} style="flex-shrink: 0;" />
      <span class="path-text">{item.path}</span>
    </div>
  {/each}
</div>

<style>
  .dk-folder-list {
    padding: 4px 0;
  }
  .dk-folder-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--text-2, #aaa);
    cursor: pointer;
    border-radius: 6px;
    white-space: nowrap;
    overflow: hidden;
  }
  .dk-folder-item:hover {
    background: var(--accent-bg, rgba(59, 130, 246, 0.1));
    color: var(--text-1, #eee);
  }
  .path-text {
    overflow: hidden;
    text-overflow: ellipsis;
    direction: rtl;
    text-align: left;
  }
</style>
