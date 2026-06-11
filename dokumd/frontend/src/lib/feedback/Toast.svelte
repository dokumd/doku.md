<script lang="ts">
  import { IconCircleCheck, IconAlertTriangle, IconCircleX, IconX } from '@tabler/icons-svelte'

  // A single toast notification. The icon and colour vary by type.
  // type — controls the icon and visual style (success / warning / error)
  // message — the notification text
  // ondismiss — called when the user clicks the close button
  let { type, message, ondismiss }: {
    type: 'success' | 'warning' | 'error'
    message: string
    ondismiss: () => void
  } = $props()
</script>

<div class="dk-toast {type}">
  {#if type === 'success'}
    <IconCircleCheck size={16} class="toast-icon" />
  {:else if type === 'warning'}
    <IconAlertTriangle size={16} class="toast-icon" />
  {:else}
    <IconCircleX size={16} class="toast-icon" />
  {/if}
  <span>{message}</span>
  <button class="toast-close" onclick={ondismiss}><IconX size={14} /></button>
</div>
