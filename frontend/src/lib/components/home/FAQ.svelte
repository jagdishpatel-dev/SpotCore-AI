<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import Accordion, {
    type AccordionItem,
  } from '$lib/components/ui/Accordion.svelte';
  import { reveal } from '$lib/actions/reveal';

  const items: AccordionItem[] = [
    {
      id: 'q1',
      question: 'How is the viability score calculated?',
      answer:
        "We blend signals across four pillars — demand, demographics, competition, and site quality — using a calibrated weighting that emphasises decision-relevant factors. Each input is normalised against comparable trade areas and re-weighted by your business type, so a 'high' score for a coffee shop reflects different evidence than for a fitness studio.",
    },
    {
      id: 'q2',
      question: 'Is this only for retail?',
      answer:
        'No. GeoScore is built for any consumer-facing concept where physical place matters — retail, F&B, fitness, services, healthcare, salons, daycares, and franchise brands. The signal stack is tuned per category so the scoring stays meaningful across formats.',
    },
    {
      id: 'q3',
      question: 'What data sources does GeoScore use?',
      answer:
        'US Census (ACS) demographics and income, OpenStreetMap POI and competition mapping, Google Trends for category demand, mobility-derived foot traffic patterns, web review sentiment, and a proprietary trade-area model. All sources are named in your report.',
    },
    {
      id: 'q4',
      question: 'How accurate is the demand forecast?',
      answer:
        'The 12-month outlook is a directional projection — useful for ranking and risk, not a hard sales forecast. We surface confidence intervals alongside every signal so you can weigh the projection appropriately for the decision.',
    },
    {
      id: 'q5',
      question: 'Can I compare multiple locations?',
      answer:
        'Yes. Run an analysis for each address and you get an apples-to-apples comparison view: scores, drivers, demand outlook, and risks lined up side-by-side so you can defend the pick to a partner, lender, or board.',
    },
  ];
</script>

<section
  class="home-section bg-[var(--bg-surface)]/40 py-24"
  use:reveal
  aria-labelledby="faq-heading"
>
  <div class="mx-auto max-w-3xl px-6 lg:px-10">
    <div class="flex flex-col items-start gap-4">
      <Badge variant="outline">FAQ</Badge>
      <h2
        id="faq-heading"
        class="font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl"
      >
        Common questions
      </h2>
    </div>

    <div class="mt-10">
      <Accordion {items} />
    </div>
  </div>
</section>
