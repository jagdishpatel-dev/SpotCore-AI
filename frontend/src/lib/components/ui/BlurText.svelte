<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { prefersReducedMotion } from '$lib/actions/reveal';

  export let text = '';
  export let animateBy: 'words' | 'letters' = 'words';
  export let direction: 'top' | 'bottom' = 'top';
  export let delay = 200;
  export let stepDuration = 0.35;
  export let threshold = 0.1;
  export let rootMargin = '0px';
  /** When set, drives animation instead of the intersection observer. */
  export let start: boolean | undefined = undefined;
  export let className = '';
  export let onAnimationComplete: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher<{ complete: void }>();

  let rootEl: HTMLSpanElement | undefined;
  let inView = false;
  let reduced = false;

  $: segments = animateBy === 'words' ? text.split(' ') : text.split('');
  $: active = reduced || (start !== undefined ? start : inView);
  $: durationMs = Math.round(stepDuration * 2 * 1000);

  function onSegmentAnimationEnd(index: number) {
    if (index === segments.length - 1) {
      onAnimationComplete?.();
      dispatch('complete');
    }
  }

  onMount(() => {
    reduced = prefersReducedMotion();
    if (reduced || start !== undefined) return;

    const node = rootEl;
    if (!node || typeof IntersectionObserver === 'undefined') {
      inView = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView = true;
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  });
</script>

<span
  bind:this={rootEl}
  class="blur-text {className}"
  class:blur-text--bottom={direction === 'bottom'}
  aria-label={text}
>
  {#each segments as segment, index}
    <span
      class="blur-text__segment"
      class:blur-text__segment--active={active}
      style="--blur-delay: {(index * delay) / 1000}s; --blur-duration: {durationMs}ms;"
      on:animationend={() => onSegmentAnimationEnd(index)}
    >
      {segment}{#if animateBy === 'words' && index < segments.length - 1}&nbsp;{/if}
    </span>
  {/each}
</span>

<style>
  .blur-text {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0;
  }

  .blur-text__segment {
    display: inline-block;
    will-change: transform, filter, opacity;
    filter: blur(10px);
    opacity: 0;
    transform: translateY(-50px);
  }

  .blur-text--bottom .blur-text__segment {
    transform: translateY(50px);
  }

  .blur-text__segment--active {
    animation: blur-text-from-top var(--blur-duration, 700ms) ease forwards;
    animation-delay: var(--blur-delay, 0s);
  }

  .blur-text--bottom .blur-text__segment--active {
    animation-name: blur-text-from-bottom;
  }

  @keyframes blur-text-from-top {
    0% {
      filter: blur(10px);
      opacity: 0;
      transform: translateY(-50px);
    }
    50% {
      filter: blur(5px);
      opacity: 0.5;
      transform: translateY(5px);
    }
    100% {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes blur-text-from-bottom {
    0% {
      filter: blur(10px);
      opacity: 0;
      transform: translateY(50px);
    }
    50% {
      filter: blur(5px);
      opacity: 0.5;
      transform: translateY(-5px);
    }
    100% {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blur-text__segment,
    .blur-text__segment--active {
      animation: none;
      filter: none;
      opacity: 1;
      transform: none;
    }
  }
</style>
