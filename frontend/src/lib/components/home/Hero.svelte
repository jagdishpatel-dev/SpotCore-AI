<script lang="ts">
  import BlurText from '$lib/components/ui/BlurText.svelte';

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
  <div class="mx-auto max-w-3xl text-center">
    <div class="hero-reveal-item flex justify-center" style="--reveal-delay: 0ms;">
      <span class="geo-badge">Location intelligence for site decisions</span>
    </div>

    <h1
      id="hero-headline"
      class="mx-auto mt-6 max-w-[16ch] sm:max-w-[20ch] md:mt-8 md:max-w-none lg:mt-9"
    >
      <BlurText
        text="Stop guessing where to grow."
        animateBy="words"
        direction="bottom"
        delay={120}
        stepDuration={0.35}
        start={revealReady}
        className="type-hero text-hero-sm sm:text-hero md:text-hero-lg lg:text-hero-xl"
      />
    </h1>

    <p
      class="hero-reveal-item type-lead mx-auto mt-6 md:mt-7"
      style="--reveal-delay: 220ms;"
    >
      Decision-ready site reports from real demand, competition, and demographic data—before you sign a lease.
    </p>

    <div
      class="hero-reveal-item mt-9 flex flex-wrap items-center justify-center gap-3 md:mt-10"
      style="--reveal-delay: 330ms;"
    >
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
</section>
