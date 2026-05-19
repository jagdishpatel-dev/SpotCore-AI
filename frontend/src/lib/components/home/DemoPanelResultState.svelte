<script lang="ts">
  import { tweened, type Tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';
  import {
    TrendingUp,
    Sparkles,
    ArrowRight,
  } from 'lucide-svelte';
  import { prefersReducedMotion } from '$lib/actions/reveal';
  import { phase, formState, demoDisplayAddress, type Phase } from '$lib/stores/demoFlow';

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
    const h = 72;
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
  const demandFillPath = `${demandPath} L 320 72 L 0 72 Z`;

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

  $: displayAddress = demoDisplayAddress($formState.address);

  $: pillarCells = [
    { l: 'Demand', v: $demandBar },
    { l: 'Competition', v: $compBar },
    { l: 'Income', v: $incomeBar },
    { l: 'Catchment fit', v: $fitBar },
  ];
</script>

<div class="demo-result">
  <header class="demo-panel-chrome demo-result__chrome">
    <div class="demo-result__meta-text">
      <p class="demo-result__location">{displayAddress}</p>
      <p class="demo-result__concept">{$formState.concept}</p>
    </div>
    <span class="demo-result__badge">
      <span class="demo-result__badge-dot" aria-hidden="true"></span>
      Analysis complete
    </span>
  </header>

  <div class="demo-panel-grid demo-result__grid">
    <div class="demo-panel-col demo-result__left">
      <div class="demo-result__score-block">
        <div class="demo-result__score-head">
          <p class="gs-label">Viability score</p>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive"
          >
            Good fit
          </span>
        </div>

        <div class="demo-result__score-row">
          <span class="demo-result__score-num tabular-nums">{Math.round($score)}</span>
          <span class="demo-result__score-denom">/ 100</span>
          <span
            class="demo-result__corridor inline-flex items-center gap-1 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold text-accent-cyan"
          >
            <Sparkles class="h-3 w-3" />
            High growth corridor
          </span>
        </div>

        <div class="gs-progress-track">
          <div class="gs-progress-fill" style="width: {Math.round($score)}%;"></div>
        </div>
      </div>

      <div class="demo-result__pillars">
        {#each pillarCells as cell}
          <div class="demo-result__pillar">
            <p class="gs-label">{cell.l}</p>
            <p class="demo-result__pillar-val tabular-nums">{Math.round(cell.v)}</p>
            <div class="demo-result__pillar-track">
              <div class="demo-result__pillar-fill" style="width: {cell.v}%;"></div>
            </div>
          </div>
        {/each}
      </div>

      <div class="demo-result__chart">
        <div class="demo-result__chart-head">
          <p class="gs-label">Demand · 12-month</p>
          <span
            class="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/12 px-2 py-0.5 text-[10px] font-semibold text-positive"
          >
            <TrendingUp class="h-3 w-3" /> +11%
          </span>
        </div>
        <svg viewBox="0 0 320 72" class="demo-result__chart-svg" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="demo-r-demand-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.35" />
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
    </div>

    <aside class="demo-panel-col demo-result__right">
      <p class="gs-label">Signals</p>
      <div class="demo-result__chips">
        {#each insightChips as chip, i}
          <span
            class="demo-result__chip {chipClass[chip.tone]}"
            in:fly={{ y: 6, duration: 320, delay: 60 + i * 50, easing: cubicOut }}
          >
            {#if chip.trending}
              <TrendingUp class="h-3 w-3" />
            {/if}
            {chip.label}
          </span>
        {/each}
      </div>

      <p class="gs-label demo-result__metrics-label">Metrics</p>
      <div class="demo-result__metrics">
        {#each supportingMetrics as m}
          <div class="demo-result__metric">
            <p class="demo-result__metric-label">{m.label}</p>
            <p class="demo-result__metric-value {toneClass[m.tone]}">{m.value}</p>
          </div>
        {/each}
      </div>

      <div class="demo-result__cta">
        <a
          href="/analyze"
          class="group demo-result__cta-btn"
        >
          Run on a real address
          <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </aside>
  </div>
</div>

<style>
  .demo-result {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .demo-result__chrome {
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
  }

  .demo-result__meta-text {
    min-width: 0;
  }

  .demo-result__location {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    line-height: 1.35;
  }

  .demo-result__concept {
    margin: 0.2rem 0 0;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .demo-result__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--positive);
    padding: 0.35rem 0.65rem;
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

  .demo-result__grid {
    flex: 1;
    min-height: 0;
  }

  .demo-result__left {
    gap: 0.65rem;
  }

  .demo-result__score-block {
    flex-shrink: 0;
  }

  .demo-result__score-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .demo-result__score-row {
    margin-top: 0.35rem;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.65rem;
  }

  .demo-result__score-num {
    font-family: var(--font-display), var(--font-geist-sans), system-ui, sans-serif;
    font-size: clamp(2.25rem, 4vw, 2.75rem);
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .demo-result__score-denom {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .demo-result__corridor {
    margin-left: auto;
  }

  @media (max-width: 899px) {
    .demo-result__corridor {
      margin-left: 0;
    }
  }

  .demo-result__pillars {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;
    flex-shrink: 0;
  }

  .demo-result__pillar {
    border-radius: 12px;
    border: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--bg-surface-2) 55%, transparent);
    padding: 0.5rem 0.6rem;
  }

  .demo-result__pillar-val {
    margin: 0.15rem 0 0.35rem;
    font-family: var(--font-display), var(--font-geist-sans), system-ui, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .demo-result__pillar-track {
    height: 4px;
    border-radius: 9999px;
    background: color-mix(in srgb, var(--bg-surface) 80%, transparent);
    overflow: hidden;
  }

  .demo-result__pillar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
    transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-result__chart {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    border: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--bg-surface-2) 45%, transparent);
    padding: 0.55rem 0.65rem 0.45rem;
  }

  .demo-result__chart-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .demo-result__chart-svg {
    margin-top: 0.35rem;
    width: 100%;
    height: 4.25rem;
    flex-shrink: 0;
  }

  .demo-result__right {
    gap: 0.55rem;
    border-radius: 16px;
    border: 1px solid var(--border-soft);
    background: linear-gradient(
      165deg,
      rgba(255, 255, 255, 0.03),
      rgba(255, 255, 255, 0) 55%
    );
    background-color: color-mix(in srgb, var(--bg-surface-2) 55%, transparent);
    padding: 0.85rem 0.9rem;
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset;
  }

  :global(.light) .demo-result__right {
    background-color: rgba(241, 245, 249, 0.65);
  }

  .demo-result__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .demo-result__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: 9999px;
    border: 1px solid;
    padding: 0.28rem 0.55rem;
    font-size: 11px;
    font-weight: 600;
  }

  .demo-result__metrics-label {
    margin-top: 0.15rem;
  }

  .demo-result__metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
    flex: 1;
    min-height: 0;
    align-content: start;
  }

  .demo-result__metric {
    border-radius: 10px;
    border: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--bg-surface-2) 50%, transparent);
    padding: 0.45rem 0.5rem;
  }

  .demo-result__metric-label {
    margin: 0;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .demo-result__metric-value {
    margin: 0.15rem 0 0;
    font-family: var(--font-display), var(--font-geist-sans), system-ui, sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.2;
  }

  .demo-result__cta {
    margin-top: auto;
    padding-top: 0.35rem;
    flex-shrink: 0;
  }

  .demo-result__cta-btn {
    display: inline-flex;
    height: 2.5rem;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border-radius: 9999px;
    border: 1px solid rgba(34, 211, 238, 0.4);
    background: rgba(34, 211, 238, 0.1);
    font-size: 12px;
    font-weight: 600;
    color: var(--accent-cyan);
    transition:
      background-color 200ms ease,
      color 200ms ease,
      box-shadow 200ms ease;
  }

  .demo-result__cta-btn:hover {
    background: var(--accent-cyan);
    color: #0f172a;
    box-shadow: 0 18px 50px -18px rgba(34, 211, 238, 0.55);
  }
</style>
