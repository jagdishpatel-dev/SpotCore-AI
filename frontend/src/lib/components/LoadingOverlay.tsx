import { useEffect, useState } from 'react';
import { cn } from '$lib/utils/cn';
import './loading-overlay.css';

export interface LoadingOverlayProps {
  active?: boolean;
  address?: string;
  businessType?: string;
}

/** The stages the backend works through. Timing is approximate, so the last stage holds until the request resolves. */
const STAGES = [
  'Locating the address',
  'Pulling census demographics',
  'Mapping nearby competitors',
  'Scoring demand and fit',
  'Writing the readout',
];
const STAGE_MS = 1600;

/** Parcel blocks for the scan map: [x, y, w, h] in a 240×240 viewBox. */
const BLOCKS: [number, number, number, number][] = [
  [12, 12, 60, 44], [80, 12, 70, 44], [158, 12, 70, 44],
  [12, 64, 60, 52], [80, 64, 32, 52], [118, 64, 32, 52], [158, 64, 70, 52],
  [12, 124, 60, 46], [80, 124, 70, 46], [158, 124, 34, 46], [196, 124, 32, 46],
  [12, 178, 60, 50], [80, 178, 70, 50], [158, 178, 70, 50],
];
const PINS: [number, number, number][] = [
  [46, 36, 0.4], [182, 92, 1.1], [58, 148, 1.8], [196, 198, 2.5], [108, 202, 3.2], [204, 30, 3.9],
];

export default function LoadingOverlay({ active = false, address, businessType }: LoadingOverlayProps) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    setStage(0);
    setProgress(0);

    const stageTimer = window.setInterval(() => {
      setStage((s) => Math.min(s + 1, STAGES.length - 1));
    }, STAGE_MS);
    // Eases toward 94% and never claims completion before the response arrives.
    const progressTimer = window.setInterval(() => {
      setProgress((p) => p + (94 - p) * 0.012);
    }, 60);

    return () => {
      window.clearInterval(stageTimer);
      window.clearInterval(progressTimer);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label="Analyzing location">
      <div className="loading-overlay__card">
        <div className="loading-overlay__map" aria-hidden="true">
          <svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            <rect width="240" height="240" fill="var(--gs-surface-soft)" />
            {BLOCKS.map(([x, y, w, h], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="3"
                className="loading-overlay__block"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
            <rect x="80" y="64" width="32" height="52" rx="3" className="loading-overlay__target" />
            {PINS.map(([cx, cy, delay], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="3.2"
                className="loading-overlay__pin"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
            <circle cx="96" cy="90" r="46" className="loading-overlay__ring" />
          </svg>
          <div className="loading-overlay__sweep" />
        </div>

        <div className="loading-overlay__body">
          <p className="font-mono text-[11px] text-spotcore-accent">Analysis in progress</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-spotcore-text">
            Building your site brief
          </h2>
          {address ? (
            <p className="mt-1.5 truncate text-sm text-spotcore-text-muted">
              {businessType ? `${businessType} · ` : ''}
              {address}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3">
            <div className="gs-progress-track flex-1">
              <div className="gs-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-9 text-right font-mono text-xs tabular-nums text-spotcore-text-muted">
              {Math.round(progress)}%
            </span>
          </div>

          <ol className="mt-6 space-y-1">
            {STAGES.map((label, i) => {
              const state = i < stage ? 'done' : i === stage ? 'active' : 'pending';
              return (
                <li key={label} className={cn('loading-overlay__step', `is-${state}`)}>
                  <span className="loading-overlay__marker" aria-hidden="true">
                    {state === 'done' ? (
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2.5 6.5l2.2 2.2L9.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span>{label}</span>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 border-t border-spotcore-border pt-4 text-xs leading-relaxed text-spotcore-text-muted">
            Results are a preliminary pre-screen. Keep this tab open—your report loads automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
