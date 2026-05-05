<script lang="ts">
  /**
   * Fluid-glass-style card: dark backdrop blur, faint inner highlight, accent
   * border. Inspired by React Bits "Fluid Glass" but reimplemented in Svelte.
   */
  export let tone: 'neutral' | 'cyan' | 'positive' | 'warning' | 'danger' | 'blue' = 'neutral';
  /** Adds the standard hover lift + glow used by interactive cards. */
  export let interactive: boolean = false;
  /** Adds an inner padding helper. */
  export let padded: boolean = true;
  let className: string = '';
  export { className as class };

  const toneToBorder: Record<string, string> = {
    neutral: 'rgba(148, 163, 184, 0.18)',
    cyan: 'rgba(34, 211, 238, 0.32)',
    positive: 'rgba(34, 197, 94, 0.32)',
    warning: 'rgba(249, 115, 22, 0.32)',
    danger: 'rgba(239, 68, 68, 0.32)',
    blue: 'rgba(56, 189, 248, 0.32)',
  };
  const toneToGlow: Record<string, string> = {
    neutral: 'rgba(2,6,23,0.6)',
    cyan: 'rgba(34, 211, 238, 0.18)',
    positive: 'rgba(34, 197, 94, 0.16)',
    warning: 'rgba(249, 115, 22, 0.18)',
    danger: 'rgba(239, 68, 68, 0.18)',
    blue: 'rgba(56, 189, 248, 0.2)',
  };

  $: borderColor = toneToBorder[tone];
  $: glowColor = toneToGlow[tone];
</script>

<div
  class="gs-glass {className}"
  class:gs-card-hover={interactive}
  class:p-6={padded}
  class:md:p-7={padded}
  style="--gs-border:{borderColor}; --gs-glow:{glowColor};"
>
  <slot />
</div>

<style>
  .gs-glass {
    position: relative;
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.0) 35%),
      var(--color-surface);
    border: 1px solid var(--gs-border);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 24px 80px -32px var(--gs-glow),
      0 18px 48px -28px rgba(2, 6, 23, 0.9);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }
  .gs-glass::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(120% 80% at 0% 0%, rgba(255, 255, 255, 0.04), transparent 55%);
  }
</style>
