<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { get } from 'svelte/store';
  import { prefersReducedMotion } from '$lib/actions/reveal';
  import {
    phase,
    run,
    disableHomepageDemoAutoplay,
    homepageDemoAutoplayDisabled,
    homepageDemoTimerGeneration,
  } from '$lib/stores/demoFlow';
  import DemoPanelInputState from './DemoPanelInputState.svelte';
  import DemoPanelLoadingState from './DemoPanelLoadingState.svelte';
  import DemoPanelResultState from './DemoPanelResultState.svelte';

  /** When true, panel sits inside the hero (no extra section chrome / looser min-height). */
  export let embedded = false;

  const IDLE_AUTOSTART_MS = 5200;

  let timers: number[] = [];

  function clearTimers() {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
  }

  function engage() {
    disableHomepageDemoAutoplay();
    clearTimers();
  }

  let lastTimerGen = 0;
  $: {
    const g = $homepageDemoTimerGeneration;
    if (g !== lastTimerGen) {
      if (g > 0) clearTimers();
      lastTimerGen = g;
    }
  }

  onMount(() => {
    timers.push(
      window.setTimeout(() => {
        if (get(homepageDemoAutoplayDisabled)) return;
        if (get(phase) !== 'idle') return;
        run();
      }, IDLE_AUTOSTART_MS)
    );
    return () => clearTimers();
  });

  $: fadeMs = prefersReducedMotion() ? 0 : 260;
</script>

<svelte:element
  this={embedded ? 'div' : 'section'}
  id="demo"
  class="demo-product-section relative overflow-visible scroll-mt-[calc(72px+0.75rem)] {embedded
    ? 'demo-product-section--embedded'
    : 'home-section py-14 md:py-20'}"
  aria-label="GeoScore interactive preview"
>
  {#if !embedded}
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px]"
      style="background: radial-gradient(900px 220px at 50% 0%, var(--glow-blue), transparent 72%);"
    ></div>
  {/if}

  <div class="relative mx-auto max-w-6xl {embedded ? '' : 'px-6 lg:px-10'}">
    <div
      class="demo-product-shell gs-panel-xl demo-product-stage {embedded ? 'demo-product-stage--embedded' : ''}"
      aria-busy={$phase === 'running'}
    >
      {#if $phase === 'idle'}
        <div
          class="demo-state-pad"
          in:fade={{ duration: fadeMs }}
          out:fade={{ duration: fadeMs }}
        >
          <DemoPanelInputState onEngage={engage} />
        </div>
      {:else if $phase === 'running'}
        <div
          class="demo-state-pad"
          in:fade={{ duration: fadeMs }}
          out:fade={{ duration: fadeMs }}
        >
          <DemoPanelLoadingState />
        </div>
      {:else}
        <div
          class="demo-state-pad demo-state-pad--results"
          in:fade={{ duration: fadeMs }}
          out:fade={{ duration: fadeMs }}
        >
          <DemoPanelResultState />
        </div>
      {/if}
    </div>
  </div>
</svelte:element>

<style>
  :global(:root) {
    --demo-panel-divider: color-mix(in srgb, var(--border-soft) 85%, transparent);
  }

  .demo-product-section--embedded {
    padding-bottom: 0;
    margin-top: 0;
  }

  .demo-product-stage {
    position: relative;
    overflow: hidden;
    width: 100%;
    min-height: clamp(420px, 52vh, 720px);
    display: flex;
    flex-direction: column;
    background:
      linear-gradient(
        145deg,
        rgba(34, 211, 238, 0.045),
        rgba(56, 189, 248, 0.02) 38%,
        transparent 62%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012)),
      var(--bg-surface);
  }

  .demo-product-stage--embedded {
    /*
     * Reserve enough vertical space for the largest state (results) so the
     * homepage doesn't reflow as the demo advances from input -> loading -> result.
     * This keeps the viewport steady even if the user is reading sections below.
     */
    min-height: clamp(780px, 78vh, 940px);
  }

  .demo-product-shell {
    --demo-shell-radius: clamp(22px, 2.4vw, 30px);
    border-radius: var(--demo-shell-radius);
    width: 100%;
  }

  .demo-state-pad {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: clamp(1.25rem, 3vw, 2.25rem);
    min-height: inherit;
  }

  .demo-state-pad--results {
    padding-top: clamp(1.15rem, 2.5vw, 1.75rem);
  }

  @media (max-width: 1023px) {
    .demo-product-stage--embedded {
      min-height: clamp(720px, 92vw, 860px);
    }
  }

  @media (max-width: 767px) {
    .demo-product-stage--embedded {
      min-height: auto;
    }
  }
</style>
