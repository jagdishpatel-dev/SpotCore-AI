<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { createEventDispatcher } from 'svelte';

  export let active = false;
  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    enter: void;
    leave: void;
    activate: void;
  }>();

  function onEnter() {
    dispatch('enter');
    dispatch('activate');
  }
  function onLeave() {
    dispatch('leave');
  }
</script>

<button
  type="button"
  class={cn(
    'group relative flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200',
    active
      ? 'border-accent-cyan/40 bg-[var(--bg-surface)] shadow-[0_18px_60px_-30px_rgba(34,211,238,0.32)]'
      : 'border-transparent hover:border-[var(--border-soft)] hover:bg-[var(--bg-surface)]/60',
    className
  )}
  on:mouseenter={onEnter}
  on:focus={onEnter}
  on:mouseleave={onLeave}
  on:blur={onLeave}
>
  <slot />
</button>
