<script lang="ts">
  import { IconMinus, IconSquare, IconX } from '@tabler/icons-svelte'
  import { Minimise, Maximise, Close } from '../../../bindings/dokumd/internal/services/windowservice.js'

  // Titlebar is the top bar of the app. It contains the brand, action buttons,
  // and platform-specific window controls (minimise, maximise, close).
  // Props are event callbacks — the parent controls what each button does.
  let {
    onsearch,    // Called when the user clicks Search / Ctrl+K
    onbrowse,    // Called when the user clicks Browse / Ctrl+O
    onshortcuts, // Called when the user clicks the ? button
  }: {
    onsearch: () => void
    onbrowse: () => void
    onshortcuts: () => void
  } = $props()
</script>

<div class="dk-titlebar">
  <div class="dk-brand">
    <div class="dk-logo">
      <img src="/logo.svg" alt="doku.md" style="width:13px;height:13px" />
    </div>
    <span class="dk-name">doku<span class="ext">.md</span></span>
  </div>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="dk-titlebarcenter" style="--wails-draggable: drag" ondblclick={Maximise}></div>
  <div class="dk-titlebar-actions">
    <button class="dk-btn" onclick={onsearch}>
      <span>Search</span> <kbd>CTRL+K</kbd>
    </button>
    <button class="dk-btn" onclick={onbrowse}>
      <span>Browse</span> <kbd>CTRL+O</kbd>
    </button>
  </div>

  <button class="dk-btn" style="padding: 5px 10px" onclick={onshortcuts}>
    <span>?</span>
  </button>

  <div class="dk-dots">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dk-dot" onclick={Minimise}><IconMinus size={11} /></div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dk-dot" onclick={Maximise}><IconSquare size={11} /></div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dk-dot" onclick={Close}><IconX size={11} /></div>
  </div>
</div>
