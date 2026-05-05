<script lang="ts">
  import { inView } from '$lib/utils/motion';

  /** The text to reveal word-by-word. */
  export let text: string;
  /** ms between word reveals. */
  export let stagger: number = 55;
  /** Per-word duration in ms. */
  export let duration: number = 500;
  /** Optional initial delay in ms. */
  export let delay: number = 0;
  /** Force reveal on mount. */
  export let immediate: boolean = false;
  let className: string = '';
  export { className as class };

  $: words = text.split(/(\s+)/);

  let visible = immediate;
  const onEnter = () => (visible = true);
</script>

<span
  class="gs-stagger {className}"
  class:is-in={visible}
  use:inView={{ threshold: 0.3, onEnter }}
  style="--gs-d: {duration}ms;"
>
  {#each words as w, i}
    {#if w.trim() === ''}
      <span class="whitespace-pre">{w}</span>
    {:else}
      <span class="gs-word" style="--gs-delay: {delay + i * stagger}ms;">{w}</span>
    {/if}
  {/each}
</span>

<style>
  .gs-stagger {
    display: inline;
  }
  .gs-word {
    display: inline-block;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity var(--gs-d) cubic-bezier(0.22, 1, 0.36, 1) var(--gs-delay),
      transform var(--gs-d) cubic-bezier(0.22, 1, 0.36, 1) var(--gs-delay);
  }
  .is-in .gs-word {
    opacity: 1;
    transform: translateY(0);
  }
  @media (prefers-reduced-motion: reduce) {
    .gs-word {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
