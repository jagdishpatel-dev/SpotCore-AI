<script lang="ts" context="module">
  type ChipVariant = 'positive' | 'cyan' | 'muted';

  interface Chip {
    label: string;
    variant: ChipVariant;
    /** show the trending-up icon to the left of the label */
    trending?: boolean;
  }

  interface LocationState {
    region: string;
    score: number;
    verdict: string;
    descriptor: string;
    chips: Chip[];
    metrics: { demand: string; competition: string; income: string };
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import { TrendingUp } from 'lucide-svelte';
  import { prefersReducedMotion } from '$lib/actions/reveal';

  /** Time between location switches (ms). */
  const CYCLE_MS = 5200;
  /** Score count-up duration (ms). */
  const SCORE_MS = 1100;

  const states: LocationState[] = [
    {
      region: 'NYC · 11428',
      score: 84,
      verdict: 'Strong fit',
      descriptor: 'Transit node area',
      chips: [
        { label: 'Rising demand', variant: 'positive', trending: true },
        { label: 'High income', variant: 'cyan' },
        { label: 'Low saturation', variant: 'muted' },
      ],
      metrics: { demand: '+18%', competition: 'Low', income: '$92k' },
    },
    {
      region: 'Austin · 78704',
      score: 78,
      verdict: 'Good fit',
      descriptor: 'High growth corridor',
      chips: [
        { label: 'Strong foot traffic', variant: 'positive', trending: true },
        { label: 'Daytime crowd', variant: 'cyan' },
        { label: 'Med saturation', variant: 'muted' },
      ],
      metrics: { demand: '+11%', competition: 'Med', income: '$104k' },
    },
    {
      region: 'SF · 94110',
      score: 81,
      verdict: 'Strong fit',
      descriptor: 'Dense mixed-use block',
      chips: [
        { label: 'Premium income', variant: 'positive', trending: true },
        { label: 'Walkable', variant: 'cyan' },
        { label: 'Low saturation', variant: 'muted' },
      ],
      metrics: { demand: '+14%', competition: 'Low', income: '$118k' },
    },
  ];

  let active = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let reduced = false;
  let hovered = false;

  const score = tweened(0, { duration: SCORE_MS, easing: cubicOut });

  function start() {
    if (timer || reduced) return;
    timer = setInterval(() => {
      if (hovered) return;
      active = (active + 1) % states.length;
      score.set(states[active].score);
    }, CYCLE_MS);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function onVisibilityChange() {
    if (document.hidden) stop();
    else start();
  }

  onMount(() => {
    reduced = prefersReducedMotion();
    score.set(states[0].score, { duration: reduced ? 0 : SCORE_MS });
    if (!reduced) {
      start();
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
  });

  onDestroy(() => {
    stop();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  });

  $: current = states[active];

  const chipClass: Record<ChipVariant, string> = {
    positive: 'border-positive/25 bg-positive/10 text-positive',
    cyan: 'border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan',
    muted:
      'border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 text-text-secondary',
  };
</script>

<div class="relative">
  <!-- ambient glows -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-accent-cyan/10 blur-3xl"
  ></div>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute -bottom-12 right-0 h-48 w-48 rounded-full bg-accent-blue/10 blur-3xl"
  ></div>

  <div
    class="group/card animate-float-y relative w-[340px] rounded-2xl border border-[var(--border-soft)] glass p-5 shadow-[0_30px_80px_-30px_rgba(2,6,23,0.7)] transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent-cyan/35 hover:shadow-[0_36px_96px_-28px_rgba(34,211,238,0.32)]"
    role="group"
    aria-label="Live location preview"
    on:mouseenter={() => (hovered = true)}
    on:mouseleave={() => (hovered = false)}
  >
    <!-- Top row: live indicator + region -->
    <div class="flex items-center justify-between">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-secondary"
      >
        <span class="relative inline-flex h-1.5 w-1.5">
          <span
            class="absolute -inset-1 rounded-full bg-positive/30 opacity-70 animate-ping"
            aria-hidden="true"
          ></span>
          <span class="relative h-1.5 w-1.5 rounded-full bg-positive"></span>
        </span>
        Live preview
      </span>
      <span
        class="relative h-3 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted"
        aria-live="polite"
      >
        {#key active}
          <span
            class="block whitespace-nowrap"
            in:fly={{ y: -6, duration: 360, easing: cubicOut }}
            out:fade={{ duration: 140 }}
          >
            {current.region}
          </span>
        {/key}
      </span>
    </div>

    <!-- Score -->
    <div class="mt-5">
      <p
        class="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted"
      >
        Viability Score
      </p>
      <div class="mt-1.5 flex items-baseline gap-2">
        <span
          class="font-display text-5xl font-bold tabular-nums text-text-primary"
        >
          {Math.round($score)}
        </span>
        <span class="text-sm font-medium text-text-secondary">/ 100</span>
      </div>
      <div
        class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-2)]"
      >
        <div
          class="h-full rounded-full"
          style="width: {$score}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));"
        ></div>
      </div>
      <div class="relative mt-3 h-5 overflow-hidden">
        {#key active}
          <p
            class="absolute inset-x-0 top-0 text-sm font-medium text-text-primary"
            in:fly={{ y: 8, duration: 420, easing: cubicOut }}
            out:fade={{ duration: 140 }}
          >
            {current.verdict} <span class="text-text-secondary">— {current.descriptor}</span>
          </p>
        {/key}
      </div>
    </div>

    <!-- Insight chips -->
    <div class="relative mt-5 min-h-[28px]">
      {#key active}
        <div
          class="flex flex-wrap gap-1.5"
          in:fade={{ duration: 240, delay: 80 }}
          out:fade={{ duration: 120 }}
        >
          {#each current.chips as chip, i}
            <span
              class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold {chipClass[chip.variant]}"
              in:fly={{ y: 6, duration: 360, delay: 120 + i * 60, easing: cubicOut }}
            >
              {#if chip.trending}
                <TrendingUp class="h-3 w-3" />
              {/if}
              {chip.label}
            </span>
          {/each}
        </div>
      {/key}
    </div>

    <!-- Metric cells -->
    <div class="mt-5 grid grid-cols-3 gap-2">
      {#each [{ label: 'Demand', value: current.metrics.demand }, { label: 'Comp.', value: current.metrics.competition }, { label: 'Income', value: current.metrics.income }] as cell, i}
        <div
          class="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/40 p-2"
        >
          <p
            class="text-[9px] font-semibold uppercase tracking-[0.18em] text-text-muted"
          >
            {cell.label}
          </p>
          <div class="relative mt-0.5 h-5 overflow-hidden">
            {#key cell.value}
              <p
                class="absolute inset-x-0 top-0 font-display text-sm font-semibold tabular-nums text-text-primary"
                in:fly={{ y: 10, duration: 380, delay: 60 + i * 50, easing: cubicOut }}
                out:fade={{ duration: 120 }}
              >
                {cell.value}
              </p>
            {/key}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
