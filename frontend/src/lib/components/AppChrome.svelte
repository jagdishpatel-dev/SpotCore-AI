<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Map as MapIcon } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FluidGlassNav from '$lib/components/chrome/FluidGlassNav.svelte';
  import { clearReportSession } from '$lib/reportSession';

  function newAnalysis() {
    clearReportSession();
    goto('/analyze');
  }

  $: path = $page.url.pathname;
  $: hash = $page.url.hash;

  /** In-page section links: same-route hashes on `/`, root-prefixed elsewhere. */
  function sectionHref(id: string) {
    return path === '/' ? `#${id}` : `/#${id}`;
  }

  const sectionLinks = [
    { id: 'how-it-works', label: 'How it works' },
    { id: 'insights', label: 'Insights' },
    { id: 'faq', label: 'FAQ' },
  ] as const;

  let scrolled = false;
  onMount(() => {
    const onScroll = () => {
      scrolled = window.scrollY > 80;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  const links = [
    { href: '/', label: 'Home' },
    { href: '/analyze', label: 'Analyze' },
    { href: '/report', label: 'Map', icon: MapIcon },
  ];
</script>

<header class="chrome-header sticky top-0 z-50 px-3 pt-3 sm:px-4 md:px-6 lg:px-8">
  <div
    class="chrome-bar relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 overflow-hidden rounded-2xl px-3 sm:h-[60px] sm:gap-4 sm:px-4 md:px-5"
    class:chrome-bar--scrolled={scrolled}
  >
    <FluidGlassNav />

    <a href="/" class="group relative z-[3] flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
      <div
        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent-cyan/40 bg-gradient-to-b from-cyan-300 to-cyan-600 text-[11px] font-bold tracking-tight text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_8px_24px_-8px_rgba(34,211,238,0.5)] transition-transform duration-300 group-hover:scale-[1.03]"
      >
        GS
      </div>
      <div class="hidden leading-tight sm:block">
        <p class="text-sm font-medium tracking-tight text-geoscorer-text">GeoScore</p>
        <p class="text-[11px] tracking-wide text-geoscorer-text-muted">Location intelligence for operators</p>
      </div>
    </a>

    <nav
      class="relative z-[3] hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex"
      aria-label="Primary"
    >
      {#each sectionLinks as link}
        {@const href = sectionHref(link.id)}
        {@const active = path === '/' && hash === `#${link.id}`}
        <a
          {href}
          class="group relative rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors lg:px-3 {active
            ? 'text-geoscorer-text'
            : 'text-geoscorer-text-muted hover:text-geoscorer-text'}"
        >
          {link.label}
          <span
            class="pointer-events-none absolute inset-x-2.5 bottom-1 h-px origin-left scale-x-0 rounded bg-geoscorer-accent transition-transform duration-200 group-hover:scale-x-100 lg:inset-x-3 {active
              ? 'scale-x-100 bg-geoscorer-accent'
              : ''}"
            aria-hidden="true"
          ></span>
        </a>
      {/each}
      {#each links as link}
        {@const active = path === link.href}
        <a
          href={link.href}
          class="group relative rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors lg:px-3 {active
            ? 'text-geoscorer-text'
            : 'text-geoscorer-text-muted hover:text-geoscorer-text'}"
        >
          {link.label}
          <span
            class="pointer-events-none absolute inset-x-2.5 bottom-1 h-px origin-left scale-x-0 rounded bg-geoscorer-accent transition-transform duration-200 group-hover:scale-x-100 lg:inset-x-3 {active
              ? 'scale-x-100 bg-geoscorer-accent'
              : ''}"
            aria-hidden="true"
          ></span>
        </a>
      {/each}
    </nav>

    <div class="relative z-[3] flex shrink-0 items-center gap-2">
      {#if path === '/report'}
        <Button variant="outline" size="sm" on:click={newAnalysis}>
          New analysis
        </Button>
      {:else}
        <Button href="/analyze" variant="cyan" size="sm" class="hidden px-4 sm:inline-flex">
          Analyze Address
        </Button>
        <Button href="/analyze" variant="cyan" size="sm" class="px-3 sm:hidden">
          Analyze
        </Button>
      {/if}
    </div>
  </div>
</header>

<style>
  .chrome-header {
    pointer-events: none;
    background: transparent;
  }

  .chrome-bar {
    pointer-events: auto;
    isolation: isolate;
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 10px 32px -16px rgba(15, 23, 42, 0.08);
    /* Tied to all glass props via syncGlassCssVars() */
    backdrop-filter: blur(
        calc(28px * var(--glass-transmission, 1) * (0.25 + var(--glass-roughness, 0) + var(--glass-thickness, 0.33)))
      )
      saturate(calc(100% + 50% * var(--glass-transmission, 1)));
    -webkit-backdrop-filter: blur(
        calc(28px * var(--glass-transmission, 1) * (0.25 + var(--glass-roughness, 0) + var(--glass-thickness, 0.33)))
      )
      saturate(calc(100% + 50% * var(--glass-transmission, 1)));
    background: rgba(255, 255, 255, calc(0.04 + 0.08 * var(--glass-transmission, 1)));
    border-color: rgba(255, 255, 255, calc(0.3 + 0.25 * var(--glass-ior, 0.15) + 0.2 * var(--glass-chroma, 0.1)));
  }

  .chrome-bar--scrolled {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 14px 36px -14px rgba(15, 23, 42, 0.1);
  }
</style>
