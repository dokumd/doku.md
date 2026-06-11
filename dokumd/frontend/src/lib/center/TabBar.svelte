<script lang="ts">
  import { IconX, IconChevronDown, IconChevronUp, IconFileText } from '@tabler/icons-svelte'
  import type { Tab } from '../types.js'

  // TabBar renders open document tabs with an overflow dropdown for when
  // tabs exceed the available width. The active tab is always visible in the bar.
  let {
    tabs,
    overflowTabs,
    onactivetab,
    onclosetab,
    ontoggleoverflow,
    overflowOpen,
  }: {
    tabs: Tab[]
    overflowTabs: Tab[]
    onactivetab: (id: string) => void
    onclosetab: (id: string) => void
    ontoggleoverflow: () => void
    overflowOpen: boolean
  } = $props()
</script>

<div class="dk-tabs">
  <div class="dk-tabs-scroll">
    {#each tabs as tab}
      <div
        class="dk-tab {tab.active ? 'active' : ''}"
        onclick={() => onactivetab(tab.id)}
        role="tab"
        tabindex="0"
      >
        <IconFileText size={14} />
        <span>{tab.name}</span>
        <span class="close" onclick={(e: MouseEvent) => { e.stopPropagation(); onclosetab(tab.id) }} role="button" tabindex="0">
          <IconX size={12} />
        </span>
      </div>
    {/each}
  </div>
  <div
    class="dk-tabs-overflow"
    onclick={ontoggleoverflow}
    role="button"
    tabindex="0"
  >
    {#if overflowOpen}
      <IconChevronUp size={16} />
    {:else}
      <IconChevronDown size={16} />
    {/if}
  </div>
</div>

{#if overflowOpen}
  <div class="dk-overflow-dropdown open">
    {#each overflowTabs as tab}
      <div class="dk-overflow-item" title={tab.path} role="button" tabindex="0">
        <IconFileText size={15} />
        <span>{tab.name}</span>
      </div>
    {/each}
  </div>
{/if}
