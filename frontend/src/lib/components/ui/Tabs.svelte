<script lang="ts" context="module">
  export interface TabItem {
    id: string;
    label: string;
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let items: TabItem[] = [];
  export let value: string = items[0]?.id ?? '';
  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher<{ change: string }>();

  function selectTab(id: string) {
    if (id === value) return;
    value = id;
    dispatch('change', id);
  }
</script>

<div class={cn('w-full', className)}>
  <div
    role="tablist"
    class="inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/70 p-1 backdrop-blur-sm"
  >
    {#each items as tab}
      <button
        role="tab"
        type="button"
        aria-selected={value === tab.id}
        class={cn(
          'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          value === tab.id
            ? 'text-slate-950 dark:text-slate-950'
            : 'text-text-secondary hover:text-text-primary'
        )}
        on:click={() => selectTab(tab.id)}
      >
        {#if value === tab.id}
          <span
            class="absolute inset-0 -z-10 rounded-full bg-accent-cyan shadow-[0_8px_28px_-12px_rgba(34,211,238,0.7)]"
            transition:fade={{ duration: 180 }}
          ></span>
        {/if}
        {tab.label}
      </button>
    {/each}
  </div>

  {#if $$slots.default}
    <div class="mt-5">
      <slot />
    </div>
  {/if}
</div>
