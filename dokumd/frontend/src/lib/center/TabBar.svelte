<script lang="ts">
  import { IconX, IconChevronDown, IconFileText } from '@tabler/icons-svelte'
  import type { Tab } from '../types.js'

  let {
    tabs,
    onactivetab,
    onclosetab,
  }: {
    tabs: Tab[]
    onactivetab: (id: string) => void
    onclosetab: (id: string) => void
  } = $props()

  let barEl: HTMLDivElement | undefined = $state()
  let overflowOpen = $state(false)
  let containerWidth = $state(800)

  // Measure container width on resize.
  $effect(() => {
    if (!barEl) return
    const parent = barEl.parentElement
    if (!parent) return
    const ro = new ResizeObserver((entries) => {
      containerWidth = entries[0].contentRect.width
    })
    ro.observe(parent)
    return () => ro.disconnect()
  })

  // Available width for tabs: subtract space for the overflow button.
  let availableWidth = $derived(containerWidth - 30)

  // Maximum number of tabs that fit at 150px each.
  let maxFit = $derived(Math.max(1, Math.floor(availableWidth / 150)))

  // How many tabs to show in the bar.
  let slots = $derived.by(() => {
    if (tabs.length <= maxFit) return tabs.length
    // Reserve one slot for the chevron.
    return Math.max(1, maxFit - 1)
  })

  // Which tabs are visible (always keep active tab visible).
  let visibleTabs = $derived.by(() => {
    if (tabs.length <= slots) return tabs
    const activeIdx = tabs.findIndex(t => t.active)
    let start = 0
    if (activeIdx >= slots) {
      start = activeIdx - slots + 1
    }
    return tabs.slice(start, start + slots)
  })

  let overflowTabs = $derived(tabs.filter(t => !visibleTabs.includes(t)))
  let showOverflow = $derived(overflowTabs.length > 0)
</script>

<div class="dk-tabs" bind:this={barEl}>
  <div class="dk-tabs-scroll">
    {#each visibleTabs as tab (tab.id)}
      <div
        class="dk-tab {tab.active ? 'active' : ''}"
        onclick={() => onactivetab(tab.id)}
        role="tab"
        tabindex="0"
        title={tab.path}
        style="width: calc(100% / {slots})"
      >
        <IconFileText size={14} />
        <span class="tab-label">{tab.name}</span>
        <span class="close" onclick={(e: MouseEvent) => { e.stopPropagation(); onclosetab(tab.id) }} role="button" tabindex="0">
          <IconX size={12} />
        </span>
      </div>
    {/each}
  </div>
  {#if showOverflow}
    <div
      class="dk-tabs-overflow"
      onclick={() => overflowOpen = !overflowOpen}
      role="button"
      tabindex="0"
    >
      <IconChevronDown size={16} />
    </div>
  {/if}
</div>

{#if overflowOpen}
  <div class="dk-overflow-dropdown open">
    {#each overflowTabs as tab}
      <div class="dk-overflow-item" title={tab.path} onclick={() => { onactivetab(tab.id); overflowOpen = false }} role="button" tabindex="0">
        <IconFileText size={15} />
        <span>{tab.name}</span>
      </div>
    {/each}
  </div>
{/if}
