<script lang="ts">
  import { tweened, type Tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import {
    BrainCircuit,
    TrendingUp,
    Map as MapIcon,
    Users,
    Building2,
    Sparkles,
    ArrowRight,
  } from 'lucide-svelte';
  import { prefersReducedMotion } from '$lib/actions/reveal';
  import { phase, formState, demoDisplayAddress, type Phase } from '$lib/stores/demoFlow';

  type TabId =
    | 'score'
    | 'readout'
    | 'demand'
    | 'competition'
    | 'demographics'
    | 'map';

  interface Tab {
    id: TabId;
    label: string;
  }

  const tabs: Tab[] = [
    { id: 'score', label: 'Score' },
    { id: 'readout', label: 'Strategic Readout' },
    { id: 'demand', label: 'Demand' },
    { id: 'competition', label: 'Competition' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'map', label: 'Map' },
  ];

  let active: TabId = 'score';

  const FINAL_SCORE = 78;
  const score: Tweened<number> = tweened(0, {
    duration: 1100,
    easing: cubicOut,
  });
  const demandBar = tweened(0, { duration: 900, easing: cubicOut });
  const compBar = tweened(0, { duration: 900, easing: cubicOut });
  const incomeBar = tweened(0, { duration: 900, easing: cubicOut });
  const fitBar = tweened(0, { duration: 900, easing: cubicOut });

  let valuesAnimated = false;

  function animateInValues() {
    if (valuesAnimated) return;
    valuesAnimated = true;
    const reduced = prefersReducedMotion();
    const opt = reduced ? { duration: 0 } : undefined;
    score.set(FINAL_SCORE, opt);
    demandBar.set(72, opt);
    compBar.set(56, opt);
    incomeBar.set(82, opt);
    fitBar.set(88, opt);
  }

  $: if ($phase === 'done') animateInValues();

  let prevPhase: Phase = 'idle';
  $: {
    const p = $phase;
    if (p === 'running' && prevPhase !== 'running') {
      valuesAnimated = false;
      score.set(0, { duration: 0 });
      demandBar.set(0, { duration: 0 });
      compBar.set(0, { duration: 0 });
      incomeBar.set(0, { duration: 0 });
      fitBar.set(0, { duration: 0 });
    }
    prevPhase = p;
  }

  const demandPoints = [22, 28, 34, 31, 40, 48, 55, 52, 63, 70, 76, 84];
  const demandPath = (() => {
    const w = 320;
    const h = 96;
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
  const demandFillPath = `${demandPath} L 320 96 L 0 96 Z`;

  const insightChips = [
    { label: 'Strong foot traffic', tone: 'positive' as const, trending: true },
    { label: 'Daytime crowd', tone: 'cyan' as const },
    { label: 'Medium saturation', tone: 'muted' as const },
    { label: 'Rising demand', tone: 'positive' as const, trending: true },
    { label: 'Premium income trail', tone: 'cyan' as const },
    { label: 'Low review saturation', tone: 'muted' as const },
  ];

  const supportingMetrics = [
    { label: 'Demand', value: '+11%', tone: 'positive' as const },
    { label: 'Competition', value: 'Med', tone: 'muted' as const },
    { label: 'Income', value: '$104k', tone: 'cyan' as const },
    { label: 'Mobility', value: 'Strong', tone: 'positive' as const },
    { label: 'Catchment fit', value: 'High', tone: 'cyan' as const },
    { label: 'Rent pressure', value: 'Moderate', tone: 'muted' as const },
  ];

  const toneClass: Record<'positive' | 'cyan' | 'muted', string> = {
    positive: 'text-positive',
    cyan: 'text-accent-cyan',
    muted: 'text-text-secondary',
  };
  const chipClass: Record<'positive' | 'cyan' | 'muted', string> = {
    positive: 'border-positive/25 bg-positive/10 text-positive',
    cyan: 'border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan',
    muted:
      'border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 text-text-secondary',
  };

  const competitors = [
    { name: 'Stronghold Roasters', dist: '0.4 mi', tag: 'Direct' },
    { name: 'Brewbar Express', dist: '0.7 mi', tag: 'Direct' },
    { name: 'Mosaic Café', dist: '0.9 mi', tag: 'Adjacent' },
    { name: 'Daybreak Bakery', dist: '1.1 mi', tag: 'Adjacent' },
  ];

  const demoBars = [
    { label: 'Median income', value: 82, hint: '$104k · top quartile' },
    { label: '25–44 age band', value: 68, hint: '38% of catchment' },
    { label: 'Daytime population', value: 74, hint: '+22% vs night' },
    { label: 'Walkability', value: 71, hint: 'Walk Score 86' },
  ];

  const READOUT =
    'This concept sits inside a transit-anchored catchment with rising coffee-shop search intent and a household income profile aligned with specialty operators. Direct competition is moderate, while weekday mobility suggests strong commuter traffic.';

  $: displayAddress = demoDisplayAddress($formState.address);
</script>

<div class="demo-result">
  <header class="demo-result__meta">
    <div class="demo-result__meta-text">
      <p class="demo-result__location">{displayAddress}</p>
      <p class="demo-result__concept">{$formState.concept}</p>
    </div>
    <span class="demo-result__badge">
      <span class="demo-result__badge-dot" aria-hidden="true"></span>
      Analysis complete
    </span>
  </header>

  <div class="demo-result__tabs-wrap">
    <div role="tablist" class="gs-tab-rail demo-result__tab-rail">
      {#each tabs as tab}
        <button
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          class="gs-tab"
          on:click={() => (active = tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="demo-result__body grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
    <div class="demo-result__main demo-result__surface p-6 md:p-8">
      {#if active === 'score'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="gs-label">Viability score</p>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
            >
              Good fit
            </span>
          </div>

          <div class="mt-5 flex flex-wrap items-end gap-3">
            <span
              class="font-display font-bold leading-none tabular-nums text-text-primary"
              style="font-size: clamp(52px, 7vw, 88px);"
            >
              {Math.round($score)}
            </span>
            <span class="pb-2.5 text-base font-medium text-text-secondary"> / 100 </span>
            <span
              class="ml-auto inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold text-accent-cyan"
            >
              <Sparkles class="h-3 w-3" />
              High growth corridor
            </span>
          </div>

          <div class="mt-5 gs-progress-track">
            <div class="gs-progress-fill" style="width: {Math.round($score)}%;"></div>
          </div>

          <div class="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {#each [{ l: 'Demand', v: $demandBar }, { l: 'Competition', v: $compBar }, { l: 'Income', v: $incomeBar }, { l: 'Catchment fit', v: $fitBar }] as cell}
              <div
                class="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 p-4"
              >
                <p class="gs-label">{cell.l}</p>
                <p class="mt-1 font-display text-lg font-semibold tabular-nums text-text-primary">
                  {Math.round(cell.v)}
                </p>
                <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-surface)]/80">
                  <div
                    class="h-full rounded-full"
                    style="width: {cell.v}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if active === 'readout'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex items-center gap-2">
            <span
              class="grid h-7 w-7 place-items-center rounded-md border border-accent-purple/30 bg-accent-purple/12 text-accent-purple"
            >
              <BrainCircuit class="h-4 w-4" />
            </span>
            <p class="gs-label">Strategic readout</p>
          </div>

          <p class="mt-5 text-[16px] leading-[1.75] text-text-primary/95 md:text-[17px]">
            {READOUT}
          </p>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-positive/20 bg-positive/8 p-4">
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.16em] text-positive/90"
              >
                Advantages
              </p>
              <ul class="mt-2 space-y-1.5 text-[13.5px] leading-[1.55] text-text-primary">
                <li>Underserved AM commuter flow</li>
                <li>Premium income trail within 8-min walk</li>
                <li>Low review saturation in category</li>
              </ul>
            </div>
            <div class="rounded-xl border border-warning/20 bg-warning/8 p-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-warning">
                Watch-outs
              </p>
              <ul class="mt-2 space-y-1.5 text-[13.5px] leading-[1.55] text-text-primary">
                <li>Rent pressure is rising y/y</li>
                <li>Weekend mobility tapers vs weekday</li>
                <li>Two adjacent operators added in past 12 mo</li>
              </ul>
            </div>
          </div>
        </div>
      {:else if active === 'demand'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex items-center justify-between">
            <p class="gs-label">Demand · 12-month</p>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
            >
              <TrendingUp class="h-3 w-3" /> +11% YoY
            </span>
          </div>

          <div class="mt-4">
            <svg
              viewBox="0 0 320 96"
              class="h-40 w-full"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="demo-r-demand-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="demo-r-demand-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="var(--accent-cyan)" />
                  <stop offset="100%" stop-color="var(--accent-blue)" />
                </linearGradient>
              </defs>
              <path d={demandFillPath} fill="url(#demo-r-demand-fill)" />
              <path
                d={demandPath}
                fill="none"
                stroke="url(#demo-r-demand-stroke)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-3">
            {#each [{ l: 'Baseline', v: '52' }, { l: 'Peak', v: '84' }, { l: 'Outlook', v: '+9%' }] as cell}
              <div class="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 p-3">
                <p class="gs-label">{cell.l}</p>
                <p class="mt-0.5 font-display text-lg font-semibold tabular-nums text-text-primary">
                  {cell.v}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {:else if active === 'competition'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex items-center justify-between">
            <p class="gs-label">Competition · 1-mile</p>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/12 px-2.5 py-0.5 text-[11px] font-semibold text-warning"
            >
              Medium saturation
            </span>
          </div>

          <div class="mt-4 grid gap-2">
            {#each competitors as comp, i}
              <div
                class="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/55 px-4 py-3"
                in:fly={{ y: 8, duration: 320, delay: 80 + i * 70, easing: cubicOut }}
              >
                <div class="flex items-center gap-3">
                  <span
                    class="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)]/60 text-text-secondary"
                  >
                    <Building2 class="h-4 w-4" />
                  </span>
                  <div>
                    <p class="text-[14px] font-semibold text-text-primary">{comp.name}</p>
                    <p class="text-[12.5px] text-text-secondary">{comp.dist} away</p>
                  </div>
                </div>
                <span
                  class="rounded-full border px-2.5 py-1 text-[11px] font-semibold {comp.tag === 'Direct'
                    ? 'border-danger/30 bg-danger/10 text-danger'
                    : 'border-[var(--border-soft)] bg-[var(--bg-surface)]/60 text-text-secondary'}"
                >
                  {comp.tag}
                </span>
              </div>
            {/each}
          </div>

          <div class="mt-5 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/55 p-4">
            <div class="flex items-baseline justify-between">
              <p class="gs-label">Saturation index</p>
              <p class="font-display text-sm font-semibold tabular-nums text-text-primary">
                56 / 100
              </p>
            </div>
            <div class="mt-3 gs-progress-track">
              <div class="gs-progress-fill" style="width: 56%;"></div>
            </div>
            <p class="mt-2 text-[12.5px] text-text-secondary">
              Two new operators opened within the trade area in the last 12 months. Weekday gap remains
              underserved.
            </p>
          </div>
        </div>
      {:else if active === 'demographics'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex items-center justify-between">
            <p class="gs-label">Demographic fit</p>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-cyan"
            >
              <Users class="h-3 w-3" /> Aligned with target
            </span>
          </div>

          <div class="mt-5 space-y-4">
            {#each demoBars as bar, i}
              <div in:fly={{ y: 8, duration: 360, delay: 80 + i * 70, easing: cubicOut }}>
                <div class="flex items-baseline justify-between">
                  <p class="text-[14px] font-medium text-text-primary">{bar.label}</p>
                  <p class="font-display text-sm font-semibold tabular-nums text-text-secondary">
                    {bar.value}
                  </p>
                </div>
                <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-surface-2)]">
                  <div
                    class="h-full rounded-full"
                    style="width: {bar.value}%; background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue)); transition: width 700ms cubic-bezier(0.22,1,0.36,1) {120 + i * 60}ms;"
                  ></div>
                </div>
                <p class="mt-1 text-[12.5px] text-text-muted">{bar.hint}</p>
              </div>
            {/each}
          </div>
        </div>
      {:else if active === 'map'}
        <div in:fade={{ duration: 220 }} out:fade={{ duration: 120 }}>
          <div class="flex items-center justify-between">
            <p class="gs-label">Catchment · 8-min walk</p>
            <span
              class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
            >
              <MapIcon class="h-3 w-3" /> 12,400 residents
            </span>
          </div>

          <div
            class="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-base)]"
          >
            <div
              class="absolute inset-0 opacity-40"
              style="background-image: linear-gradient(var(--border-soft) 1px, transparent 1px), linear-gradient(90deg, var(--border-soft) 1px, transparent 1px); background-size: 32px 32px;"
            ></div>
            <div class="absolute inset-0 opacity-50">
              <div class="absolute left-0 top-[28%] h-[2px] w-full -rotate-3 bg-text-muted/40"></div>
              <div class="absolute left-0 top-[64%] h-[2px] w-full rotate-2 bg-text-muted/40"></div>
              <div class="absolute left-[34%] top-0 h-full w-[2px] rotate-3 bg-text-muted/40"></div>
              <div class="absolute left-[68%] top-0 h-full w-[2px] -rotate-6 bg-text-muted/40"></div>
            </div>
            <div
              class="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-cyan/30"
              style="background: radial-gradient(closest-side, rgba(34,211,238,0.22), transparent 70%);"
            ></div>
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div class="relative">
                <span class="absolute inset-0 -m-2 animate-ping rounded-full bg-accent-cyan/40"></span>
                <span
                  class="relative grid h-7 w-7 place-items-center rounded-full border-2 border-[var(--bg-base)] bg-accent-cyan text-[10px] font-bold text-slate-950 shadow-lg"
                >
                  P
                </span>
              </div>
            </div>
            {#each [{ x: 22, y: 30, c: 'var(--positive)' }, { x: 70, y: 40, c: 'var(--positive)' }, { x: 38, y: 70, c: 'var(--danger)' }, { x: 78, y: 66, c: 'var(--danger)' }, { x: 18, y: 64, c: 'var(--positive)' }] as p}
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

          <div class="mt-3 flex flex-wrap items-center gap-4 text-[12px] text-text-secondary">
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
      {/if}
    </div>

    <aside class="demo-result__rail demo-result__surface flex flex-col p-6 md:p-7">
      <div class="flex items-center justify-between gap-2">
        <p class="gs-label">Score</p>
        <span
          class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
        >
          Good fit
        </span>
      </div>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="font-display text-5xl font-bold leading-none tabular-nums text-text-primary">
          {Math.round($score)}
        </span>
        <span class="text-sm font-medium text-text-secondary">/ 100</span>
      </div>
      <p class="mt-1 text-[13px] text-text-secondary">High growth corridor</p>

      <div class="mt-5 gs-divider"></div>

      <p class="mt-5 gs-label">Signals</p>
      <div class="mt-2.5 flex flex-wrap gap-1.5">
        {#each insightChips as chip, i}
          <span
            class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold {chipClass[chip.tone]}"
            in:fly={{ y: 6, duration: 320, delay: 60 + i * 50, easing: cubicOut }}
          >
            {#if chip.trending}
              <TrendingUp class="h-3 w-3" />
            {/if}
            {chip.label}
          </span>
        {/each}
      </div>

      <div class="mt-5 gs-divider"></div>

      <p class="mt-5 gs-label">Metrics</p>
      <div class="mt-2.5 grid grid-cols-2 gap-2">
        {#each supportingMetrics as m}
          <div class="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/55 p-3">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {m.label}
            </p>
            <p class="mt-0.5 font-display text-base font-semibold tabular-nums {toneClass[m.tone]}">
              {m.value}
            </p>
          </div>
        {/each}
      </div>

      <div class="mt-auto pt-7">
        <a
          href="/analyze"
          class="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 text-[13px] font-semibold text-accent-cyan transition-all duration-200 hover:bg-accent-cyan hover:text-slate-950 hover:shadow-[0_18px_50px_-18px_rgba(34,211,238,0.55)]"
        >
          Run on a real address
          <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </aside>
  </div>
</div>

<style>
  .demo-result__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--demo-panel-divider, var(--border-soft));
  }

  .demo-result__location {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.35;
  }

  .demo-result__concept {
    margin: 0.25rem 0 0;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .demo-result__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--positive);
    padding: 0.4rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.1);
  }

  .demo-result__badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--positive);
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
  }

  .demo-result__tabs-wrap {
    margin-bottom: 1.25rem;
    overflow-x: auto;
    padding-bottom: 2px;
    -webkit-overflow-scrolling: touch;
  }

  .demo-result__tab-rail {
    width: max-content;
    max-width: 100%;
  }

  .demo-result__surface {
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: linear-gradient(
      165deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0) 55%
    );
    background-color: color-mix(in srgb, var(--bg-surface-2) 55%, transparent);
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
  }

  :global(.light) .demo-result__surface {
    background-color: rgba(241, 245, 249, 0.65);
  }

  .demo-result__main {
    min-height: 280px;
  }

  .demo-result__rail {
    min-height: 100%;
  }

  @media (max-width: 1023px) {
    .demo-result__rail {
      padding-bottom: 1.5rem;
    }
  }
</style>
