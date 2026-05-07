<script lang="ts">
  import { MapPin, ArrowDown, Sparkles } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import LivePreviewCard from '$lib/components/home/LivePreviewCard.svelte';

  export let startHref = '/analyze';

  const headlineWords = ['Know', 'before', 'you'];
</script>

<section
  class="home-section relative flex min-h-[calc(100vh-60px)] items-center overflow-hidden"
  aria-labelledby="hero-headline"
>
  <!-- Animated mesh gradient background -->
  <div
    class="pointer-events-none absolute inset-0 -z-10 mesh-bg opacity-[0.55] animate-mesh-drift"
    aria-hidden="true"
  ></div>
  <!-- Soft radial glow at center -->
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl animate-soft-pulse"
    style="background: radial-gradient(closest-side, var(--glow-cyan), transparent 70%);"
    aria-hidden="true"
  ></div>
  <!-- Grid pattern -->
  <div
    class="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.08]"
    style="background-image: linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);"
    aria-hidden="true"
  ></div>

  <div class="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-16 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:px-10">
    <div class="flex flex-col items-center text-center lg:items-start lg:text-left">
      <div class="hero-enter" style="--enter-delay: 60ms;">
        <Badge variant="outline" class="!normal-case !tracking-[0.12em]">
          <MapPin class="h-3.5 w-3.5 text-accent-cyan" />
          <span class="text-[11px]">AI-powered location intelligence</span>
        </Badge>
      </div>

      <h1
        id="hero-headline"
        class="mt-6 font-display text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-text-primary sm:text-[58px] md:text-[64px] lg:text-[72px]"
      >
        <span class="block">
          {#each headlineWords as word, i}
            <span
              class="hero-enter inline-block"
              style="--enter-delay: {160 + i * 80}ms;"
            >
              {word}{#if i < headlineWords.length - 1}&nbsp;{/if}
            </span>
          {/each}
        </span>
        <span
          class="hero-enter block shimmer-text"
          style="--enter-delay: 420ms;"
        >
          invest.
        </span>
      </h1>

      <p
        class="hero-enter mt-6 max-w-[580px] text-[17px] leading-[1.65] text-text-secondary md:text-lg"
        style="--enter-delay: 600ms;"
      >
        Find out whether a location is right for your business by combining
        demand, competition, demographics, and site quality into one clear
        decision.
      </p>

      <div
        class="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-center"
      >
        <div class="hero-enter scale-up" style="--enter-delay: 760ms;">
          <Button href={startHref} size="lg" variant="cyan" class="px-8">
            Analyze a Location
            <Sparkles class="h-4 w-4" />
          </Button>
        </div>
        <a
          href="#how-it-works"
          class="hero-enter group inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent-cyan"
          style="--enter-delay: 900ms;"
        >
          See how it works
          <ArrowDown class="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
        </a>
      </div>

      <div
        class="hero-enter mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-text-muted"
        style="--enter-delay: 1080ms;"
      >
        <span>Signals from 5+ data sources</span>
        <span class="text-accent-cyan/40" aria-hidden="true">·</span>
        <span>Census + Google + Mobility data</span>
        <span class="text-accent-cyan/40" aria-hidden="true">·</span>
        <span>AI strategic readouts</span>
      </div>
    </div>

    <!-- Floating live preview card (desktop only) -->
    <div
      class="hero-enter from-right-x hidden lg:block"
      style="--enter-delay: 600ms;"
    >
      <LivePreviewCard />
    </div>
  </div>
</section>
