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
    <section className="border-y border-spotcore-border" aria-label="Trust metrics" ref={ref}>
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`reveal-init px-4 py-8 md:px-8 md:py-10 ${i % 2 === 1 ? 'border-l' : ''} ${
              i >= 2 ? 'border-t md:border-t-0' : ''
            } ${i === 2 ? 'md:border-l' : ''} border-spotcore-border`}
            data-reveal-child
          >
            <p className="font-display text-4xl font-semibold tabular-nums tracking-[-0.04em] text-spotcore-text md:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 max-w-[16ch] text-sm leading-snug text-spotcore-text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
