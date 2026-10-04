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
        <p className="geo-label">Who uses SpotCore</p>
        <h2 id="usecases-heading" className="geo-section-title mt-4 max-w-[20ch]">
          Built for site decisions, not slide decks
        </h2>
        <p className="geo-section-lead mt-4">
          Operators and advisors use SpotCore when a physical address has to earn its place on the P&amp;L.
        </p>

        <ul className="mt-12 border-t border-spotcore-border">
          {cases.map((c, i) => (
            <li key={c.title} className="reveal-init border-b border-spotcore-border" data-reveal-child>
              <a
                href={startHref}
                className="group grid gap-2 py-7 transition-colors md:grid-cols-[64px_minmax(0,0.9fr)_minmax(0,1.3fr)_auto] md:items-baseline md:gap-8"
              >
                <span className="font-mono text-xs text-spotcore-text-muted">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-xl text-spotcore-text transition-colors group-hover:text-spotcore-accent md:text-2xl">
                  {c.title}
                </h3>
                <p className="max-w-[52ch] text-[15px] leading-relaxed text-spotcore-text-muted">{c.body}</p>
                <span
                  className="hidden text-sm font-medium text-spotcore-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 md:inline"
                  aria-hidden="true"
                >
                  Start →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
