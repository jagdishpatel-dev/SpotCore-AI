import { useReveal } from '$lib/hooks/useReveal';
import { onSpotlightMove } from '$lib/hooks/useSpotlight';
import { cn } from '$lib/utils/cn';

const insights = [
  { title: 'Demand signals', body: 'Foot traffic patterns, category interest, and daypart strength—so you know when the trade area is actually active.', span: 'md:col-span-4' },
  { title: 'Nearby competition', body: 'POI density, brand overlap, and whitespace—mapped to your concept so saturation is visible before you tour.', span: 'md:col-span-2' },
  { title: 'Demographic fit', body: 'Income, age mix, and household composition aligned to your target customer—not generic market averages.', span: 'md:col-span-2' },
  { title: 'Area momentum', body: 'Neighborhood growth, new development, and mobility trends that signal whether demand is building or fading.', span: 'md:col-span-2' },
  { title: 'Site quality factors', body: 'Visibility, access, parking, and co-tenancy cues that affect real-world performance beyond the spreadsheet.', span: 'md:col-span-2' },
  { title: 'Decision-ready summary', body: 'A plain-language verdict with risks, opportunities, and next steps—written for operators, not data scientists.', span: 'md:col-span-6' },
];

/** Tiny bar sparkline for the lead card; purely decorative. */
function DemandBars() {
  const bars = [22, 30, 26, 44, 61, 72, 58, 47, 66, 80, 69, 52];
  return (
    <div className="mt-8 flex h-20 items-end gap-1.5" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn('flex-1 rounded-sm', i === 9 ? 'bg-spotcore-accent' : 'bg-[rgba(15,111,104,0.14)]')}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export default function InsightCategories() {
  const ref = useReveal({ childStagger: 60 });
  return (
    <section id="insights" className="scroll-mt-24" aria-labelledby="insights-heading" ref={ref}>
      <div className="geo-section">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="geo-label">What you get</p>
            <h2 id="insights-heading" className="geo-section-title mt-4 max-w-[18ch]">
              Insight categories in every report
            </h2>
          </div>
          <p className="geo-section-lead md:max-w-sm md:text-right">
            Each section answers a specific question expansion teams ask before committing capital to a site.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-6" onPointerMove={onSpotlightMove}>
          {insights.map((item, i) => (
            <article
              key={item.title}
              className={cn('reveal-init geo-card geo-spotlight group flex flex-col p-6 md:p-7', item.span)}
              data-reveal-child
            >
              <span className="font-mono text-[11px] text-spotcore-text-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-xl text-spotcore-text md:text-[1.375rem]">{item.title}</h3>
              <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-spotcore-text-muted">{item.body}</p>
              {i === 0 ? <DemandBars /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
