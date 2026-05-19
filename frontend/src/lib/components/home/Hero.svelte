<script lang="ts">
  import HeroVisual from './HeroVisual.svelte';

  /** When true, staggered hero items animate in (after intro overlay or immediately on return visits). */
  export let startHref = '/analyze';
  export let revealReady = false;
</script>

<section
  id="hero"
  class="scroll-mt-24 geo-section !pt-12 md:!pt-16 lg:!pt-20"
  class:hero-reveal-ready={revealReady}
  aria-labelledby="hero-headline"
>
  <div class="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-14">
    <div class="max-w-xl md:max-w-[34rem]">
      <span class="hero-reveal-item" style="--reveal-delay: 0ms;">
        <span class="geo-badge">Location intelligence for site decisions</span>
      </span>

      <h1
        id="hero-headline"
        class="hero-reveal-item type-hero mt-6 max-w-[15ch] text-hero-sm sm:max-w-[17ch] md:mt-7 md:text-hero lg:mt-8 lg:text-hero-lg"
        style="--reveal-delay: 110ms;"
      >
        Stop guessing where to grow.
      </h1>

      <p
        class="hero-reveal-item type-lead mt-6 md:mt-7"
        style="--reveal-delay: 220ms;"
      >
        GeoScorer turns scattered location signals into decision-ready site reports, so you can
        evaluate any address with real demand, competition, and demographic fit before you commit.
      </p>

      <div class="hero-reveal-item mt-9 flex flex-wrap items-center gap-3 md:mt-10" style="--reveal-delay: 330ms;">
        <a href={startHref} class="geo-btn-primary">Analyze a location</a>
        <a href="#sample-report" class="geo-btn-ghost">View sample report</a>
      </div>

      <p
        class="hero-reveal-item mt-4 text-sm text-geoscorer-text-muted"
        style="--reveal-delay: 420ms;"
      >
        No credit card.
        <a href="#demo" class="font-normal text-geoscorer-accent underline-offset-2 hover:underline"
          >Try a sample location</a
        >
      </p>
    </div>

    <div class="hero-reveal-item hero-reveal-item--visual" style="--reveal-delay: 480ms;">
      <HeroVisual />
    </div>
  </div>
</section>
