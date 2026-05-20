<script lang="ts">
  import { browser } from '$app/environment';
  import FluidGlassBar from './FluidGlassBar.svelte';
  import { syncGlassCssVars } from './syncGlassCssVars';
  import { fluidGlassBarDefaults, type FluidGlassBarProps } from './fluidGlassTypes';

  interface Props {
    barProps?: FluidGlassBarProps;
  }

  let { barProps = {} }: Props = $props();

  const resolvedProps = $derived({ ...$fluidGlassBarDefaults, ...barProps });

  $effect(() => {
    if (!browser) return;
    syncGlassCssVars(resolvedProps);
  });
</script>

{#if browser}
  <FluidGlassBar barProps={resolvedProps} lockToTop={true} />
{/if}
