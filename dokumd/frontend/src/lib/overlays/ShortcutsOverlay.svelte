<script lang="ts">
  import { IconX } from '@tabler/icons-svelte'

  // Overlay that lists all keyboard shortcuts organised by category.
  // show — controls visibility; modifier — platform key (CTRL or ⌘); onclose — called when dimissed.
  let { show, modifier = 'CTRL', onclose }: { show: boolean; modifier?: string; onclose: () => void } = $props()
</script>

{#if show}
  <div class="dk-overlay" onclick={onclose} role="dialog">
    <div class="dk-shortcuts-box" onclick={(e: MouseEvent) => e.stopPropagation()}>
      <div class="dk-shortcuts-title">
        Keyboard Shortcuts
        <button onclick={onclose}><IconX size={16} /></button>
      </div>

      <div class="dk-shortcuts-group">
        <div class="dk-shortcuts-group-title">Navigation</div>
        <div class="dk-shortcut-row"><span>Open project</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>O</kbd></span></div>
        <div class="dk-shortcut-row"><span>Search</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>K</kbd></span></div>
        <div class="dk-shortcut-row"><span>Close tab</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>W</kbd></span></div>
        <div class="dk-shortcut-row"><span>Next tab</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>TAB</kbd></span></div>
        <div class="dk-shortcut-row"><span>Previous tab</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>SHIFT</kbd><kbd>TAB</kbd></span></div>
        <div class="dk-shortcut-row"><span>Reopen last closed tab</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>SHIFT</kbd><kbd>T</kbd></span></div>
      </div>

      <div class="dk-shortcuts-group">
        <div class="dk-shortcuts-group-title">Bookmarks</div>
        <div class="dk-shortcut-row"><span>Toggle bookmark</span><span class="dk-shortcut-keys"><kbd>{modifier}</kbd><kbd>D</kbd></span></div>
      </div>

      <div class="dk-shortcuts-group">
        <div class="dk-shortcuts-group-title">General</div>
        <div class="dk-shortcut-row"><span>Keyboard shortcuts</span><span class="dk-shortcut-keys"><kbd>?</kbd></span></div>
        <div class="dk-shortcut-row"><span>Close overlay</span><span class="dk-shortcut-keys"><kbd>ESC</kbd></span></div>
      </div>
    </div>
  </div>
{/if}
