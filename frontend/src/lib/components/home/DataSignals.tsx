import {
  Building,
  MapPin,
  LineChart,
  Footprints,
  MessageSquare,
  Compass,
  BrainCircuit,
  Telescope,
} from 'lucide-react';
import Badge from '$lib/components/ui/Badge';
import Card from '$lib/components/ui/Card';
import { useReveal } from '$lib/hooks/useReveal';

const sources = [
  { Icon: Building, title: 'US Census', desc: 'Demographics & income' },
  { Icon: MapPin, title: 'OpenStreetMap', desc: 'POI & competition mapping' },
  { Icon: LineChart, title: 'Google Trends', desc: 'Demand patterns' },
  { Icon: Footprints, title: 'Mobility signals', desc: 'Foot traffic behavior' },
  { Icon: MessageSquare, title: 'Web reviews', desc: 'Sentiment & reputation' },
  { Icon: Compass, title: 'Trade-area modeling', desc: 'Customer catchment geometry' },
  { Icon: BrainCircuit, title: 'AI synthesis', desc: 'Cross-signal strategic readout' },
  { Icon: Telescope, title: 'Future outlook', desc: 'Predictive demand signals' },
];

export default function DataSignals() {
  const ref = useReveal({ childStagger: 60 });

  return (
    <section
      className="home-section bg-[var(--bg-surface)]/40 py-24"
      ref={ref}
      aria-labelledby="signals-heading"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline">Under the hood</Badge>
          <h2
            id="signals-heading"
            className="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl"
          >
            Every decision backed by real signals
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-text-secondary md:text-lg">
            We don&apos;t fabricate scores. Every number in your report traces back to a named source —
            open, defensible, and updated continuously.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {sources.map((s) => (
            <div key={s.title} className="reveal-init scale-in" data-reveal-child>
              <Card className="group h-full p-5" interactive>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/60 text-text-secondary transition-colors group-hover:border-geoscorer-accent/40 group-hover:bg-geoscorer-accent-soft group-hover:text-geoscorer-accent">
                    <s.Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-text-primary">{s.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-text-secondary">{s.desc}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
