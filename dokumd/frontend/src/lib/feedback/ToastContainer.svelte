<script lang="ts">
  import Toast from './Toast.svelte'
  import type { Toast as ToastData } from '../types.js'

  // Manages a stack of toast notifications. Each toast auto-dismisses after 3 seconds.
  // Items are rendered bottom-right, newest on top, max 5 visible simultaneously.
  let { items, ondismiss }: {
    items: ToastData[]
    ondismiss: (id: string) => void
  } = $props()
</script>

<div class="dk-toasts">
  {#each items as item}
    <Toast type={item.type} message={item.message} ondismiss={() => ondismiss(item.id)} />
  {/each}
</div>
