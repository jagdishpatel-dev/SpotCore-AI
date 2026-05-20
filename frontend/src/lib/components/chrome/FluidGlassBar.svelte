<script lang="ts">
  import { browser } from '$app/environment';
  import { Canvas } from '@threlte/core';
  import { Suspense } from '@threlte/extras';
  import FluidGlassModeWrapper from './FluidGlassModeWrapper.svelte';
  import type { FluidGlassBarProps } from './fluidGlassTypes';

  interface Props {
    barProps?: FluidGlassBarProps;
    lockToTop?: boolean;
  }

  let { barProps, lockToTop = true }: Props = $props();

  const dpr = browser ? Math.min(window.devicePixelRatio, 2) : 1;
</script>

<div class="fluid-glass-bar" aria-hidden="true">
  <Canvas
    camera={{ position: [0, 0, 20], fov: 15 }}
    gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    {dpr}
  >
    <Suspense>
      <FluidGlassModeWrapper modeProps={barProps ?? {}} {lockToTop} />
    </Suspense>
  </Canvas>
</div>

<style>
  .fluid-glass-bar {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;
  }

  .fluid-glass-bar :global(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
    pointer-events: none;
  }
</style>
