<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  export let startHref = '/analyze';

  const metrics = [
    { label: 'Demand outlook', value: '72', bar: 72 },
    { label: 'Competition pressure', value: '48', bar: 48 },
    { label: 'Income fit', value: '81', bar: 81 },
  ];
</script>

<section id="sample-report" class="scroll-mt-24 bg-geoscorer-surface-soft" aria-labelledby="sample-report-heading" use:reveal>
  <div class="geo-section">
    <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      <!-- Portal-like preview -->
      <article class="reveal-init geo-card overflow-hidden shadow-gs-hero" data-reveal-child>
        <header class="flex flex-wrap items-center justify-between gap-3 border-b border-geoscorer-border bg-geoscorer-surface px-4 py-3 md:px-5">
          <div>
            <p class="text-sm font-semibold text-geoscorer-text">South Lamar — Fast casual</p>
            <p class="text-xs text-geoscorer-text-muted">1847 S Lamar Blvd, Austin, TX</p>
          </div>
          <span class="rounded-full bg-geoscorer-accent-soft px-3 py-1 text-xs font-semibold text-geoscorer-accent">
            78 · Strong
          </span>
        </header>

        <div class="space-y-4 p-4 md:p-5">
          {#each metrics as m}
            <div>
              <div class="flex items-center justify-between text-xs text-geoscorer-text-muted">
                <span>{m.label}</span>
                <span class="font-display font-semibold text-geoscorer-text">{m.value}</span>
              </div>
              <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-geoscorer-surface-soft">
                <span class="block h-full rounded-full bg-geoscorer-accent" style="width: {m.bar}%"></span>
              </div>
            </div>
          {/each}

          <div class="rounded-xl border border-geoscorer-border bg-geoscorer-surface-soft p-3">
            <p class="geo-label !normal-case !tracking-normal">Strategic readout</p>
            <p class="mt-2 text-sm leading-relaxed text-geoscorer-text">
              Strong lunch-day demand with moderate competition. Demographics skew young professional—well
              aligned for fast casual with room to differentiate on evening dayparts.
            </p>
          </div>
        </div>
      </article>

      <div class="reveal-init from-right" data-reveal-child>
        <p class="geo-label">Sample report</p>
        <h2 id="sample-report-heading" class="geo-section-title mt-3">
          The same UI you get after analysis
        </h2>
        <p class="mt-4 text-base leading-relaxed text-geoscorer-text-muted">
          Every GeoScorer run produces a structured site report: viability score, pillar drivers,
          demand outlook, competition map context, and an AI strategic summary your team can share.
        </p>
        <ul class="mt-6 space-y-3 text-sm text-geoscorer-text">
          <li class="flex gap-2">
            <span class="text-geoscorer-accent">—</span>
            Defend lease decisions to partners and lenders
          </li>
          <li class="flex gap-2">
            <span class="text-geoscorer-accent">—</span>
            Rank shortlists with comparable scores
          </li>
          <li class="flex gap-2">
            <span class="text-geoscorer-accent">—</span>
            Spot risks before capital is deployed
          </li>
        </ul>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href={startHref} class="geo-btn-primary">Analyze a location</a>
          <a href="#demo" class="geo-btn-ghost">View live demo</a>
        </div>
      </div>
    </div>
  </div>
</section>
