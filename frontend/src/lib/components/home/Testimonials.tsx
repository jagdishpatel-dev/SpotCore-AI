import { useReveal } from '$lib/hooks/useReveal';

const quotes = [
  { quote: 'We used to spend two weeks on broker packets. SpotCore gives us a comparable read in an afternoon.', name: 'Maya Chen', role: 'Director of Development, regional QSR' },
  { quote: 'The report reads like our actual portal—not a marketing mock. That continuity mattered when we rolled it out to franchisees.', name: 'James Okonkwo', role: 'VP Expansion, multi-unit fitness' },
  { quote: 'Finally a site score we can explain: demand, competition, demographics—each with evidence, not a black box.', name: 'Priya Nair', role: 'Principal, retail advisory' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('');
}

function Attribution({ name, role }: { name: string; role: string }) {
  return (
    <footer className="flex items-center gap-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-spotcore-accent-soft font-mono text-xs font-medium text-spotcore-accent"
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      <div>
        <p className="text-sm font-semibold text-spotcore-text">{name}</p>
        <p className="text-xs text-spotcore-text-muted">{role}</p>
      </div>
    </footer>
  );
}

export default function Testimonials() {
  const ref = useReveal({ childStagger: 80 });
  const [featured, ...rest] = quotes;
  return (
    <section aria-labelledby="testimonials-heading" ref={ref}>
      <div className="geo-section">
        <p className="geo-label">Operators</p>
        <h2 id="testimonials-heading" className="geo-section-title mt-4 max-w-[20ch]">
          Teams evaluating sites with SpotCore
        </h2>

        <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <blockquote className="reveal-init geo-card flex flex-col justify-between gap-10 p-7 hover:!translate-y-0 md:p-10" data-reveal-child>
            <p className="font-display text-2xl font-medium leading-[1.25] tracking-[-0.025em] text-spotcore-text md:text-[2rem]">
              <span className="text-spotcore-accent">“</span>
              {featured.quote}
              <span className="text-spotcore-accent">”</span>
            </p>
            <Attribution name={featured.name} role={featured.role} />
          </blockquote>

          <div className="grid gap-4">
            {rest.map((q) => (
              <blockquote key={q.name} className="reveal-init geo-card flex flex-col gap-6 p-6 hover:!translate-y-0" data-reveal-child>
                <p className="text-[15px] leading-relaxed text-spotcore-text">“{q.quote}”</p>
                <Attribution name={q.name} role={q.role} />
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
