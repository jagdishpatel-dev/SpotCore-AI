import { useReveal } from '$lib/hooks/useReveal';

export interface SampleReportProps {
  startHref?: string;
}

const metrics = [
  { label: 'Demand outlook', value: '72', bar: 72 },
  { label: 'Competition pressure', value: '48', bar: 48 },
  { label: 'Income fit', value: '81', bar: 81 },
];

export default function SampleReport({ startHref = '/analyze' }: SampleReportProps) {
  const ref = useReveal();

  return (
    <section
      id="sample-report"
      className="scroll-mt-24 bg-geoscorer-surface-soft"
      aria-labelledby="sample-report-heading"
      ref={ref}
    >
      <div className="geo-section">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <article className="reveal-init geo-card overflow-hidden shadow-gs-hero" data-reveal-child>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-geoscorer-border bg-geoscorer-surface px-4 py-3 md:px-5">
              <div>
                <p className="text-sm font-semibold text-geoscorer-text">South Lamar — Fast casual</p>
                <p className="text-xs text-geoscorer-text-muted">1847 S Lamar Blvd, Austin, TX</p>
              </div>
              <span className="rounded-full bg-geoscorer-accent-soft px-3 py-1 text-xs font-semibold text-geoscorer-accent">
                78 · Strong
              </span>
            </header>

            <div className="space-y-4 p-4 md:p-5">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between text-xs text-geoscorer-text-muted">
                    <span>{m.label}</span>
                    <span className="font-sans font-medium tabular-nums text-geoscorer-text">{m.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-geoscorer-surface-soft">
                    <span
                      className="block h-full rounded-full bg-geoscorer-accent"
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-geoscorer-border bg-geoscorer-surface-soft p-3">
                <p className="geo-label !normal-case !tracking-normal">Strategic readout</p>
                <p className="mt-2 text-sm leading-relaxed text-geoscorer-text">
                  Strong lunch-day demand with moderate competition. Demographics skew young professional—well
                  aligned for fast casual with room to differentiate on evening dayparts.
                </p>
              </div>
            </div>
          </article>

          <div className="reveal-init from-right" data-reveal-child>
            <p className="geo-label">Sample report</p>
            <h2 id="sample-report-heading" className="geo-section-title mt-3">
              The same UI you get after analysis
            </h2>
            <p className="mt-4 text-base leading-relaxed text-geoscorer-text-muted">
              Every GeoScorer run produces a structured site report: viability score, pillar drivers,
              demand outlook, competition map context, and an AI strategic summary your team can share.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-geoscorer-text">
              <li className="flex gap-2">
                <span className="text-geoscorer-accent">—</span>
                Defend lease decisions to partners and lenders
              </li>
              <li className="flex gap-2">
                <span className="text-geoscorer-accent">—</span>
                Rank shortlists with comparable scores
              </li>
              <li className="flex gap-2">
                <span className="text-geoscorer-accent">—</span>
                Spot risks before capital is deployed
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={startHref} className="geo-btn-primary">
                Analyze a location
              </a>
              <a href="#demo" className="geo-btn-ghost">
                View live demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
