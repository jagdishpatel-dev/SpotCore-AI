import { useReveal } from '$lib/hooks/useReveal';

const insights = [
  { title: 'Demand signals', body: 'Foot traffic patterns, category interest, and daypart strength—so you know when the trade area is actually active.' },
  { title: 'Nearby competition', body: 'POI density, brand overlap, and whitespace—mapped to your concept so saturation is visible before you tour.' },
  { title: 'Demographic fit', body: 'Income, age mix, and household composition aligned to your target customer—not generic market averages.' },
  { title: 'Area momentum', body: 'Neighborhood growth, new development, and mobility trends that signal whether demand is building or fading.' },
  { title: 'Site quality factors', body: 'Visibility, access, parking, and co-tenancy cues that affect real-world performance beyond the spreadsheet.' },
  { title: 'Decision-ready summary', body: 'A plain-language verdict with risks, opportunities, and next steps—written for operators, not data scientists.' },
];

export default function InsightCategories() {
  const ref = useReveal({ childStagger: 50 });
  return (
    <section id="insights" className="scroll-mt-24" aria-labelledby="insights-heading" ref={ref}>
      <div className="geo-section">
        <p className="geo-label">What you get</p>
        <h2 id="insights-heading" className="geo-section-title mt-3">Insight categories in every report</h2>
        <p className="mt-3 max-w-2xl text-base text-spotcore-text-muted">
          Each section answers a specific question expansion teams ask before committing capital to a site.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((item) => (
            <article key={item.title} className="reveal-init geo-card group p-5" data-reveal-child>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-spotcore-accent" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-semibold text-spotcore-text">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-spotcore-text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
