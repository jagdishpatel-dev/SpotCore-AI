<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import CityGrid from './CityGrid.svelte';
  import { prefersReducedMotion } from '$lib/actions/reveal';

  const STORAGE_KEY = 'geoscore-intro-seen';
  const HOLD_MS = 1000;
  const FADE_OUT_MS = 420;
  const REDUCED_HOLD_MS = 400;

  interface Props {
    oncomplete?: () => void;
  }

  let { oncomplete }: Props = $props();

  let showOverlay = $state(false);
  let exiting = $state(false);

  function finishIntro() {
    oncomplete?.();
  }

  onMount(() => {
    if (!browser) {
      finishIntro();
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        finishIntro();
        return;
      }
    } catch {
      finishIntro();
      return;
    }

    showOverlay = true;
    const reduced = prefersReducedMotion();
    const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS;
    const fadeOut = reduced ? 200 : FADE_OUT_MS;

    const holdTimer = window.setTimeout(() => {
      exiting = true;
      finishIntro();
      window.setTimeout(() => {
        showOverlay = false;
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          /* ignore */
        }
      }, fadeOut);
    }, hold);

    return () => window.clearTimeout(holdTimer);
  });
</script>

{#if showOverlay}
  <div
    class="intro-overlay"
    class:intro-overlay--exit={exiting}
    aria-hidden={exiting}
    role="presentation"
  >
    <div class="intro-overlay__inner">
      <p class="intro-overlay__wordmark font-display text-2xl font-semibold tracking-tight text-geoscorer-text md:text-3xl">
        GeoScorer
      </p>

      <div class="intro-overlay__city" aria-hidden="true">
        <CityGrid cols={10} rows={7} cellClass="h-2.5 w-2.5 sm:h-3 sm:w-3" gapClass="gap-1" />
      </div>
    </div>
  </div>
{/if}
