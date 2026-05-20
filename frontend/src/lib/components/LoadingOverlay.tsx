
import { useEffect, useMemo, useState } from 'react';
import { cn } from '$lib/utils/cn';
import './loading-overlay.css';

export interface LoadingOverlayProps {
  active?: boolean;
}

const dataPoints = [
  { label: 'Census API', x: -150, y: -100 },
  { label: 'OSM POIs', x: 150, y: -120 },
  { label: 'Transit Flows', x: -180, y: 80 },
  { label: 'Zoning Laws', x: 120, y: 150 },
  { label: 'Retail Trends', x: 0, y: -200 },
  { label: 'Demographics', x: -100, y: 0 },
  { label: 'POI Clusters', x: 100, y: 0 },
  { label: 'Traffic Density', x: 0, y: 180 },
];

export default function LoadingOverlay({ active = false }: LoadingOverlayProps) {
  const [stage, setStage] = useState<'gathering' | 'condensing' | 'ready'>('gathering');
  const [progress, setProgress] = useState(0);
  const rainItems = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${Math.random() * 3 + 2}s`,
        delay: `${Math.random() * 5}s`,
      })),
    [],
  );

  useEffect(() => {
    if (!active) return;

    setStage('gathering');
    setProgress(0);

    const t1 = setTimeout(() => setStage('condensing'), 2000);
    const t2 = setTimeout(() => setStage('ready'), 3500);
    const progInterval = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 0.5 : p));
    }, 30);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(progInterval);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="loading-overlay fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>

      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 animate-ping rounded-full border border-teal-500/20"></div>
        <div className="absolute h-64 w-64 animate-pulse rounded-full border border-teal-500/10"></div>

        <div
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 shadow-[0_0_50px_rgba(20,184,166,0.6)] transition-all duration-500',
            stage === 'condensing' ? 'scale-125' : 'scale-100',
          )}
        >
          <div className="text-xl font-bold text-white">AI</div>
        </div>

        {stage === 'gathering'
          ? dataPoints.map((point) => (
              <div
                key={point.label}
                className="absolute transition-all duration-[2000ms] ease-in-out"
                style={{ transform: `translate(${point.x}px, ${point.y}px)` }}
              >
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                  <div className="h-1 w-1 rounded-full bg-teal-400"></div>
                  {point.label}
                </div>
              </div>
            ))
          : null}

        {stage === 'condensing' ? (
          <div className="absolute -bottom-20 w-64 text-center">
            <p className="animate-pulse font-mono text-xs uppercase tracking-widest text-teal-400">
              Synthesizing Data Streams...
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : null}

        {stage === 'ready' ? (
          <div className="absolute -bottom-20 text-center">
            <p className="text-lg font-bold tracking-tight text-white">Intelligence Ready</p>
            <p className="text-xs font-medium text-teal-500">Analyzing site viability...</p>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-10">
        {rainItems.map((item) => (
          <div
            key={item.id}
            className="loading-overlay-fall absolute font-mono text-[8px] text-teal-500"
            style={{
              left: item.left,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            0101101001
          </div>
        ))}
      </div>
    </div>
  );
}
