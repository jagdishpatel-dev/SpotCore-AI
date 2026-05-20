
import GlassCard from './GlassCard';
import Reveal from './Reveal';
import CountUp from './CountUp';
import AccentIcon from './AccentIcon';
import type { CSSProperties } from 'react';
import { cn } from '$lib/utils/cn';
import type { DriverDatum } from '$lib/utils/report';

export interface ScoreDriversProps {
  drivers: DriverDatum[];
}

function toneToText(t: DriverDatum['tone']): string {
  if (t === 'positive') return 'text-positive';
  if (t === 'cyan') return 'text-accent';
  if (t === 'warning') return 'text-warning';
  if (t === 'danger') return 'text-danger';
  return 'text-accent-2';
}

function toneToBg(t: DriverDatum['tone']): string {
  if (t === 'positive') return 'bg-positive';
  if (t === 'cyan') return 'bg-accent';
  if (t === 'warning') return 'bg-warning';
  if (t === 'danger') return 'bg-danger';
  return 'bg-accent-2';
}

function driverIcon(key: DriverDatum['key']) {
  if (key === 'demand') return 'chart';
  if (key === 'demographic_fit') return 'people';
  if (key === 'competition') return 'storefront';
  if (key === 'accessibility') return 'transit';
  if (key === 'cost_fit') return 'tag';
  return 'sparkle';
}

export default function ScoreDrivers({ drivers }: ScoreDriversProps) {
  return (
    <section className="px-2">
      <Reveal y={14} duration={520}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-accent">
              <AccentIcon name="chart" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-ink md:text-xl">Score drivers</h2>
          </div>
          <p className="hidden text-sm text-muted md:block">Why the score landed where it did.</p>
        </div>
      </Reveal>

      <Reveal y={16} duration={560} delay={80}>
        <GlassCard tone="neutral" padded={false}>
          <div className="grid gap-px overflow-hidden rounded-[22px] bg-line/40 sm:grid-cols-2 lg:grid-cols-6">
            {drivers.map((d, i) => (
              <div
                key={d.key}
                className="group flex flex-col gap-3 bg-surface p-5 transition-colors duration-200 hover:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <p className="gs-label text-muted-2">{d.label}</p>
                  <span className={toneToText(d.tone)}>
                    <AccentIcon name={driverIcon(d.key)} size={14} />
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className={cn('gs-num text-[28px] font-semibold leading-none', toneToText(d.tone))}>
                    <CountUp to={Math.round(d.value)} duration={900} />
                  </span>
                  <span className="gs-num text-xs text-muted-2">/ 100</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className={cn(
                      'score-drivers-fill absolute inset-y-0 left-0 origin-left rounded-full',
                      toneToBg(d.tone),
                    )}
                    style={
                      {
                        '--gs-target': `${Math.max(0, Math.min(100, d.value))}%`,
                        '--gs-delay': `${i * 60 + 120}ms`,
                      } as CSSProperties
                    }
                  ></div>
                </div>
                <p className="text-xs leading-snug text-muted">{d.hint}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
