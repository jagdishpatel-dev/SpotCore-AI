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

  $: fadeMs = prefersReducedMotion() ? 0 : 220;
</script>

<svelte:element
  this={embedded ? 'div' : 'section'}
  id="demo"
  class="demo-product-section relative scroll-mt-24 {embedded ? 'demo-product-section--embedded' : ''}"
  aria-label="GeoScore interactive preview"
>
  <div class="demo-product-wrap relative mx-auto w-full max-w-5xl">
    <div class="demo-product-shell geo-glass-soft rounded-2xl" aria-busy={$phase === 'running'}>
      <div class="demo-product-body">
        {#if $phase === 'idle'}
          <div class="demo-state-layer" in:fade={{ duration: fadeMs }} out:fade={{ duration: fadeMs }}>
            <DemoPanelInputState onEngage={engage} />
          </div>
        {:else if $phase === 'running'}
          <div class="demo-state-layer" in:fade={{ duration: fadeMs }} out:fade={{ duration: fadeMs }}>
            <DemoPanelLoadingState />
          </div>
        {:else}
          <div class="demo-state-layer" in:fade={{ duration: fadeMs }} out:fade={{ duration: fadeMs }}>
            <DemoPanelResultState />
          </div>
        {/if}
      </div>
    </div>
  </div>
</svelte:element>

<style>
  :global(:root) {
    --demo-panel-divider: color-mix(in srgb, var(--border-soft) 85%, transparent);
    --demo-shell-height: clamp(420px, 36vw, 480px);
    --demo-shell-pad: clamp(1.1rem, 2.2vw, 1.65rem);
  }

  .demo-product-section--embedded {
    margin-top: 0;
    padding-bottom: 0;
  }

  .demo-product-shell {
    position: relative;
    width: 100%;
    height: var(--demo-shell-height);
    min-height: var(--demo-shell-height);
    max-height: var(--demo-shell-height);
    overflow: hidden;
    border-radius: clamp(22px, 2.4vw, 30px);
    display: flex;
    flex-direction: column;
    background: transparent;
  }

  .demo-product-body {
    position: relative;
    flex: 1;
    min-height: 0;
    height: 100%;
  }

  .demo-state-layer {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: var(--demo-shell-pad);
    overflow: hidden;
  }

  /* Shared two-column report grid (desktop) */
  :global(.demo-panel-grid) {
    display: grid;
    flex: 1;
    min-height: 0;
    gap: clamp(1rem, 2vw, 1.5rem);
    align-content: stretch;
  }

  @media (min-width: 900px) {
    :global(.demo-panel-grid) {
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: clamp(1.25rem, 2.4vw, 2rem);
    }
  }

  :global(.demo-panel-col) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }

  :global(.demo-panel-chrome) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    padding-bottom: 0.85rem;
    margin-bottom: 0.85rem;
    border-bottom: 1px solid var(--demo-panel-divider, var(--border-soft));
  }

  :global(.demo-panel-chrome__live) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    letter-spacing: 0.02em;
  }

  :global(.demo-panel-chrome__dot) {
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--accent-cyan);
    box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.15);
    animation: demo-live-pulse 2s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.demo-panel-chrome__dot) {
      animation: none;
    }
  }

  @keyframes demo-live-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.65;
      transform: scale(0.92);
    }
  }

  :global(.demo-sk) {
    border-radius: 10px;
    background: linear-gradient(
      110deg,
      var(--bg-surface-2) 0%,
      color-mix(in srgb, var(--bg-surface-2) 70%, var(--accent-cyan) 8%) 45%,
      var(--bg-surface-2) 90%
    );
    background-size: 220% 100%;
    animation: demo-sk-shimmer 1.5s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.demo-sk) {
      animation: none;
    }
  }

  @keyframes demo-sk-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  @media (min-width: 900px) {
    .demo-state-layer:has(:global(.demo-panel-input)) {
      overflow: visible;
    }
  }

  @media (max-width: 899px) {
    :global(:root) {
      --demo-shell-height: clamp(540px, 92vw, 620px);
    }

    .demo-state-layer {
      overflow-y: auto;
      overscroll-behavior: contain;
    }
  }
</style>
