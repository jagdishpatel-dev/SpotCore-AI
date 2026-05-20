import { X, Check } from 'lucide-react';
import Badge from '$lib/components/ui/Badge';
import { useReveal } from '$lib/hooks/useReveal';

const oldWay = [
  'Rely on gut instinct',
  'Trust the broker narrative',
  'Discover problems after signing',
  'No data on demand or competition',
];

const newWay = [
  'Demand + competition + demographics in one report',
  'AI strategic readout tells you what it means',
  'Know the risk before you invest',
  'Evaluate multiple locations fast',
];

export default function OldVsNew() {
  const leftRef = useReveal({ delay: 0 });
  const rightRef = useReveal({ delay: 200 });

  return (
    <section
      className="home-section relative overflow-hidden bg-[var(--bg-surface)]/40 py-24"
      aria-labelledby="oldvsnew-heading"
    >
      <h2 id="oldvsnew-heading" className="sr-only">
        The Old Way vs The New Way
      </h2>

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-0">
          <div
            ref={leftRef}
            className="reveal-init from-left relative md:pr-10 lg:pr-14"
          >
            <div className="rounded-3xl border border-danger/15 bg-gradient-to-br from-danger/10 via-[var(--bg-surface-2)] to-transparent p-8 lg:p-10">
              <Badge variant="destructive">Before GeoScore</Badge>
              <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl">
                Guesswork and broker hunch
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
                The old playbook: a glossy pitch deck, a confident handshake, and a decision made on
                instinct.
              </p>
              <ul className="mt-7 space-y-3">
                {oldWay.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-danger/25 bg-danger/12 text-danger">
                      <X className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-[1.55] text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            aria-hidden="true"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full border border-accent-cyan/40 bg-[var(--bg-base)] font-display text-sm font-bold tracking-wider text-accent-cyan shadow-[0_0_0_6px_rgba(34,211,238,0.06),0_24px_60px_-20px_rgba(34,211,238,0.45)]">
              VS
            </span>
          </div>

          <div
            ref={rightRef}
            className="reveal-init from-right relative md:pl-10 lg:pl-14"
          >
            <div className="rounded-3xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/10 via-[var(--bg-surface-2)] to-transparent p-8 lg:p-10">
              <Badge variant="success">With GeoScore</Badge>
              <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl">
                Data-backed location decisions
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
                Every signal that matters, on every address you&apos;re considering — translated into a
                clear answer.
              </p>
              <ul className="mt-7 space-y-3">
                {newWay.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-accent-cyan/30 bg-accent-cyan/12 text-accent-cyan">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-[1.55] text-text-primary/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
