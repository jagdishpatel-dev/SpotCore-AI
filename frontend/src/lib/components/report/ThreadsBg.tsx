
import { useMemo } from 'react';

const seed = 2025;

function rng(i: number) {
  const x = Math.sin(i * 9301 + seed) * 43758.5453;
  return x - Math.floor(x);
}

export interface ThreadsBgProps {
  intensity?: number;
  count?: number;
}

export default function ThreadsBg({ intensity = 0.45, count = 18 }: ThreadsBgProps) {
  const paths = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const yStart = (i / count) * 100 + (rng(i) - 0.5) * 4;
        const amp = 6 + rng(i + 11) * 8;
        const phase = rng(i + 23) * 100;
        return { yStart, amp, phase, key: i };
      }),
    [count],
  );

  return (
    <div className="gs-threads pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `
      radial-gradient(60% 50% at 50% 0%, rgba(15, 111, 104, 0.14), transparent 60%),
      radial-gradient(50% 60% at 90% 30%, rgba(184, 160, 120, 0.16), transparent 60%),
      radial-gradient(40% 40% at 0% 80%, rgba(15, 111, 104, 0.07), transparent 60%)`,
          opacity: intensity,
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full animate-thread-drift"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: intensity }}
      >
        <defs>
          <linearGradient id="gs-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f6f68" stopOpacity="0" />
            <stop offset="50%" stopColor="#0f6f68" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0f6f68" stopOpacity="0" />
          </linearGradient>
        </defs>
        {paths.map((p) => (
          <path
            key={p.key}
            d={`M -5 ${p.yStart} C 25 ${p.yStart - p.amp}, 75 ${p.yStart + p.amp}, 105 ${p.yStart + (p.phase % 2 === 0 ? -2 : 2)}`}
            fill="none"
            stroke="url(#gs-thread-grad)"
            strokeWidth="0.18"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, transparent 60%, var(--bg-base) 100%)',
        }}
      />
    </div>
  );
}
