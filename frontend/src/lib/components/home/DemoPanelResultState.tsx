
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '$lib/utils/cn';
import { prefersReducedMotion, tweenNumber } from '$lib/utils/motion';
import { demoDisplayAddress, useDemoFlow, type Phase } from '$lib/hooks/demoFlow';

const FINAL_SCORE = 78;

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
  muted: 'border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 text-text-secondary',
};

export default function DemoPanelResultState() {
  const { phase, formState } = useDemoFlow();
  const [score, setScore] = useState(0);
  const [demandBar, setDemandBar] = useState(0);
  const [compBar, setCompBar] = useState(0);
  const [incomeBar, setIncomeBar] = useState(0);
  const [fitBar, setFitBar] = useState(0);
  const valuesAnimatedRef = useRef(false);
  const prevPhaseRef = useRef<Phase>('idle');
  const cancelRef = useRef<(() => void) | null>(null);

  const animateInValues = () => {
    if (valuesAnimatedRef.current) return;
    valuesAnimatedRef.current = true;
    const reduced = prefersReducedMotion();
    const scoreDur = reduced ? 0 : 1100;
    const barDur = reduced ? 0 : 900;
    cancelRef.current?.();
    cancelRef.current = tweenNumber(0, FINAL_SCORE, scoreDur, setScore);
    tweenNumber(0, 72, barDur, setDemandBar);
    tweenNumber(0, 56, barDur, setCompBar);
    tweenNumber(0, 82, barDur, setIncomeBar);
    tweenNumber(0, 88, barDur, setFitBar);
  };

  useEffect(() => {
    if (phase === 'done') animateInValues();

    const p = phase;
    if (p === 'running' && prevPhaseRef.current !== 'running') {
      valuesAnimatedRef.current = false;
      setScore(0);
      setDemandBar(0);
      setCompBar(0);
      setIncomeBar(0);
      setFitBar(0);
    }
    prevPhaseRef.current = p;
  }, [phase]);

  const displayAddress = demoDisplayAddress(formState.address);
  const pillarCells = [
    { l: 'Demand', v: demandBar },
    { l: 'Competition', v: compBar },
    { l: 'Income', v: incomeBar },
    { l: 'Catchment fit', v: fitBar },
  ];

  return (
    <div className="demo-result">
      <header className="demo-panel-chrome demo-result__chrome">
        <div className="demo-result__meta-text">
          <p className="demo-result__location">{displayAddress}</p>
          <p className="demo-result__concept">{formState.concept}</p>
        </div>
        <span className="demo-result__badge">
          <span className="demo-result__badge-dot" aria-hidden="true" />
          Analysis complete
        </span>
      </header>

      <div className="demo-panel-grid demo-result__grid">
        <div className="demo-panel-col demo-result__left">
          <div className="demo-result__score-block">
            <div className="demo-result__score-head">
              <p className="gs-label">Viability score</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2.5 py-0.5 text-[11px] font-semibold text-positive">
                Good fit
              </span>
            </div>

            <div className="demo-result__score-row">
              <span className="demo-result__score-num tabular-nums">{Math.round(score)}</span>
              <span className="demo-result__score-denom">/ 100</span>
              <span className="demo-result__corridor inline-flex items-center gap-1 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-2.5 py-1 text-[11px] font-semibold text-accent-cyan">
                <Sparkles className="h-3 w-3" />
                High growth corridor
              </span>
            </div>

            <div className="gs-progress-track">
              <div className="gs-progress-fill" style={{ width: `${Math.round(score)}%` }} />
            </div>
          </div>

          <div className="demo-result__pillars">
            {pillarCells.map((cell) => (
              <div key={cell.l} className="demo-result__pillar">
                <p className="gs-label">{cell.l}</p>
                <p className="demo-result__pillar-val tabular-nums">{Math.round(cell.v)}</p>
                <div className="demo-result__pillar-track">
                  <div className="demo-result__pillar-fill" style={{ width: `${cell.v}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="demo-result__chart">
            <div className="demo-result__chart-head">
              <p className="gs-label">Demand · 12-month</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/12 px-2 py-0.5 text-[10px] font-semibold text-positive">
                <TrendingUp className="h-3 w-3" /> +11%
              </span>
            </div>
            <svg
              viewBox="0 0 320 72"
              className="demo-result__chart-svg"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="demo-r-demand-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="demo-r-demand-stroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-cyan)" />
                  <stop offset="100%" stopColor="var(--accent-blue)" />
                </linearGradient>
              </defs>
              <path d={demandFillPath} fill="url(#demo-r-demand-fill)" />
              <path
                d={demandPath}
                fill="none"
                stroke="url(#demo-r-demand-stroke)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <aside className="demo-panel-col demo-result__right">
          <p className="gs-label">Signals</p>
          <div className="demo-result__chips">
            {insightChips.map((chip, i) => (
              <span
                key={chip.label}
                className={cn('demo-result__chip', chipClass[chip.tone], 'demo-result__chip-enter')}
                style={{ animationDelay: `${60 + i * 50}ms` }}
              >
                {chip.trending ? <TrendingUp className="h-3 w-3" /> : null}
                {chip.label}
              </span>
            ))}
          </div>

          <p className="gs-label demo-result__metrics-label">Metrics</p>
          <div className="demo-result__metrics">
            {supportingMetrics.map((m) => (
              <div key={m.label} className="demo-result__metric">
                <p className="demo-result__metric-label">{m.label}</p>
                <p className={cn('demo-result__metric-value', toneClass[m.tone])}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="demo-result__cta">
            <a href="/analyze" className="group demo-result__cta-btn">
              Run on a real address
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
