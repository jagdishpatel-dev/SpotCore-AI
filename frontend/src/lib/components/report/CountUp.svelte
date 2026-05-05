<script lang="ts">
  import { onDestroy } from 'svelte';
  import { inView, tweenNumber } from '$lib/utils/motion';

  export let to: number;
  export let from: number = 0;
  export let duration: number = 1100;
  export let decimals: number = 0;
  /** Force start immediately rather than on intersection. */
  export let immediate: boolean = false;
  let className: string = '';
  export { className as class };

  let value = from;
  let cancel: (() => void) | null = null;
  let started = false;

  function start() {
    if (started) return;
    started = true;
    cancel?.();
    cancel = tweenNumber(from, to, duration, (v) => (value = v));
  }

  onDestroy(() => cancel?.());

  $: display = value.toFixed(decimals);
  $: if (immediate && !started) start();
</script>

<span use:inView={{ threshold: 0.4, onEnter: start }} class={className}>{display}</span>
