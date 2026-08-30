import ZoningDemoPanel from './ZoningDemoPanel';
import { useReveal } from '$lib/hooks/useReveal';

export default function ZoningDemoSection() {
  const ref = useReveal();

  return (
    <section aria-labelledby="zoning-demo-heading" ref={ref}>
      <div className="geo-section">
        <div className="reveal-init mx-auto max-w-3xl text-center" data-reveal-child>
          <p className="geo-label">Retrieval-augmented, cited by section</p>
          <h2 id="zoning-demo-heading" className="geo-section-title mt-3">
            Ask what you can actually build
          </h2>
          <p className="mt-3 text-base text-spotcore-text-muted">
            SpotCore reads the real Austin, TX zoning code — not a generic answer. Every claim
            traces back to a section number, and permitted/conditional/prohibited status comes
            from the actual use table, not a guess.
          </p>
        </div>

        <div className="reveal-init mx-auto mt-10 max-w-3xl" data-reveal-child>
          <ZoningDemoPanel />
        </div>
      </div>
    </section>
  );
}
