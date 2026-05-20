import BlurText from '$lib/components/ui/BlurText';
import { cn } from '$lib/utils/cn';

export interface HeroProps {
  startHref?: string;
  heroRevealReady?: boolean;
}

export default function Hero({
  startHref = '/analyze',
  heroRevealReady = false,
}: HeroProps) {
  return (
    <section
      id="hero"
      className={cn(
        'scroll-mt-24 geo-section !pt-12 md:!pt-16 lg:!pt-20',
        heroRevealReady && 'hero-reveal-ready',
      )}
      aria-labelledby="hero-headline"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="hero-reveal-item flex justify-center" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
          <span className="geo-badge">Location intelligence for site decisions</span>
        </div>

        <h1
          id="hero-headline"
          className="mx-auto mt-6 max-w-[16ch] sm:max-w-[20ch] md:mt-8 md:max-w-none lg:mt-9"
        >
          <BlurText
            text="Stop guessing where to grow."
            animateBy="words"
            direction="bottom"
            delay={120}
            stepDuration={0.35}
            start={heroRevealReady}
            className="type-hero text-hero-sm sm:text-hero md:text-hero-lg lg:text-hero-xl"
          />
        </h1>

        <p
          className="hero-reveal-item type-lead mx-auto mt-6 md:mt-7"
          style={{ '--reveal-delay': '220ms' } as React.CSSProperties}
        >
          Decision-ready site reports from real demand, competition, and demographic data—before you sign a lease.
        </p>

        <div
          className="hero-reveal-item mt-9 flex flex-wrap items-center justify-center gap-3 md:mt-10"
          style={{ '--reveal-delay': '330ms' } as React.CSSProperties}
        >
          <a href={startHref} className="geo-btn-primary">
            Analyze a location
          </a>
          <a href="#sample-report" className="geo-btn-ghost">
            View sample report
          </a>
        </div>

        <p
          className="hero-reveal-item mt-4 text-sm text-geoscorer-text-muted"
          style={{ '--reveal-delay': '420ms' } as React.CSSProperties}
        >
          No credit card.{' '}
          <a href="#demo" className="font-normal text-geoscorer-accent underline-offset-2 hover:underline">
            Try a sample location
          </a>
        </p>
      </div>
    </section>
  );
}
