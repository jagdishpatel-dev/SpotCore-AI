import { useReveal } from '$lib/hooks/useReveal';

const steps = [
  { n: '01', title: 'Describe the site', body: 'Enter an address, business type, and trade area. SpotCore frames the decision you are about to make.' },
  { n: '02', title: 'We analyze local signals', body: 'Demand, competition, demographics, and mobility patterns are pulled and normalized for your category.' },
  { n: '03', title: 'We compute a site score', body: 'Signals roll into a calibrated viability score with drivers you can explain to partners and lenders.' },
  { n: '04', title: 'You decide with confidence', body: 'Export a decision-ready report—or compare multiple addresses side by side before you sign.' },
];

export default function HowItWorks() {
  const ref = useReveal({ childStagger: 90 });
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-spotcore-surface-soft" aria-labelledby="how-heading" ref={ref}>
      <div className="geo-section grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="geo-label">Process</p>
          <h2 id="how-heading" className="geo-section-title mt-4">How SpotCore works</h2>
          <p className="geo-section-lead mt-4">
            From address to actionable site report in minutes—not weeks of broker calls and spreadsheets.
          </p>
        </div>

        <ol className="relative">
          <span className="absolute bottom-6 left-[19px] top-6 w-px bg-spotcore-border" aria-hidden="true" />
          {steps.map((step) => (
            <li key={step.n} className="reveal-init relative grid grid-cols-[40px_minmax(0,1fr)] gap-5 pb-10 last:pb-0" data-reveal-child>
              <span className="relative z-[1] grid h-10 w-10 place-items-center rounded-full border border-spotcore-border bg-spotcore-surface font-mono text-xs text-spotcore-accent">
                {step.n}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl text-spotcore-text md:text-[1.375rem]">{step.title}</h3>
                <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-spotcore-text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
