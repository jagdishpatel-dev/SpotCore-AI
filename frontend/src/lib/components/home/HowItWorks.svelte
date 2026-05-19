<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const steps = [
    {
      n: '01',
      title: 'Describe the site',
      body: 'Enter an address, business type, and trade area. GeoScorer frames the decision you are about to make.',
    },
    {
      n: '02',
      title: 'We analyze local signals',
      body: 'Demand, competition, demographics, and mobility patterns are pulled and normalized for your category.',
    },
    {
      n: '03',
      title: 'We compute a site score',
      body: 'Signals roll into a calibrated viability score with drivers you can explain to partners and lenders.',
    },
    {
      n: '04',
      title: 'You decide with confidence',
      body: 'Export a decision-ready report—or compare multiple addresses side by side before you sign.',
    },
  ];
</script>

<section
  id="how-it-works"
  class="scroll-mt-24 bg-geoscorer-surface-soft"
  aria-labelledby="how-heading"
  use:reveal={{ childStagger: 80 }}
>
  <div class="geo-section">
    <p class="geo-label">Process</p>
    <h2 id="how-heading" class="geo-section-title mt-3">How GeoScorer works</h2>
    <p class="mt-3 max-w-xl text-base text-geoscorer-text-muted">
      From address to actionable site report in minutes—not weeks of broker calls and spreadsheets.
    </p>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {#each steps as step}
        <article class="reveal-init geo-card p-5 hover:!translate-y-0" data-reveal-child>
          <p class="font-sans text-sm font-medium tabular-nums text-geoscorer-accent">{step.n}</p>
          <h3 class="mt-3 text-lg font-medium tracking-heading text-geoscorer-text">{step.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-geoscorer-text-muted">{step.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>
