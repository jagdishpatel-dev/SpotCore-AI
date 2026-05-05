<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import { buildDemandHistory, buildForecast } from '$lib/utils/report';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;

  const W = 600;
  const H = 200;
  const PAD = { top: 20, right: 16, bottom: 24, left: 28 };

  $: history = buildDemandHistory(result.scores.demand, 18);
  $: forecast = buildForecast(history, 6);

  function buildHistoryPath(values: number[]) {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const stepX = innerW / Math.max(1, values.length - 1);
    const yAt = (v: number) => PAD.top + innerH * (1 - (v - 10) / 90);
    let d = '';
    values.forEach((v, i) => {
      const x = PAD.left + i * stepX;
      const y = yAt(v);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    const last = `${PAD.left + (values.length - 1) * stepX} ${PAD.top + innerH}`;
    const first = `${PAD.left} ${PAD.top + innerH}`;
    return { line: d, area: `${d} L ${last} L ${first} Z` };
  }

  function buildForecastPaths(history: number[], fc: { mid: number[]; low: number[]; high: number[] }) {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const total = history.length + fc.mid.length;
    const stepX = innerW / Math.max(1, total - 1);
    const yAt = (v: number) => PAD.top + innerH * (1 - (v - 10) / 90);

    const startIdx = history.length - 1;
    const linkVal = history[startIdx];
    const midSeries = [linkVal, ...fc.mid];
    const lowSeries = [linkVal, ...fc.low];
    const highSeries = [linkVal, ...fc.high];

    const xAt = (i: number) => PAD.left + (startIdx + i) * stepX;

    let mid = '';
    midSeries.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      mid += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });

    let band = '';
    highSeries.forEach((v, i) => {
      const x = xAt(i);
      const y = yAt(v);
      band += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    for (let i = lowSeries.length - 1; i >= 0; i--) {
      const x = xAt(i);
      const y = yAt(lowSeries[i]);
      band += ` L ${x} ${y}`;
    }
    band += ' Z';

    return { mid, band, divider: { x: xAt(0), top: PAD.top, bottom: PAD.top + innerH } };
  }

  $: hist = buildHistoryPath(history);
  $: fc = buildForecastPaths(history, forecast);

  type TrendDir = 'up' | 'down' | 'flat';

  $: histLast = history[history.length - 1];
  $: fcLast = forecast.mid[forecast.mid.length - 1];
  $: trendDelta = fcLast - histLast;
  $: trendDir = (trendDelta > 2 ? 'up' : trendDelta < -2 ? 'down' : 'flat') as TrendDir;

  function commentary(dir: TrendDir): string {
    if (dir === 'up') return 'Forward signal points to a mild upward trend in the next two quarters.';
    if (dir === 'down') return 'Forward signal suggests softening — guard against overbuilding capacity early.';
    return 'Demand looks like it is stabilizing at a healthy level — plan for steady, not breakout.';
  }
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="chart" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">
        Demand &amp; future outlook
      </h2>
    </div>
  </Reveal>

  <div class="grid gap-5 md:grid-cols-2 md:gap-6">
    <Reveal y={16} duration={560} delay={80}>
      <GlassCard tone="blue" class="h-full">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="gs-label text-accent-2">Demand history</p>
            <p class="mt-1 text-base font-medium text-ink">Normalized index, last 18 months</p>
          </div>
          <span class="gs-num rounded-md border border-line bg-white/[0.02] px-2 py-1 text-xs text-ink">
            {Math.round(histLast)}
          </span>
        </div>

        <div class="mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} class="h-44 w-full md:h-48">
            <defs>
              <linearGradient id="gs-hist-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45" />
                <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
              </linearGradient>
            </defs>
            <!-- gridlines -->
            {#each [25, 50, 75] as g}
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + (H - PAD.top - PAD.bottom) * (1 - (g - 10) / 90)}
                y2={PAD.top + (H - PAD.top - PAD.bottom) * (1 - (g - 10) / 90)}
                stroke="rgba(148,163,184,0.08)"
                stroke-dasharray="2 4"
              />
            {/each}
            <path d={hist.area} fill="url(#gs-hist-grad)" />
            <path
              d={hist.line}
              fill="none"
              stroke="#38bdf8"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="gs-draw"
            />
          </svg>
        </div>
      </GlassCard>
    </Reveal>

    <Reveal y={16} duration={560} delay={150}>
      <GlassCard tone="cyan" class="h-full">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="gs-label text-accent">Future outlook</p>
            <p class="mt-1 text-base font-medium text-ink">6-month forecast with confidence band</p>
          </div>
          <span class="gs-num rounded-md border px-2 py-1 text-xs gs-num"
                class:border-positive={trendDir === 'up'}
                class:text-positive={trendDir === 'up'}
                class:border-warning={trendDir === 'down'}
                class:text-warning={trendDir === 'down'}
                class:border-line={trendDir === 'flat'}
                class:text-ink={trendDir === 'flat'}>
            {trendDir === 'up' ? '+' : trendDir === 'down' ? '' : '±'}{Math.round(trendDelta)}
          </span>
        </div>

        <div class="mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} class="h-44 w-full md:h-48">
            <defs>
              <linearGradient id="gs-fc-band" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.32" />
                <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.06" />
              </linearGradient>
            </defs>

            {#each [25, 50, 75] as g}
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={PAD.top + (H - PAD.top - PAD.bottom) * (1 - (g - 10) / 90)}
                y2={PAD.top + (H - PAD.top - PAD.bottom) * (1 - (g - 10) / 90)}
                stroke="rgba(148,163,184,0.08)"
                stroke-dasharray="2 4"
              />
            {/each}

            <!-- history line muted, leading into forecast -->
            <path
              d={hist.line}
              fill="none"
              stroke="rgba(148,163,184,0.45)"
              stroke-width="1.4"
              stroke-linecap="round"
            />

            <!-- forecast band + line -->
            <path d={fc.band} fill="url(#gs-fc-band)" />
            <line
              x1={fc.divider.x}
              x2={fc.divider.x}
              y1={fc.divider.top}
              y2={fc.divider.bottom}
              stroke="rgba(34,211,238,0.4)"
              stroke-dasharray="3 4"
            />
            <path
              d={fc.mid}
              fill="none"
              stroke="#22d3ee"
              stroke-width="1.9"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="gs-draw gs-draw-2"
            />
          </svg>
        </div>

        <p class="mt-4 text-sm leading-relaxed text-muted">{commentary(trendDir)}</p>
      </GlassCard>
    </Reveal>
  </div>
</section>

<style>
  .gs-draw {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: gs-draw 1100ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 220ms;
  }
  .gs-draw-2 {
    animation-delay: 380ms;
  }
  @keyframes gs-draw {
    to {
      stroke-dashoffset: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .gs-draw {
      animation: none;
      stroke-dashoffset: 0;
    }
  }
</style>
