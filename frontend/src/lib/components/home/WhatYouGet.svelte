<script lang="ts">
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import {
    MapPin,
    BrainCircuit,
    TrendingUp,
    Users,
    Shield,
    Map as MapIcon,
  } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import HoverCard from '$lib/components/ui/HoverCard.svelte';
  import Tabs, { type TabItem } from '$lib/components/ui/Tabs.svelte';
  import { reveal, prefersReducedMotion } from '$lib/actions/reveal';

  const tabs: TabItem[] = [
    { id: 'score', label: 'Score' },
    { id: 'readout', label: 'Strategic Readout' },
    { id: 'demand', label: 'Demand' },
    { id: 'map', label: 'Map' },
  ];

  let activeTab: string = 'score';
  let panelEl: HTMLDivElement;
  const score = tweened(0, { duration: 1100, easing: cubicOut });

  onMount(() => {
    if (typeof IntersectionObserver === 'undefined' || !panelEl) {
      score.set(84);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!prefersReducedMotion()) {
              score.set(84);
            } else {
              score.set(84, { duration: 0 });
            }
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(panelEl);
    return () => obs.disconnect();
  });

  const features = [
    {
      Icon: MapPin,
      title: 'Investment Viability Score',
      desc: 'A single 0–100 score that captures fit, demand, and risk in one number.',
      tab: 'score',
    },
    {
      Icon: BrainCircuit,
      title: 'AI Strategic Readout',
      desc: 'A short narrative explaining what the data actually means for your concept.',
      tab: 'readout',
    },
    {
      Icon: TrendingUp,
      title: 'Demand History + Outlook',
      desc: 'Search-trend baselines and forward-looking projection for your category.',
      tab: 'demand',
    },
    {
      Icon: Users,
      title: 'Demographic Fit Analysis',
      desc: 'Income, age, density and lifestyle alignment with your target customer.',
      tab: 'map',
    },
    {
      Icon: Shield,
      title: 'Risk + Advantage breakdown',
      desc: 'Plain-English flags on what could go wrong — and where you have an edge.',
      tab: 'readout',
    },
  ];

  function activate(tab: string) {
    activeTab = tab;
  }

  // Tiny synthetic demand series for the chart preview
  const demandPoints = [22, 28, 34, 31, 40, 48, 55, 52, 63, 70, 76, 84];
  const demandPath = (() => {
    const w = 280;
    const h = 80;
    const max = Math.max(...demandPoints);
    const min = Math.min(...demandPoints);
    const stepX = w / (demandPoints.length - 1);
    return demandPoints
      .map((v, i) => {
        const x = (i * stepX).toFixed(1);
        const y = (h - ((v - min) / (max - min)) * h).toFixed(1);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  })();
  const demandFillPath = `${demandPath} L 280 80 L 0 80 Z`;
</script>

<section
  class="home-section py-24"
  use:reveal
  aria-labelledby="what-you-get-heading"
>
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="grid gap-12 lg:grid-cols-[55%_45%] lg:gap-12">
      <!-- LEFT: tabbed preview -->
      <div
        bind:this={panelEl}
        use:reveal
        class="reveal-init from-left order-2 lg:order-1"
      >
        <div
          class="rounded-3xl border border-[var(--border-soft)] glass p-5 shadow-[0_30px_80px_-30px_rgba(2,6,23,0.6)]"
        >
          <Tabs items={tabs} bind:value={activeTab} />

          <div class="mt-5">
            {#if activeTab === 'score'}
              <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
                <div
                  class="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/50 p-6"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Viability Score
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
                    >
                      Strong fit
                    </span>
                  </div>
                  <div class="mt-4 flex items-end gap-3">
                    <span
                      class="font-display text-7xl font-bold leading-none tracking-tight text-text-primary"
                    >
                      {Math.round($score)}
                    </span>
                    <span class="pb-2 text-base font-medium text-text-secondary">
                      / 100
                    </span>
                  </div>
                  <div
                    class="mt-5 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]/80"
                  >
                    <div
                      class="h-full rounded-full transition-[width] duration-700"
                      style="width: {Math.round($score)}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));"
                    ></div>
                  </div>
                  <div class="mt-6 grid grid-cols-3 gap-3">
                    {#each [{ l: 'Demand', v: 'High' }, { l: 'Competition', v: 'Low' }, { l: 'Confidence', v: '92%' }] as cell}
                      <div
                        class="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)]/50 p-3"
                      >
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                          {cell.l}
                        </p>
                        <p class="mt-1 font-display text-lg font-semibold text-text-primary">
                          {cell.v}
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {:else if activeTab === 'readout'}
              <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
                <div
                  class="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/50 p-6"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="grid h-7 w-7 place-items-center rounded-md border border-accent-purple/30 bg-accent-purple/12 text-accent-purple"
                    >
                      <BrainCircuit class="h-4 w-4" />
                    </span>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      AI Strategic Readout
                    </span>
                  </div>
                  <p class="mt-4 text-[15px] leading-[1.7] text-text-primary/95">
                    This corner sits inside a <span class="text-accent-cyan">transit-anchored</span>
                    catchment with <span class="text-accent-cyan">rising</span> coffee-shop search
                    intent and a household income profile aligned with specialty operators.
                    Direct competition is sparse within the 8-minute walk shed; the
                    closest comparable concept is <span class="text-text-primary">0.4 mi</span> away
                    with weekend-only foot traffic, leaving a clear weekday gap.
                  </p>
                  <div class="mt-5 flex flex-wrap gap-2">
                    {#each ['Underserved AM commuter flow', 'Premium income trail', 'Low review-saturation'] as tag}
                      <span
                        class="rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-medium text-accent-cyan"
                      >
                        {tag}
                      </span>
                    {/each}
                  </div>
                </div>
              </div>
            {:else if activeTab === 'demand'}
              <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
                <div
                  class="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/50 p-6"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Demand · 12-month
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
                    >
                      <TrendingUp class="h-3 w-3" /> +18% YoY
                    </span>
                  </div>
                  <div class="mt-4">
                    <svg
                      viewBox="0 0 280 80"
                      class="h-32 w-full"
                      aria-hidden="true"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.35" />
                          <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0" />
                        </linearGradient>
                        <linearGradient id="demandStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stop-color="var(--accent-cyan)" />
                          <stop offset="100%" stop-color="var(--accent-blue)" />
                        </linearGradient>
                      </defs>
                      <path d={demandFillPath} fill="url(#demandFill)" />
                      <path
                        d={demandPath}
                        fill="none"
                        stroke="url(#demandStroke)"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="mt-4 grid grid-cols-3 gap-3 text-center">
                    {#each [{ l: 'Baseline', v: '52' }, { l: 'Peak', v: '84' }, { l: 'Outlook', v: '+9%' }] as cell}
                      <div
                        class="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)]/50 p-3"
                      >
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                          {cell.l}
                        </p>
                        <p class="mt-0.5 font-display text-lg font-semibold text-text-primary">
                          {cell.v}
                        </p>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {:else if activeTab === 'map'}
              <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
                <div
                  class="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/50 p-5"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Catchment · 8-min walk
                    </span>
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface)]/60 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
                    >
                      <MapIcon class="h-3 w-3" /> 12,400 residents
                    </span>
                  </div>

                  <div
                    class="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]"
                  >
                    <div
                      class="absolute inset-0 opacity-40"
                      style="background-image: linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px); background-size: 28px 28px;"
                    ></div>
                    <div class="absolute inset-0 opacity-50">
                      <div class="absolute left-0 top-[28%] h-[2px] w-full -rotate-3 bg-text-muted/40"></div>
                      <div class="absolute left-0 top-[64%] h-[2px] w-full rotate-2 bg-text-muted/40"></div>
                      <div class="absolute left-[34%] top-0 h-full w-[2px] rotate-3 bg-text-muted/40"></div>
                      <div class="absolute left-[68%] top-0 h-full w-[2px] -rotate-6 bg-text-muted/40"></div>
                    </div>
                    <div
                      class="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-cyan/30"
                      style="background: radial-gradient(closest-side, rgba(34,211,238,0.18), transparent 70%);"
                    ></div>
                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div class="relative">
                        <span
                          class="absolute inset-0 -m-2 animate-ping rounded-full bg-accent-cyan/40"
                        ></span>
                        <span
                          class="relative grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--bg-base)] bg-accent-cyan text-[10px] font-bold text-slate-950 shadow-lg"
                          >P</span
                        >
                      </div>
                    </div>
                    {#each [{ x: 22, y: 30, c: 'var(--positive)' }, { x: 70, y: 40, c: 'var(--positive)' }, { x: 38, y: 70, c: 'var(--danger)' }, { x: 78, y: 66, c: 'var(--danger)' }] as p}
                      <div
                        class="absolute"
                        style="left: {p.x}%; top: {p.y}%; transform: translate(-50%, -50%);"
                      >
                        <span
                          class="block h-3 w-3 rounded-full border-2 border-[var(--bg-base)]"
                          style="background: {p.c};"
                        ></span>
                      </div>
                    {/each}
                  </div>

                  <div class="mt-3 flex items-center gap-4 text-[12px] text-text-secondary">
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-positive"></span>
                      Complementary POI
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <span class="h-2 w-2 rounded-full bg-danger"></span>
                      Direct competition
                    </span>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- RIGHT: feature list -->
      <div class="order-1 flex flex-col items-start lg:order-2">
        <Badge variant="outline">What you get</Badge>
        <h2
          id="what-you-get-heading"
          class="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl"
        >
          One address. <span class="shimmer-text">One clear decision.</span>
        </h2>
        <p class="mt-4 max-w-md text-base text-text-secondary md:text-lg">
          Hover any feature to preview the part of the report it powers. Every
          GeoScore report ships with all of these — no add-ons, no upsells.
        </p>

        <div class="mt-8 flex flex-col gap-2">
          {#each features as f, i}
            <div class="reveal-init" data-reveal-child>
              <HoverCard
                active={activeTab === f.tab}
                on:enter={() => activate(f.tab)}
              >
                <span
                  class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan"
                >
                  <svelte:component this={f.Icon} class="h-5 w-5" />
                </span>
                <span class="flex-1">
                  <span class="block text-[15px] font-semibold text-text-primary">
                    {f.title}
                  </span>
                  <span class="mt-0.5 block text-[13.5px] leading-[1.55] text-text-secondary">
                    {f.desc}
                  </span>
                </span>
                <span
                  class="mt-1 hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted lg:block {activeTab === f.tab ? 'text-accent-cyan' : ''}"
                >
                  {activeTab === f.tab ? 'Showing' : 'Hover'}
                </span>
              </HoverCard>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
