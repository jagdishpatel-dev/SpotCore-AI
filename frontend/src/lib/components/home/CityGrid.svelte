<script lang="ts">
  /** Top-down city block motif — CSS grid of rounded rectangles. */
  export let cols = 8;
  export let rows = 6;
  export let cellClass = 'h-3 w-3 md:h-3.5 md:w-3.5';
  export let gapClass = 'gap-1 md:gap-1.5';
  export let className = '';

  const tones = ['surface', 'soft', 'accent', 'surface', 'soft', 'surface', 'accent-soft', 'surface'] as const;

  function toneFor(i: number): (typeof tones)[number] {
    return tones[i % tones.length];
  }

  function accentBorder(i: number): boolean {
    return i % 17 === 5 || i % 23 === 11;
  }

  $: cells = Array.from({ length: cols * rows }, (_, i) => ({
    tone: toneFor(i),
    accent: accentBorder(i),
  }));
</script>

<div
  class="grid place-items-center {gapClass} {className}"
  style="grid-template-columns: repeat({cols}, minmax(0, 1fr));"
  aria-hidden="true"
>
  {#each cells as cell, i}
    <span
      class="rounded-sm {cellClass}"
      class:bg-geoscorer-surface={cell.tone === 'surface'}
      class:bg-geoscorer-surface-soft={cell.tone === 'soft'}
      class:bg-geoscorer-accent-soft={cell.tone === 'accent-soft'}
      class:bg-geoscorer-accent={cell.tone === 'accent'}
      class:opacity-90={cell.tone === 'accent'}
      class:border={cell.accent}
      class:border-geoscorer-accent={cell.accent}
      style={cell.tone === 'accent' ? 'opacity: 0.35' : undefined}
    ></span>
  {/each}
</div>
