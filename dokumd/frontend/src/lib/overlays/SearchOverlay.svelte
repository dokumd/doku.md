<script lang="ts">
  // Full-text search overlay. Opens when the user clicks Search or presses Ctrl+K/⌘K.
  // show — controls visibility; onclose — called when the overlay is dimissed.
  let { show, onclose }: { show: boolean; onclose: () => void } = $props()
</script>

{#if show}
  <div class="dk-overlay" onclick={onclose} role="dialog">
    <div class="dk-cmd-box" onclick={(e: MouseEvent) => e.stopPropagation()}>
      <div class="dk-cmd-input">
        <span>FTS5 full-text search<span class="cursor"></span></span>
      </div>
      <div class="dk-cmd-results">
        <div class="dk-cmd-r selected">
          <span>FTS5 indexing strategy</span>
          <span class="path">specs/plan.md</span>
        </div>
        <div class="dk-cmd-r">
          <span>SQLite FTS5 schema design</span>
          <span class="path">docs/architecture.md</span>
        </div>
        <div class="dk-cmd-r">
          <span>Search performance goals</span>
          <span class="path">specs/spec.md</span>
        </div>
        <div class="dk-cmd-r">
          <span>pkg/search/search.go contract</span>
          <span class="path">contracts/indexer.md</span>
        </div>
      </div>
      <div class="dk-cmd-footer">
        <div class="dk-cmd-hint"><kbd>↵</kbd> open</div>
        <div class="dk-cmd-hint"><kbd>↑↓</kbd> navigate</div>
        <div class="dk-cmd-hint"><kbd>esc</kbd> close</div>
      </div>
    </div>
  </div>
{/if}
