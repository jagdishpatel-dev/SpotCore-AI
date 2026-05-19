<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Sun, Moon, Map as MapIcon } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { theme } from '$lib/stores/theme';
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

<header
  class="sticky top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-300"
  class:scrolled
  style="border-color: var(--border-soft); background: {scrolled
    ? 'color-mix(in oklab, var(--bg-base) 92%, transparent)'
    : 'color-mix(in oklab, var(--bg-base) 78%, transparent)'};"
>
  <div
    class="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-4 px-4 backdrop-blur-md backdrop-saturate-150 md:px-6 lg:px-10"
  >
    <a href="/" class="group flex items-center gap-3">
      <div
        class="grid h-9 w-9 place-items-center rounded-xl border border-accent-cyan/40 bg-gradient-to-b from-cyan-300 to-cyan-600 text-[11px] font-bold tracking-tight text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_8px_24px_-8px_rgba(34,211,238,0.5)] transition-transform duration-300 group-hover:scale-[1.03]"
      >
        GS
      </div>
      <div class="leading-tight">
        <p class="text-sm font-medium tracking-tight text-text-primary">
          GeoScore
        </p>
        <p class="text-[11px] tracking-wide text-text-muted">
          Location intelligence for operators
        </p>
      </div>
    </a>

    <nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
      {#each sectionLinks as link}
        {@const href = sectionHref(link.id)}
        {@const active = path === '/' && hash === `#${link.id}`}
        <a
          {href}
          class="group relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors {active
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary'}"
        >
          {link.label}
          <span
            class="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 rounded bg-accent-cyan transition-transform duration-200 group-hover:scale-x-100 {active
              ? 'scale-x-100 bg-accent-cyan'
              : ''}"
            aria-hidden="true"
          ></span>
        </a>
      {/each}
      {#each links as link}
        {@const active = path === link.href}
        <a
          href={link.href}
          class="group relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors {active
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary'}"
        >
          {link.label}
          <span
            class="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 rounded bg-accent-cyan transition-transform duration-200 group-hover:scale-x-100 {active
              ? 'scale-x-100 bg-accent-cyan'
              : ''}"
            aria-hidden="true"
          ></span>
        </a>
      {/each}
    </nav>

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface)]/40 text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-text-primary"
        aria-label="Toggle color theme"
        on:click={() => theme.toggle()}
      >
        {#if $theme === 'dark'}
          <Sun class="h-4 w-4" />
        {:else}
          <Moon class="h-4 w-4" />
        {/if}
      </button>

      {#if path === '/report'}
        <Button variant="outline" size="sm" on:click={newAnalysis}>
          New analysis
        </Button>
      {:else}
        <Button href="/analyze" variant="cyan" size="sm" class="px-4">
          Analyze Address
        </Button>
      {/if}
    </div>
  </div>
</header>

<style>
  header.scrolled {
    box-shadow: 0 1px 0 var(--border-soft), 0 8px 24px -16px rgba(2, 6, 23, 0.4);
  }
</style>
