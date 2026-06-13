<script lang="ts">
  import { IconChevronUp, IconChevronDown, IconX } from '@tabler/icons-svelte'

  // Barra de pesquisa local no documento (CTRL+F).
  // O input ocupa toda a largura do DocumentView.
  let { query, onquery, onclose, onnavigate, matchCount, currentIndex, inputEl = $bindable() }: {
    query: string
    onquery: (q: string) => void
    onclose: () => void
    onnavigate: (dir: 'prev' | 'next') => void
    matchCount: number
    currentIndex: number
    inputEl?: HTMLInputElement
  } = $props()
</script>

<div class="dk-local-search">
  <input
    type="text"
    placeholder="Find in document..."
    value={query}
    oninput={(e) => onquery((e.target as HTMLInputElement).value)}
    onkeydown={(e) => { if (e.key === 'Escape') onclose() }}
    bind:this={inputEl}
  />
  <button class="ls-btn" onclick={() => onnavigate('prev')} title="Previous match">
    <IconChevronUp size={16} />
  </button>
  <button class="ls-btn" onclick={() => onnavigate('next')} title="Next match">
    <IconChevronDown size={16} />
  </button>
  <span class="ls-count">{currentIndex}/{matchCount}</span>
  <button class="ls-btn" onclick={onclose} title="Close">
    <IconX size={16} />
  </button>
</div>
