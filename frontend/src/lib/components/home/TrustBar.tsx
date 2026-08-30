import { Building2, Layers, BrainCircuit, Zap } from 'lucide-react';
import { useReveal } from '$lib/hooks/useReveal';

const items = [
  { Icon: Building2, label: 'Built for operators & expansion teams' },
  { Icon: Layers, label: 'Mobility, market, and demographic signals' },
  { Icon: BrainCircuit, label: 'Strategic AI readouts beyond raw scores' },
  { Icon: Zap, label: 'Decision-ready analysis in minutes' },
];

export default function TrustBar() {
  const ref = useReveal({ childStagger: 80 });
  return (
    <section className="home-section relative border-y border-[var(--border-soft)] bg-[var(--bg-surface)]/40" ref={ref} aria-label="Trust signals">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-stretch divide-[var(--border-soft)] px-6 py-6 md:grid-cols-4 md:divide-x md:py-5 lg:px-10">
        {items.map((item) => (
          <div key={item.label} className="reveal-init flex items-center justify-center gap-2.5 px-2 py-3 md:px-6" data-reveal-child>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-spotcore-accent/25 bg-spotcore-accent-soft text-spotcore-accent">
              <item.Icon className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium leading-tight text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
