<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  export let startHref = '/analyze';
</script>

<section class="geo-section text-center" aria-labelledby="final-cta-heading" use:reveal>
  <div class="reveal-init mx-auto max-w-2xl" data-reveal-child>
    <h2
      id="final-cta-heading"
      class="type-display mx-auto max-w-[22ch] text-2xl md:text-[1.75rem]"
    >
      Know what a site is really worth before you invest.
    </h2>
    <p class="type-lead mx-auto mt-5 max-w-xl text-geoscorer-text-lead">
      Use GeoScorer to evaluate locations with demand, competition, and demographic insight before
      you sign anything.
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <a href={startHref} class="geo-btn-primary">Analyze a location</a>
      <a href="#sample-report" class="geo-btn-ghost">View sample report</a>
    </div>
  </div>
</section>
