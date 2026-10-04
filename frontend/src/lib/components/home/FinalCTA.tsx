import { useReveal } from '$lib/hooks/useReveal';

export interface FinalCTAProps {
  startHref?: string;
}

export default function FinalCTA({ startHref = '/analyze' }: FinalCTAProps) {
  const ref = useReveal();
  return (
    <section aria-labelledby="final-cta-heading" ref={ref}>
      <div className="geo-section !pt-8">
        <div
          className="reveal-init relative isolate overflow-hidden rounded-[1.75rem] border border-[rgba(15,111,104,0.18)] bg-spotcore-accent-soft px-6 py-14 md:px-14 md:py-20"
          data-reveal-child
        >
          <div className="geo-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden="true" />
          <svg
            className="pointer-events-none absolute -right-16 -top-16 -z-10 h-[420px] w-[420px] text-spotcore-accent opacity-[0.14]"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            {[90, 72, 54, 36, 18].map((r) => (
              <circle key={r} cx="100" cy="100" r={r} strokeWidth="1" />
            ))}
            <circle cx="100" cy="100" r="4" fill="currentColor" />
          </svg>

          <div className="max-w-2xl">
            <h2 id="final-cta-heading" className="type-display max-w-[16ch] text-[2.25rem] md:text-[3.25rem]">
              Know what a site is really worth before you invest.
            </h2>
            <p className="type-lead mt-5 max-w-xl text-spotcore-text-lead">
              Use SpotCore to evaluate locations with demand, competition, and demographic insight before
              you sign anything.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href={startHref} className="geo-btn-primary group !px-5 !py-3">
                Analyze a location
                <span className="geo-btn-arrow" aria-hidden="true">→</span>
              </a>
              <a href="#sample-report" className="geo-btn-ghost !px-5 !py-3">
                View sample report
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
