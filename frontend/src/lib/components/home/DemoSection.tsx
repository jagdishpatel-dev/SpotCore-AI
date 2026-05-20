import InteractiveDemoPanel from './InteractiveDemoPanel';
import { useReveal } from '$lib/hooks/useReveal';

export default function DemoSection() {
  const ref = useReveal();

  return (
    <section aria-labelledby="demo-section-heading" ref={ref}>
      <div className="geo-section">
        <div className="reveal-init mx-auto max-w-3xl text-center" data-reveal-child>
          <p className="geo-label">Live preview</p>
          <h2 id="demo-section-heading" className="geo-section-title mt-3">
            See how a site gets scored
          </h2>
          <p className="mt-3 text-base text-geoscorer-text-muted">
            Try a sample location to see how GeoScorer evaluates demand, competition, and fit—no account
            required.
          </p>
        </div>

        <div className="reveal-init mt-10" data-reveal-child>
          <InteractiveDemoPanel />
        </div>
      </div>
    </section>
  );
}
