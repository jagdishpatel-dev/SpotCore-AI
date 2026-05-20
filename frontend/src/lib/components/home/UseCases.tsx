import { useReveal } from '$lib/hooks/useReveal';

export interface UseCasesProps { startHref?: string; }

const cases = [
  { title: 'Retail & restaurants', body: 'Validate foot traffic, daypart demand, and competitive whitespace before you sign a lease on a high-rent corner.' },
  { title: 'Franchises', body: 'Compare territories and candidate sites with consistent scoring so franchisees get a fair, data-backed story.' },
  { title: 'Clinics & services', body: 'Match demographic fit and drive-time catchments for appointment-based concepts where location drives volume.' },
  { title: 'Advisors & brokers', body: 'Package location evidence into reports clients can understand—without rebuilding analysis for every pitch.' },
];

export default function UseCases({ startHref = '/analyze' }: UseCasesProps) {
  const ref = useReveal({ childStagger: 70 });
  return (
    <section id="use-cases" className="scroll-mt-24" aria-labelledby="usecases-heading" ref={ref}>
      <div className="geo-section">
        <p className="geo-label">Who uses GeoScorer</p>
        <h2 id="usecases-heading" className="geo-section-title mt-3">Built for site decisions, not slide decks</h2>
        <p className="mt-3 max-w-2xl text-base text-geoscorer-text-muted">
          Operators and advisors use GeoScorer when a physical address has to earn its place on the P&amp;L.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <article key={c.title} className="reveal-init geo-card p-5" data-reveal-child>
              <h3 className="text-lg font-semibold text-geoscorer-text">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-geoscorer-text-muted">{c.body}</p>
              <a href={startHref} className="mt-4 inline-block text-sm font-semibold text-geoscorer-accent hover:text-geoscorer-accent-2">Start analyzing →</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
