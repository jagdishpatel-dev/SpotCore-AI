import { useReveal } from '$lib/hooks/useReveal';

const quotes = [
  { quote: 'We used to spend two weeks on broker packets. GeoScorer gives us a comparable read in an afternoon.', name: 'Maya Chen', role: 'Director of Development, regional QSR' },
  { quote: 'The report reads like our actual portal—not a marketing mock. That continuity mattered when we rolled it out to franchisees.', name: 'James Okonkwo', role: 'VP Expansion, multi-unit fitness' },
  { quote: 'Finally a site score we can explain: demand, competition, demographics—each with evidence, not a black box.', name: 'Priya Nair', role: 'Principal, retail advisory' },
];

export default function Testimonials() {
  const ref = useReveal({ childStagger: 70 });
  return (
    <section aria-labelledby="testimonials-heading" ref={ref}>
      <div className="geo-section">
        <p className="geo-label">Operators</p>
        <h2 id="testimonials-heading" className="geo-section-title mt-3">Teams evaluating sites with GeoScorer</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <blockquote key={q.name} className="reveal-init geo-card flex h-full flex-col p-5" data-reveal-child>
              <p className="flex-1 text-sm leading-relaxed text-geoscorer-text">&quot;{q.quote}&quot;</p>
              <footer className="mt-5 border-t border-geoscorer-border pt-4">
                <p className="text-sm font-semibold text-geoscorer-text">{q.name}</p>
                <p className="text-xs text-geoscorer-text-muted">{q.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
