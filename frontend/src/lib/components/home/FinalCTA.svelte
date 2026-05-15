<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { reveal } from '$lib/actions/reveal';
  import { Sparkles } from 'lucide-svelte';
  import { replayDemo } from '$lib/stores/demoFlow';

  export let startHref = '/analyze';

  function onReplay(e: MouseEvent) {
    e.preventDefault();
    replayDemo();
  }
</script>

<section
  class="home-section relative overflow-hidden py-28"
  aria-labelledby="final-cta-heading"
>
  <!-- Radial glow -->
  <div
    aria-hidden="true"
    class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-3xl"
    style="background: radial-gradient(closest-side, var(--glow-cyan), transparent 70%);"
  ></div>

  <div
    use:reveal
    class="reveal-init mx-auto max-w-3xl px-6 text-center lg:px-10"
  >
    <h2
      id="final-cta-heading"
      class="font-display text-4xl font-bold tracking-[-0.02em] text-text-primary md:text-[48px]"
    >
      Ready to run GeoScore on a{' '}
      <span class="shimmer-text">real address?</span>
    </h2>
    <p class="mx-auto mt-5 max-w-xl text-base text-text-secondary md:text-lg">
      Get the same decision-ready readout—demand, competition, demographics, and
      an AI strategic summary—from live signals, not a static demo.
    </p>
    <div class="mt-10 flex flex-col items-center gap-4">
      <Button
        href={startHref}
        size="lg"
        variant="cyan"
        class="px-10 animate-cta-pulse"
      >
        Analyze a Location
        <Sparkles class="h-4 w-4" />
      </Button>
      <div class="flex flex-col items-center gap-2">
        <p class="text-[13px] text-text-muted">
          No account needed. No credit card.
        </p>
        <a
          href="#demo"
          class="text-[13px] font-medium text-accent-cyan transition-colors hover:text-accent-blue"
          on:click={onReplay}
        >
          Replay the homepage walkthrough
        </a>
      </div>
    </div>
  </div>
</section>
