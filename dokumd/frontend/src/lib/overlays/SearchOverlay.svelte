<script lang="ts">
  import { SearchAll } from '../../../bindings/changeme/internal/services/folderservice.js'

  let { show, onclose, onselect, projectPath }: {
    show: boolean
    onclose: () => void
    onselect: (result: any) => void
    projectPath: string | null
  } = $props()

  let query = $state('')
  let results = $state<any[]>([])
  let selectedIndex = $state(0)
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let inputEl: HTMLInputElement | undefined = $state()

  // When the overlay opens, focus the input and select its content
  // so the user can start typing immediately or replace the previous query.
  $effect(() => {
    if (show && inputEl) {
      inputEl.focus()
      inputEl.select()
    }
  })

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    query = target.value
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doSearch(query), 300)
  }

  async function doSearch(q: string) {
    if (!q.trim() || !projectPath) {
      results = []
      selectedIndex = 0
      return
    }
    const r = await SearchAll(projectPath, q, 50)
    results = r
    selectedIndex = 0
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      onselect(results[selectedIndex])
    }
  }

  function reset() {
    query = ''
    results = []
    selectedIndex = 0
  }
</script>

{#if show}
  <div class="dk-overlay" onclick={onclose} role="dialog">
    <div class="dk-cmd-box" onclick={(e: MouseEvent) => e.stopPropagation()}>
      <div class="dk-cmd-input">
        <input
          type="text"
          placeholder="Search documentation..."
          value={query}
          oninput={handleInput}
          onkeydown={handleKeydown}
          bind:this={inputEl}
        />
      </div>
      <div class="dk-cmd-results">
        {#if results.length > 0}
          {#each results as result, i}
            <div
              class="dk-cmd-r {i === selectedIndex ? 'selected' : ''}"
              onclick={() => onselect(result)}
              role="button"
              tabindex="0"
            >
              <span>{result.title || result.relPath}</span>
              <span class="path">{result.relPath}</span>
            </div>
          {/each}
        {:else if query && projectPath}
          <div class="dk-cmd-r"><span class="muted">No results for "{query}"</span></div>
        {:else if !projectPath}
          <div class="dk-cmd-r"><span class="muted">Open a folder to search.</span></div>
        {:else}
          <div class="dk-cmd-r"><span class="muted">Type to search documentation...</span></div>
        {/if}
      </div>
      <div class="dk-cmd-footer">
        <div class="dk-cmd-hint"><kbd>↵</kbd> open</div>
        <div class="dk-cmd-hint"><kbd>↑↓</kbd> navigate</div>
        <div class="dk-cmd-hint"><kbd>esc</kbd> close</div>
      </div>
    </div>
  </div>
{/if}
