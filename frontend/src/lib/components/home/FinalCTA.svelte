<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import { reveal } from '$lib/actions/reveal';
  import { Sparkles } from 'lucide-svelte';

  export let startHref = '/analyze';
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
      Know before you <span class="shimmer-text">invest.</span>
    </h2>
    <p class="mx-auto mt-5 max-w-xl text-base text-text-secondary md:text-lg">
      Enter any address and business type. Get your report in minutes.
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
      <p class="text-[13px] text-text-muted">
        No account needed. No credit card.
      </p>
    </div>
  </div>
</section>
