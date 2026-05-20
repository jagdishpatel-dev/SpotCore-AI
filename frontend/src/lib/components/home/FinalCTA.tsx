import { useReveal } from '$lib/hooks/useReveal';

export interface FinalCTAProps {
  startHref?: string;
}

export default function FinalCTA({ startHref = '/analyze' }: FinalCTAProps) {
  const ref = useReveal();
  return (
    <section className="geo-section text-center" aria-labelledby="final-cta-heading" ref={ref}>
      <div className="reveal-init mx-auto max-w-2xl" data-reveal-child>
        <h2 id="final-cta-heading" className="type-display mx-auto max-w-[22ch] text-2xl md:text-[1.75rem]">
          Know what a site is really worth before you invest.
        </h2>
        <p className="type-lead mx-auto mt-5 max-w-xl text-geoscorer-text-lead">
          Use GeoScorer to evaluate locations with demand, competition, and demographic insight before
          you sign anything.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href={startHref} className="geo-btn-primary">Analyze a location</a>
          <a href="#sample-report" className="geo-btn-ghost">View sample report</a>
        </div>
      </div>
    </section>
  );
}
