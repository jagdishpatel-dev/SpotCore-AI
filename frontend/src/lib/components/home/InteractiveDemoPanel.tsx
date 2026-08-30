
import { useEffect, useRef, useState, type ElementType } from 'react';
import { cn } from '$lib/utils/cn';
import { prefersReducedMotion } from '$lib/utils/motion';
import { getDemoFlowSnapshot, useDemoFlow } from '$lib/hooks/demoFlow';
import DemoPanelInputState from './DemoPanelInputState';
import DemoPanelLoadingState from './DemoPanelLoadingState';
import DemoPanelResultState from './DemoPanelResultState';
import './demo-home.css';

const IDLE_AUTOSTART_MS = 5200;

export interface InteractiveDemoPanelProps {
  embedded?: boolean;
}

export default function InteractiveDemoPanel({ embedded = false }: InteractiveDemoPanelProps) {
  const { phase, homepageDemoAutoplayDisabled, run, disableHomepageDemoAutoplay, homepageDemoTimerGeneration } =
    useDemoFlow();
  const timersRef = useRef<number[]>([]);
  const lastTimerGenRef = useRef(0);
  const [fadeKey, setFadeKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const engage = () => {
    disableHomepageDemoAutoplay();
    clearTimers();
  };

  useEffect(() => {
    const g = homepageDemoTimerGeneration;
    if (g !== lastTimerGenRef.current) {
      if (g > 0) clearTimers();
      lastTimerGenRef.current = g;
    }
  }, [homepageDemoTimerGeneration]);

  useEffect(() => {
    timersRef.current.push(
      window.setTimeout(() => {
        if (getDemoFlowSnapshot().homepageDemoAutoplayDisabled) return;
        if (getDemoFlowSnapshot().phase !== 'idle') return;
        run();
      }, IDLE_AUTOSTART_MS),
    );
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFadeKey((k) => k + 1);
  }, [phase]);

  const fadeMs = prefersReducedMotion() ? 0 : 220;
  const Wrapper = (embedded ? 'div' : 'section') as ElementType;

  const stateContent =
    phase === 'idle' ? (
      <DemoPanelInputState onEngage={engage} />
    ) : phase === 'running' ? (
      <DemoPanelLoadingState />
    ) : (
      <DemoPanelResultState />
    );

  return (
    <Wrapper
      id="demo"
      className={cn(
        'demo-product-section relative scroll-mt-24',
        embedded && 'demo-product-section--embedded',
      )}
      aria-label="SpotCore interactive preview"
    >
      <div className="demo-product-wrap relative mx-auto w-full max-w-5xl">
        <div className="demo-product-shell geo-glass-soft rounded-2xl" aria-busy={phase === 'running'}>
          <div className="demo-product-body">
            <div
              key={fadeKey}
              className="demo-state-layer"
              style={{
                animation: fadeMs
                  ? `demo-panel-fade-in ${fadeMs}ms ease forwards`
                  : undefined,
              }}
            >
              {stateContent}
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
