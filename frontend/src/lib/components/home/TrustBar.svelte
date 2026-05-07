<script lang="ts">
  import { Building2, Layers, BrainCircuit, Zap } from 'lucide-svelte';
  import { reveal } from '$lib/actions/reveal';

  const items = [
    { Icon: Building2, label: 'Built for operators & expansion teams' },
    { Icon: Layers, label: 'Mobility, market, and demographic signals' },
    { Icon: BrainCircuit, label: 'Strategic AI readouts beyond raw scores' },
    { Icon: Zap, label: 'Decision-ready analysis in minutes' },
  ];
</script>

<section
  class="home-section relative border-y border-[var(--border-soft)] bg-[var(--bg-surface)]/40"
  use:reveal={{ childStagger: 80 }}
  aria-label="Trust signals"
>
  <div
    class="mx-auto grid max-w-7xl grid-cols-2 items-stretch divide-[var(--border-soft)] px-6 py-6 md:grid-cols-4 md:divide-x md:py-5 lg:px-10"
  >
    {#each items as item, i}
      <div
        class="reveal-init flex items-center justify-center gap-2.5 px-2 py-3 md:px-6"
        data-reveal-child
      >
        <span
          class="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan"
        >
          <svelte:component this={item.Icon} class="h-4 w-4" />
        </span>
        <span class="text-[13px] font-medium leading-tight text-text-secondary">
          {item.label}
        </span>
      </div>
    {/each}
  </div>
</section>
