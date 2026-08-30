
import GlassCard from './GlassCard';
import Reveal from './Reveal';
import AccentIcon from './AccentIcon';
import { cn } from '$lib/utils/cn';
import { buildDemandHistory, buildForecast } from '$lib/utils/report';
import type { AnalyzeSiteResponse } from '$lib/types';

export interface DemandChartsProps {
  result: AnalyzeSiteResponse;
}

const W = 600;
const H = 200;
const PAD = { top: 20, right: 16, bottom: 24, left: 28 };

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

function buildForecastPaths(
  history: number[],
  fc: { mid: number[]; low: number[]; high: number[] },
) {
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

type TrendDir = 'up' | 'down' | 'flat';

function commentary(dir: TrendDir): string {
  if (dir === 'up') return 'Forward signal points to a mild upward trend in the next two quarters.';
  if (dir === 'down')
    return 'Forward signal suggests softening — guard against overbuilding capacity early.';
  return 'Demand looks like it is stabilizing at a healthy level — plan for steady, not breakout.';
}

export default function DemandCharts({ result }: DemandChartsProps) {
  const history = buildDemandHistory(result.scores.demand, 18);
  const forecast = buildForecast(history, 6);
  const hist = buildHistoryPath(history);
  const fc = buildForecastPaths(history, forecast);

  const histLast = history[history.length - 1];
  const fcLast = forecast.mid[forecast.mid.length - 1];
  const trendDelta = fcLast - histLast;
  const trendDir: TrendDir = trendDelta > 2 ? 'up' : trendDelta < -2 ? 'down' : 'flat';

  const gridYs = [25, 50, 75].map(
    (g) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - (g - 10) / 90),
  );

  return (
    <section className="px-2">
      <Reveal y={14} duration={520}>
        <div className="mb-5 flex items-center gap-2.5">
          <span className="text-accent">
            <AccentIcon name="chart" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink md:text-xl">
            Demand &amp; future outlook
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        <Reveal y={16} duration={560} delay={80}>
          <GlassCard tone="blue" className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="gs-label text-accent-2">Demand history</p>
                <p className="mt-1 text-base font-medium text-ink">Normalized index, last 18 months</p>
              </div>
              <span className="gs-num rounded-md border border-line bg-white/[0.02] px-2 py-1 text-xs text-ink">
                {Math.round(histLast)}
              </span>
            </div>

            <div className="mt-4">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full md:h-48">
                <defs>
                  <linearGradient id="gs-hist-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {gridYs.map((y) => (
                  <line
                    key={y}
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(148,163,184,0.08)"
                    strokeDasharray="2 4"
                  />
                ))}
                <path d={hist.area} fill="url(#gs-hist-grad)" />
                <path
                  d={hist.line}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="demand-chart-draw"
                />
              </svg>
            </div>
          </GlassCard>
        </Reveal>

        <Reveal y={16} duration={560} delay={150}>
          <GlassCard tone="cyan" className="h-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="gs-label text-accent">Future outlook</p>
                <p className="mt-1 text-base font-medium text-ink">6-month forecast with confidence band</p>
              </div>
              <span
                className={cn(
                  'gs-num rounded-md border px-2 py-1 text-xs',
                  trendDir === 'up' && 'border-positive text-positive',
                  trendDir === 'down' && 'border-warning text-warning',
                  trendDir === 'flat' && 'border-line text-ink',
                )}
              >
                {trendDir === 'up' ? '+' : trendDir === 'down' ? '' : '±'}
                {Math.round(trendDelta)}
              </span>
            </div>

            <div className="mt-4">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full md:h-48">
                <defs>
                  <linearGradient id="gs-fc-band" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.06" />
                  </linearGradient>
                </defs>

                {gridYs.map((y) => (
                  <line
                    key={`fc-${y}`}
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={y}
                    y2={y}
                    stroke="rgba(148,163,184,0.08)"
                    strokeDasharray="2 4"
                  />
                ))}

                <path
                  d={hist.line}
                  fill="none"
                  stroke="rgba(148,163,184,0.45)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />

                <path d={fc.band} fill="url(#gs-fc-band)" />
                <line
                  x1={fc.divider.x}
                  x2={fc.divider.x}
                  y1={fc.divider.top}
                  y2={fc.divider.bottom}
                  stroke="rgba(34,211,238,0.4)"
                  strokeDasharray="3 4"
                />
                <path
                  d={fc.mid}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="demand-chart-draw demand-chart-draw-2"
                />
              </svg>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">{commentary(trendDir)}</p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
