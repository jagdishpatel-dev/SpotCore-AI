<script lang="ts">
  import Accordion, { type AccordionItem } from '$lib/components/ui/Accordion.svelte';
  import { reveal } from '$lib/actions/reveal';

  const items: AccordionItem[] = [
    {
      id: 'q1',
      question: 'How does GeoScorer calculate a site score?',
      answer:
        'We blend demand, competition, demographic fit, and site-quality signals—normalized for your business type and trade area. Each pillar is weighted for decision relevance, then combined into a single viability score with explainable drivers.',
    },
    {
      id: 'q2',
      question: 'What data sources do you use?',
      answer:
        'US Census demographics, OpenStreetMap POIs, Google Trends category demand, mobility-derived foot traffic, review sentiment, and proprietary trade-area geometry. Sources are named in every report.',
    },
    {
      id: 'q3',
      question: 'Who is GeoScorer for?',
      answer:
        'Retail, restaurant, franchise, clinic, and service brands—and the advisors and brokers who support them—whenever a physical site has to justify rent, buildout, or territory investment.',
    },
    {
      id: 'q4',
      question: 'Can I compare multiple locations?',
      answer:
        'Yes. Run analyses for each address and compare scores, drivers, and risks side by side so stakeholders see an apples-to-apples ranking.',
    },
    {
      id: 'q5',
      question: 'Is this a one-time tool or ongoing?',
      answer:
        'Use GeoScorer for one-off diligence or ongoing expansion workflows. Many teams run every shortlist address through the same report format before IC or franchise review.',
    },
  ];
</script>

<section
  id="faq"
  class="scroll-mt-24 bg-geoscorer-surface-soft"
  aria-labelledby="faq-heading"
  use:reveal
>
  <div class="geo-section">
    <p class="geo-label">FAQ</p>
    <h2 id="faq-heading" class="geo-section-title mt-3">Common questions</h2>
    <div class="mt-8 rounded-2xl border border-geoscorer-border bg-geoscorer-surface px-2 py-1 md:px-4">
      <Accordion {items} />
    </div>
  </div>
</section>
