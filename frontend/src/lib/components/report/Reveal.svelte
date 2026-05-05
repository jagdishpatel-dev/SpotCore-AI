<script lang="ts">
  import { inView } from '$lib/utils/motion';

  /** Delay before the reveal animation in ms. */
  export let delay: number = 0;
  /** Translate Y offset in px (e.g. 12). */
  export let y: number = 12;
  /** Animation duration in ms. */
  export let duration: number = 500;
  /** Trigger threshold 0..1. */
  export let threshold: number = 0.18;
  /** When `true`, force-reveal immediately on mount. */
  export let immediate: boolean = false;
  /** Optional class passthrough. */
  let className: string = '';
  export { className as class };

  let visible = immediate;
  const onEnter = () => (visible = true);
</script>

<div
  use:inView={{ threshold, onEnter }}
  class="gs-reveal {className}"
  class:is-in={visible}
  style="--gs-y: {y}px; --gs-d: {duration}ms; --gs-delay: {delay}ms;"
>
  <slot />
</div>

<style>
  .gs-reveal {
    opacity: 0;
    transform: translateY(var(--gs-y));
    transition:
      opacity var(--gs-d) cubic-bezier(0.22, 1, 0.36, 1) var(--gs-delay),
      transform var(--gs-d) cubic-bezier(0.22, 1, 0.36, 1) var(--gs-delay);
    will-change: transform, opacity;
  }
  .gs-reveal.is-in {
    opacity: 1;
    transform: translateY(0);
  }
  @media (prefers-reduced-motion: reduce) {
    .gs-reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
