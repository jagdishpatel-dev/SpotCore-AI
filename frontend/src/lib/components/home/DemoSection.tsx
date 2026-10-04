import InteractiveDemoPanel from './InteractiveDemoPanel';
import { useReveal } from '$lib/hooks/useReveal';

export default function DemoSection() {
  const ref = useReveal();

  return (
    <section aria-labelledby="demo-section-heading" ref={ref}>
      <div className="geo-section">
        <div className="reveal-init max-w-3xl" data-reveal-child>
          <p className="geo-label">Live preview</p>
          <h2 id="demo-section-heading" className="geo-section-title mt-4">
            See how a site gets scored
          </h2>
          <p className="geo-section-lead mt-4">
            Try a sample location to see how SpotCore evaluates demand, competition, and fit—no account
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
