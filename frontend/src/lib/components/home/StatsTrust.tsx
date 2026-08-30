import { useReveal } from '$lib/hooks/useReveal';

const stats = [
  { value: '300+', label: 'candidate locations analyzed' },
  { value: '60%', label: 'faster site review cycle' },
  { value: '1', label: 'report for every site decision' },
  { value: '4', label: 'pillars in every site score' },
];

export default function StatsTrust() {
  const ref = useReveal({ childStagger: 60 });
  return (
    <section className="border-y border-spotcore-border bg-spotcore-surface/60" aria-label="Trust metrics" ref={ref}>
      <div className="geo-section !py-8 md:!py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="reveal-init geo-metric-card text-center md:text-left" data-reveal-child>
              <p className="font-sans text-2xl font-medium tabular-nums tracking-tight text-spotcore-accent md:text-3xl">{s.value}</p>
              <p className="mt-1 text-sm text-spotcore-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
