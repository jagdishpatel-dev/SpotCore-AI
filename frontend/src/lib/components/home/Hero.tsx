import { Link } from 'react-router-dom';
import BlurText from '$lib/components/ui/BlurText';
import { cn } from '$lib/utils/cn';

export interface HeroProps {
  startHref?: string;
  heroRevealReady?: boolean;
}

const checks = [
  { label: 'Zoning district', value: 'GR · Community Commercial' },
  { label: 'Use category', value: 'Restaurant, limited' },
  { label: 'Overlays', value: 'ETOD · no added limit' },
];

function revealDelay(ms: number) {
  return { '--reveal-delay': `${ms}ms` } as React.CSSProperties;
}

export default function Hero({
  startHref = '/analyze',
  heroRevealReady = false,
}: HeroProps) {
  return (
    <section
      id="hero"
      className={cn('relative isolate scroll-mt-24 overflow-hidden', heroRevealReady && 'hero-reveal-ready')}
      aria-labelledby="hero-headline"
    >
      <div className="geo-grid-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(15,111,104,0.16), transparent 65%)' }}
        aria-hidden="true"
      />

      <div className="geo-section grid items-center gap-14 !pb-20 !pt-14 md:!pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:!pb-28 lg:!pt-24">
        <div>
          <div className="hero-reveal-item" style={revealDelay(0)}>
            <span className="geo-badge">
              <span className="geo-badge__dot" aria-hidden="true" />
              Zoning pre-screen · live for Austin, TX
            </span>
          </div>

          <h1 id="hero-headline" className="mt-7 md:mt-8">
            <BlurText
              text="Stop guessing where to grow."
              animateBy="words"
              direction="bottom"
              delay={110}
              stepDuration={0.35}
              start={heroRevealReady}
              className="type-hero max-w-[7.6em] !justify-start text-[2.9rem] sm:text-hero-lg lg:text-hero-2xl"
            />
          </h1>

          <p className="hero-reveal-item type-lead mt-7 max-w-[34rem] md:text-[1.1875rem]" style={revealDelay(220)}>
            Enter an address and a business type. SpotCore returns the zoning district, the likely
            permission status, and the code sections behind it—before you sign a lease.
          </p>

          <div className="hero-reveal-item mt-9 flex flex-wrap items-center gap-3" style={revealDelay(320)}>
            <a href={startHref} className="geo-btn-primary group !px-5 !py-3">
              Analyze a location
              <span className="geo-btn-arrow" aria-hidden="true">→</span>
            </a>
            <Link to="/sample" className="geo-btn-ghost !px-5 !py-3">
              View sample report
            </Link>
          </div>

          <p className="hero-reveal-item mt-5 text-sm text-spotcore-text-muted" style={revealDelay(400)}>
            No account needed.{' '}
            <a href="#demo" className="geo-link">
              Try a sample address
            </a>
          </p>
        </div>

        <aside
          className="hero-reveal-item relative mx-auto w-full max-w-md lg:max-w-none"
          style={revealDelay(260)}
          aria-label="Example pre-screen result"
        >
          <div
            className="absolute -inset-x-4 -bottom-4 top-6 -z-10 rotate-[-2deg] rounded-[1.75rem] border border-spotcore-border bg-spotcore-surface-soft"
            aria-hidden="true"
          />
          <div className="geo-card overflow-hidden !rounded-[1.5rem] shadow-gs-hero hover:!translate-y-0">
            <div className="flex items-center justify-between border-b border-spotcore-border px-5 py-3.5">
              <span className="font-mono text-[11px] text-spotcore-text-muted">Example pre-screen</span>
              <span className="rounded-md bg-spotcore-surface-soft px-2 py-0.5 font-mono text-[11px] text-spotcore-text-lead">
                Preliminary
              </span>
            </div>

            <div className="px-5 pb-5 pt-5">
              <p className="text-sm text-spotcore-text-muted">Coffee shop at</p>
              <p className="mt-0.5 font-display text-xl font-semibold tracking-[-0.025em] text-spotcore-text">
                1847 S Lamar Blvd, Austin
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[rgba(47,125,79,0.22)] bg-[rgba(47,125,79,0.07)] px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-positive text-white" aria-hidden="true">
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-spotcore-text">Likely permitted</p>
                  <p className="text-xs text-spotcore-text-muted">By right, subject to site plan review</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] text-spotcore-text-muted">Confidence</p>
                  <p className="font-mono text-sm font-medium text-spotcore-text">High</p>
                </div>
              </div>

              <dl className="mt-4 divide-y divide-spotcore-border">
                {checks.map((c) => (
                  <div key={c.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-[13px] text-spotcore-text-muted">{c.label}</dt>
                    <dd className="text-right text-[13px] font-medium text-spotcore-text">{c.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-3 flex items-center gap-2 font-mono text-[11px] text-spotcore-accent">
                <span className="h-px w-4 bg-current opacity-60" aria-hidden="true" />
                Austin LDC §25-2-491 · use table
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
