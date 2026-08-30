import { useReveal } from '$lib/hooks/useReveal';

const steps = [
  { n: '01', title: 'Describe the site', body: 'Enter an address, business type, and trade area. SpotCore frames the decision you are about to make.' },
  { n: '02', title: 'We analyze local signals', body: 'Demand, competition, demographics, and mobility patterns are pulled and normalized for your category.' },
  { n: '03', title: 'We compute a site score', body: 'Signals roll into a calibrated viability score with drivers you can explain to partners and lenders.' },
  { n: '04', title: 'You decide with confidence', body: 'Export a decision-ready report—or compare multiple addresses side by side before you sign.' },
];

export default function HowItWorks() {
  const ref = useReveal({ childStagger: 80 });
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-spotcore-surface-soft" aria-labelledby="how-heading" ref={ref}>
      <div className="geo-section">
        <p className="geo-label">Process</p>
        <h2 id="how-heading" className="geo-section-title mt-3">How SpotCore works</h2>
        <p className="mt-3 max-w-xl text-base text-spotcore-text-muted">
          From address to actionable site report in minutes—not weeks of broker calls and spreadsheets.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.n} className="reveal-init geo-card p-5 hover:!translate-y-0" data-reveal-child>
              <p className="font-sans text-sm font-medium tabular-nums text-spotcore-accent">{step.n}</p>
              <h3 className="mt-3 text-lg font-medium tracking-heading text-spotcore-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-spotcore-text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
