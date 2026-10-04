import Accordion, { type AccordionItem } from '$lib/components/ui/Accordion';
import { useReveal } from '$lib/hooks/useReveal';

const items: AccordionItem[] = [
  { id: 'q1', question: 'How does SpotCore calculate a site score?', answer: 'We blend demand, competition, demographic fit, and site-quality signals—normalized for your business type and trade area. Each pillar is weighted for decision relevance, then combined into a single viability score with explainable drivers.' },
  { id: 'q2', question: 'What data sources do you use?', answer: 'US Census demographics, OpenStreetMap POIs, Google Trends category demand, mobility-derived foot traffic, review sentiment, and proprietary trade-area geometry. Sources are named in every report.' },
  { id: 'q3', question: 'Who is SpotCore for?', answer: 'Retail, restaurant, franchise, clinic, and service brands—and the advisors and brokers who support them—whenever a physical site has to justify rent, buildout, or territory investment.' },
  { id: 'q4', question: 'Can I compare multiple locations?', answer: 'Yes. Run analyses for each address and compare scores, drivers, and risks side by side so stakeholders see an apples-to-apples ranking.' },
  { id: 'q5', question: 'Is this a one-time tool or ongoing?', answer: 'Use SpotCore for one-off diligence or ongoing expansion workflows. Many teams run every shortlist address through the same report format before IC or franchise review.' },
];

export default function FAQ() {
  const ref = useReveal();
  return (
    <section id="faq" className="scroll-mt-24 bg-spotcore-surface-soft" aria-labelledby="faq-heading" ref={ref}>
      <div className="geo-section grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="geo-label">FAQ</p>
          <h2 id="faq-heading" className="geo-section-title mt-4">Common questions</h2>
          <p className="geo-section-lead mt-4">
            Something else on your mind? Run a sample address and read the report—every source is named inside.
          </p>
        </div>
        <Accordion items={items} className="border-y border-spotcore-border" />
      </div>
    </section>
  );
}
