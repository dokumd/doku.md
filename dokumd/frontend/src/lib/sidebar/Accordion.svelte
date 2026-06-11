<script lang="ts">
  import { IconChevronUp, IconChevronDown } from '@tabler/icons-svelte'

  // Reusable accordion component. Renders a list of expandable/collapsible sections.
  // Only one section can be open at a time. Each section renders its own content
  // via a Svelte snippet, enabling independent internal scrolling.
  interface Section {
    id: string
    title: string
    snippet: import('svelte').Snippet
  }

  let { sections, open, ontoggle }: {
    sections: Section[]
    open: string | null  // Currently open section ID, or null if none
    ontoggle: (id: string) => void
  } = $props()
</script>

{#each sections as section}
  <div
    class="dk-acc-header {open === section.id ? 'open' : ''}"
    onclick={() => ontoggle(section.id)}
    role="button"
    tabindex="0"
  >
    {section.title}
    {#if open === section.id}
      <IconChevronUp size={13} />
    {:else}
      <IconChevronDown size={13} />
    {/if}
  </div>

  {#if open === section.id}
    <div class="dk-acc-body open">
      {@render section.snippet()}
    </div>
  {/if}
{/each}
