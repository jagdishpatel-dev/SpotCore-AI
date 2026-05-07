<script lang="ts">
  import { fade } from 'svelte/transition';
  import { cn } from '$lib/utils/cn';

  export let content: string = '';
  export let side: 'top' | 'bottom' = 'top';
  let className = '';
  export { className as class };

  let open = false;

  function show() {
    open = true;
  }
  function hide() {
    open = false;
  }
</script>

<span
  class={cn('relative inline-flex', className)}
  role="presentation"
  on:mouseenter={show}
  on:mouseleave={hide}
  on:focusin={show}
  on:focusout={hide}
>
  <slot />
  {#if open && content}
    <span
      role="tooltip"
      class={cn(
        'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11px] font-medium text-text-primary shadow-lg',
        side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      )}
      transition:fade={{ duration: 120 }}
    >
      {content}
    </span>
  {/if}
</span>
