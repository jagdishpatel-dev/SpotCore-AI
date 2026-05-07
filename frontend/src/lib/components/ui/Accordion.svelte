<script lang="ts" context="module">
  export interface AccordionItem {
    id: string;
    question: string;
    answer: string;
  }
</script>

<script lang="ts">
  import { slide } from 'svelte/transition';
  import { ChevronDown } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';

  export let items: AccordionItem[] = [];
  let className = '';
  export { className as class };

  let open: string | null = null;

  function toggle(id: string) {
    open = open === id ? null : id;
  }
</script>

<div class={cn('flex flex-col divide-y divide-[var(--border-soft)]', className)}>
  {#each items as item (item.id)}
    {@const isOpen = open === item.id}
    <div
      class={cn(
        'transition-all duration-200',
        isOpen ? 'border-l-2 border-l-accent-cyan/70 pl-5' : 'border-l-2 border-l-transparent pl-5'
      )}
    >
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
        on:click={() => toggle(item.id)}
      >
        <span class="text-base font-semibold text-text-primary">
          {item.question}
        </span>
        <span
          class="grid h-8 w-8 place-items-center rounded-full border border-[var(--border-soft)] text-text-secondary transition-transform"
          style={isOpen ? 'transform: rotate(180deg)' : ''}
        >
          <ChevronDown class="h-4 w-4" />
        </span>
      </button>
      {#if isOpen}
        <div
          transition:slide={{ duration: 220 }}
          class="pb-5 pr-12 text-[15px] leading-relaxed text-text-secondary"
        >
          {item.answer}
        </div>
      {/if}
    </div>
  {/each}
</div>
