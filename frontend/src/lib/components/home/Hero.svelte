<script lang="ts">
  import { MapPin, ArrowDown, Sparkles } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import InteractiveDemoPanel from './InteractiveDemoPanel.svelte';
  import { scrollToId } from '$lib/stores/demoFlow';

  export let startHref = '/analyze';

  const headlineWords = ['Stop', 'guessing'];

  function onSeeHow(e: MouseEvent) {
    e.preventDefault();
    scrollToId('demo');
  }
</script>

<section
  class="home-section hero-with-demo relative isolate flex min-h-[calc(100dvh-60px)] flex-col overflow-x-clip pb-8 md:pb-10 lg:pb-12"
  aria-labelledby="hero-headline"
>
  <!-- Animated mesh gradient -->
  <div
    class="pointer-events-none absolute inset-0 -z-10 mesh-bg opacity-[0.55] animate-mesh-drift"
    aria-hidden="true"
  ></div>

  <!-- Soft radial glow at center -->
  <div
    class="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl animate-soft-pulse"
    style="background: radial-gradient(closest-side, var(--glow-cyan), transparent 70%);"
    aria-hidden="true"
  ></div>

  <!-- Faint map grid -->
  <div
    class="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] dark:opacity-[0.08]"
    style="background-image: linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px); background-size: 64px 64px; mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);"
    aria-hidden="true"
  ></div>

  <!-- Decorative product framing: concentric trade-area rings + drifting pins -->
  <svg
    class="pointer-events-none absolute right-[-12%] top-1/2 -z-10 hidden h-[640px] w-[640px] -translate-y-1/2 opacity-[0.5] md:block"
    viewBox="0 0 600 600"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="hero-ring-fade" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="var(--accent-cyan)" stop-opacity="0.18" />
        <stop offset="60%" stop-color="var(--accent-cyan)" stop-opacity="0.04" />
        <stop offset="100%" stop-color="var(--accent-cyan)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="300" cy="300" r="280" fill="url(#hero-ring-fade)" />
    <g
      fill="none"
      stroke="var(--accent-cyan)"
      stroke-opacity="0.18"
      stroke-dasharray="2 6"
    >
      <circle cx="300" cy="300" r="120" />
      <circle cx="300" cy="300" r="200" />
      <circle cx="300" cy="300" r="280" />
    </g>
    <g fill="var(--accent-cyan)" fill-opacity="0.55">
      <circle cx="300" cy="300" r="4.5" />
    </g>
    <g fill="var(--accent-cyan)" fill-opacity="0.32">
      <circle cx="180" cy="220" r="2.5" />
      <circle cx="430" cy="240" r="2.5" />
      <circle cx="380" cy="430" r="2.5" />
      <circle cx="220" cy="420" r="2.5" />
      <circle cx="450" cy="380" r="2.5" />
      <circle cx="160" cy="340" r="2.5" />
    </g>
  </svg>

  <!-- Mirrored, fainter ring on the left to balance the composition -->
  <svg
    class="pointer-events-none absolute left-[-18%] top-[58%] -z-10 hidden h-[480px] w-[480px] -translate-y-1/2 opacity-[0.32] lg:block"
    viewBox="0 0 600 600"
    aria-hidden="true"
  >
    <g
      fill="none"
      stroke="var(--accent-blue)"
      stroke-opacity="0.16"
      stroke-dasharray="2 8"
    >
      <circle cx="300" cy="300" r="180" />
      <circle cx="300" cy="300" r="260" />
    </g>
  </svg>

  <div class="relative z-[1] flex min-h-0 flex-1 flex-col justify-between gap-10 md:gap-12">
    <!-- Vertically centered in the viewport minus header; demo stays below -->
    <div
      class="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-10 text-center sm:pt-12 md:min-h-0 lg:px-10"
    >
      <div class="mx-auto max-w-5xl">
        <div class="hero-enter inline-flex" style="--enter-delay: 60ms;">
          <Badge variant="outline" class="!normal-case !tracking-[0.12em]">
            <MapPin class="h-3.5 w-3.5 text-accent-cyan" />
            <span class="text-[11px]">AI-powered location intelligence</span>
          </Badge>
        </div>

        <h1
          id="hero-headline"
          class="mt-5 font-display font-bold tracking-[-0.025em] text-text-primary md:mt-6"
          style="font-size: clamp(44px, 7.5vw, 84px); line-height: 1.02;"
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
            where to grow.
          </span>
        </h1>

        <p
          class="hero-enter mx-auto mt-5 max-w-[600px] text-[17px] leading-[1.6] text-text-secondary md:mt-6 md:text-[19px]"
          style="--enter-delay: 600ms;"
        >
          GeoScore turns scattered location signals into a clear read on
          opportunity, risk, and fit.
        </p>

        <div
          class="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-9 sm:flex-row"
        >
          <div class="hero-enter scale-up" style="--enter-delay: 760ms;">
            <Button href={startHref} size="lg" variant="cyan" class="px-8">
              Analyze a Location
              <Sparkles class="h-4 w-4" />
            </Button>
          </div>
          <a
            href="#demo"
            on:click={onSeeHow}
            class="hero-enter group inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent-cyan"
            style="--enter-delay: 900ms;"
          >
            See how it works
            <ArrowDown
              class="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </div>

    <!-- Full-width demo: in normal flow so nothing clips top/bottom -->
    <div
      class="hero-demo-slot relative z-[3] mx-auto w-full max-w-6xl shrink-0 px-6 text-left lg:px-10"
    >
      <InteractiveDemoPanel embedded />
    </div>
  </div>
</section>
