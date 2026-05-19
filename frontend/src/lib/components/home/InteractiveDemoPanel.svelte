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
  class="demo-product-section relative overflow-visible scroll-mt-24 {embedded
    ? 'demo-product-section--embedded'
    : ''}"
  aria-label="GeoScore interactive preview"
>
  <div class="relative mx-auto max-w-xl">
    <div
      class="demo-product-shell geo-glass-soft demo-product-stage rounded-2xl {embedded ? 'demo-product-stage--embedded' : ''}"
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
    min-height: clamp(380px, 48vh, 560px);
    display: flex;
    flex-direction: column;
    background: transparent;
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
