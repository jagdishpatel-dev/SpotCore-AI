<script lang="ts">
  /**
   * "Threads"-style background — gentle, slow-flowing diagonal streaks rendered
   * with pure SVG so it stays performant and accessible. Inspired by React Bits
   * "Threads" but reimplemented in Svelte without dependencies.
   *
   * Tuned to be very subtle so foreground text always reads.
   */

  /** Opacity of the threads layer 0..1. */
  export let intensity: number = 0.45;
  /** Number of thread lines. */
  export let count: number = 18;

  // Pre-compute path data deterministically.
  const seed = 2025;
  function rng(i: number) {
    const x = Math.sin(i * 9301 + seed) * 43758.5453;
    return x - Math.floor(x);
  }

  $: paths = Array.from({ length: count }).map((_, i) => {
    const yStart = (i / count) * 100 + (rng(i) - 0.5) * 4;
    const amp = 6 + rng(i + 11) * 8;
    const phase = rng(i + 23) * 100;
    return { yStart, amp, phase, key: i };
  });
</script>

<div class="gs-threads pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
  <!-- Soft radial wash -->
  <div
    class="absolute inset-0"
    style="background:
      radial-gradient(60% 50% at 50% 0%, rgba(34, 211, 238, 0.18), transparent 60%),
      radial-gradient(50% 60% at 90% 30%, rgba(56, 189, 248, 0.14), transparent 60%),
      radial-gradient(40% 40% at 0% 80%, rgba(34, 211, 238, 0.08), transparent 60%);
      opacity: {intensity};"
  ></div>

  <!-- Animated drifting threads -->
  <svg
    class="absolute inset-0 h-full w-full animate-thread-drift"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style="opacity: {intensity};"
  >
    <defs>
      <linearGradient id="gs-thread-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22d3ee" stop-opacity="0" />
        <stop offset="50%" stop-color="#22d3ee" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
      </linearGradient>
    </defs>
    {#each paths as p (p.key)}
      <path
        d={`M -5 ${p.yStart} C 25 ${p.yStart - p.amp}, 75 ${p.yStart + p.amp}, 105 ${p.yStart + (p.phase % 2 === 0 ? -2 : 2)}`}
        fill="none"
        stroke="url(#gs-thread-grad)"
        stroke-width="0.18"
        vector-effect="non-scaling-stroke"
      />
    {/each}
  </svg>

  <!-- Top + bottom fade so content corners breathe -->
  <div
    class="absolute inset-0"
    style="background: linear-gradient(180deg, rgba(2,6,23,0.0) 0%, rgba(2,6,23,0.0) 60%, rgba(2,6,23,0.85) 100%);"
  ></div>
</div>

<style>
  .gs-threads {
    mix-blend-mode: screen;
  }
  @media (prefers-reduced-motion: reduce) {
    :global(.gs-threads .animate-thread-drift) {
      animation: none !important;
    }
  }
</style>
