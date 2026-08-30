
import { useEffect, useState } from 'react';
import { Activity, Check, MapPin } from 'lucide-react';
import {
  STEPS,
  demoDisplayAddress,
  useDemoFlow,
} from '$lib/hooks/demoFlow';

type StepState = 'pending' | 'active' | 'done';

export default function DemoPanelLoadingState() {
  const { phase, currentStep, progress, formState } = useDemoFlow();
  const [activeLabel, setActiveLabel] = useState('');
  const [labelAnimKey, setLabelAnimKey] = useState(0);

  const stepStates = STEPS.map<StepState>((_, i) => {
    if (phase === 'done') return 'done';
    if (phase === 'idle') return 'pending';
    if (i < currentStep) return 'done';
    if (i === currentStep) return 'active';
    return 'pending';
  });

  const percent = Math.round(progress * 100);
  const displayAddress = demoDisplayAddress(formState.address);

  useEffect(() => {
    let label = '';
    if (phase === 'running') {
      if (currentStep >= 0 && currentStep < STEPS.length) label = STEPS[currentStep];
      else if (currentStep >= STEPS.length) label = 'Finalizing…';
      else label = 'Starting…';
    }
    setActiveLabel(label);
    setLabelAnimKey((k) => k + 1);
  }, [phase, currentStep]);

  return (
    <div className="demo-loading">
      <header className="demo-loading__top">
        <div>
          <p className="demo-loading__title">Analyzing this address</p>
          <p className="demo-loading__context">
            <MapPin className="inline-block h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
            <span>{displayAddress}</span>
            <span className="text-text-muted">·</span>
            <span>{formState.concept}</span>
          </p>
        </div>
        <span className="demo-loading__pct tabular-nums">{percent}%</span>
      </header>

      <div className="gs-progress-track demo-loading__progress">
        <div className="gs-progress-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="demo-loading__status">
        <Activity className="h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
        <span
          key={labelAnimKey}
          className="truncate demo-loading__status-label"
        >
          {activeLabel}
        </span>
      </div>

      <div className="demo-panel-grid demo-loading__grid">
        <div className="demo-panel-col demo-loading__left">
          <div className="demo-loading__score-sk" aria-hidden="true">
            <div className="demo-sk demo-loading__sk-score" />
            <div className="demo-sk demo-loading__sk-bar" />
          </div>

          <div className="demo-loading__pillars" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="demo-loading__pillar">
                <div className="demo-sk demo-loading__sk-label" />
                <div className="demo-sk demo-loading__sk-value" />
                <div className="demo-sk demo-loading__sk-meter" />
              </div>
            ))}
          </div>

          <div className="demo-sk demo-loading__sk-chart" aria-hidden="true" />

          <div className="demo-loading__steps">
            {STEPS.map((label, i) => (
              <div key={label} className="progress-row progress-row--compact" data-state={stepStates[i]}>
                <span className="progress-marker" aria-hidden="true">
                  {stepStates[i] === 'done' ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-semibold tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  )}
                </span>
                <span className="progress-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="demo-panel-col demo-loading__right" aria-hidden="true">
          <div className="demo-loading__signals">
            <div className="demo-sk demo-loading__sk-section-title" />
            <div className="demo-loading__chips">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="demo-sk demo-loading__sk-chip"
                  style={{ width: `${52 + (i % 3) * 18}px` }}
                />
              ))}
            </div>
          </div>

          <div className="demo-loading__metrics">
            <div className="demo-sk demo-loading__sk-section-title" />
            <div className="demo-loading__metric-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="demo-loading__metric-cell">
                  <div className="demo-sk demo-loading__sk-metric-label" />
                  <div className="demo-sk demo-loading__sk-metric-value" />
                </div>
              ))}
            </div>
          </div>

          <div className="demo-sk demo-loading__sk-map" />
        </aside>
      </div>
    </div>
  );
}
