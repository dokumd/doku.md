<script lang="ts">
  import { IconStarFilled } from '@tabler/icons-svelte'
  import LocalSearch from './LocalSearch.svelte'
  import { tick } from 'svelte'

  let { title = '', path = '', bookmarked = false, onbookmark, children, showLocalSearch = false, localSearchQuery = '', onlocalSearchQuery, oncloseLocalSearch }: {
    title?: string
    path?: string
    bookmarked?: boolean
    onbookmark?: () => void
    children?: import('svelte').Snippet
    showLocalSearch?: boolean
    localSearchQuery?: string
    onlocalSearchQuery?: (q: string) => void
    oncloseLocalSearch?: () => void
  } = $props()

  let containerEl: HTMLDivElement | undefined = $state()
  let marks: HTMLElement[] = []
  let currentIndex = $state(0)
  let matchCount = $state(0)
  let searchInputEl: HTMLInputElement | undefined = $state()

  // Quando showLocalSearch abre, espera o DOM montar o LocalSearch (tick)
  // e faz focus + select no input. O bind:this é resolvido após a montagem,
  // por isso o tick garante que searchInputEl já está preenchido.
  // Quando fecha (showLocalSearch = false), limpa os marks do documento.
  $effect(() => {
    if (showLocalSearch) {
      tick().then(() => {
        searchInputEl?.focus()
        searchInputEl?.select()
      })
    } else {
      clearMarks()
    }
  })

  function doSearch(query: string) {
    // Guardar query antes de limpar.
    onlocalSearchQuery?.(query)
    clearMarks()
    marks = []
    matchCount = 0
    currentIndex = 0

    if (!query.trim() || !containerEl) return

    const lowerQuery = query.toLowerCase()

    const walker = document.createTreeWalker(
      containerEl,
      NodeFilter.SHOW_TEXT,
      null,
    )

    const textNodes: Text[] = []
    let node: Text | null
    while ((node = walker.nextNode() as Text | null)) {
      textNodes.push(node)
    }

    // Primeiro, encontra todas as posições de match.
    const matches: { node: Text; offset: number }[] = []
    for (const tn of textNodes) {
      const text = tn.textContent ?? ''
      const lower = text.toLowerCase()
      let pos = lower.indexOf(lowerQuery)
      while (pos !== -1) {
        matches.push({ node: tn, offset: pos })
        pos = lower.indexOf(lowerQuery, pos + 1)
      }
    }

    if (matches.length === 0) return

    // Envolve cada match num <mark>. Processa do fim para o início para
    // não invalidar os offsets dos matches seguintes.
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i]
      const range = document.createRange()
      range.setStart(m.node, m.offset)
      range.setEnd(m.node, m.offset + query.length)
      const mark = document.createElement('mark')
      try {
        range.surroundContents(mark)
        marks.unshift(mark) // manter ordem original
      } catch {
        // Ignorar se falhar (ex: conteúdo que cruza elementos).
      }
    }

    matchCount = marks.length
    if (marks.length > 0) {
      marks[0].classList.add('mark-active')
      currentIndex = 1
    }
  }

  function navigate(dir: 'prev' | 'next') {
    if (marks.length === 0) return

    const active = marks[currentIndex - 1]
    if (active) active.classList.remove('mark-active')

    if (dir === 'next') {
      currentIndex = currentIndex >= marks.length ? 1 : currentIndex + 1
    } else {
      currentIndex = currentIndex <= 1 ? marks.length : currentIndex - 1
    }

    const next = marks[currentIndex - 1]
    if (next) {
      next.classList.add('mark-active')
      next.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  function clearMarks() {
    if (!containerEl) return
    const existing = containerEl.querySelectorAll('mark')
    for (const m of existing) {
      const parent = m.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m)
        parent.normalize()
      }
    }
    marks = []
    currentIndex = 0
    matchCount = 0
  }

  function handleClose() {
    onlocalSearchQuery?.(localSearchQuery)
    oncloseLocalSearch?.()
  }
</script>

<div class="dk-doc" bind:this={containerEl}>
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

  {#if showLocalSearch}
    <LocalSearch
      query={localSearchQuery}
      onquery={doSearch}
      onclose={handleClose}
      onnavigate={navigate}
      {matchCount}
      {currentIndex}
      bind:inputEl={searchInputEl}
    />
  {/if}
</div>

