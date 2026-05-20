<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { T, useTask, useThrelte } from '@threlte/core';
  import { useGltf, useSuspense, useViewport } from '@threlte/extras';
  import { easing } from 'maath';
  import * as THREE from 'three';
  import type { Mesh } from 'three';
  import { applyFluidGlassMaterial } from './applyFluidGlassMaterial';
  import { MeshTransmissionMaterialImpl } from './MeshTransmissionMaterialImpl';
  import { fluidGlassBarDefaults, type FluidGlassBarProps } from './fluidGlassTypes';

  interface Props {
    modeProps?: FluidGlassBarProps;
    lockToTop?: boolean;
  }

  let { modeProps = {}, lockToTop = true }: Props = $props();

  const merged = $derived({ ...$fluidGlassBarDefaults, ...modeProps });

  const GLB = '/assets/3d/bar.glb';
  const GEOMETRY_KEY = 'Cube';

  const loader = useGltf();
  const suspend = useSuspense();
  const { renderer, camera, size, invalidate } = useThrelte();
  const viewport = useViewport([0, 0, 15]);

  const bufferScene = new THREE.Scene();
  bufferScene.background = new THREE.Color('#f7f4ee');

  let geometry = $state<THREE.BufferGeometry | undefined>(undefined);
  let geoWidth = 1;
  let buffer = $state<THREE.WebGLRenderTarget | undefined>(undefined);
  let transmissionMat = $state<MeshTransmissionMaterialImpl | undefined>(undefined);
  let barMesh = $state<Mesh | undefined>(undefined);
  let backdropMesh: THREE.Mesh | undefined;

  function pushProps() {
    if (!transmissionMat) return;
    applyFluidGlassMaterial(transmissionMat, merged, buffer?.texture);
    invalidate();
  }

  $effect(() => {
    merged.transmission;
    merged.roughness;
    merged.thickness;
    merged.ior;
    merged.scale;
    merged.chromaticAberration;
    merged.anisotropy;
    merged.anisotropicBlur;
    merged.color;
    merged.attenuationColor;
    merged.attenuationDistance;
    pushProps();
  });

  $effect(() => {
    if (!barMesh) return;
    const scaleProp = merged.scale;
    if (scaleProp != null) barMesh.scale.setScalar(scaleProp);
  });

  onMount(async () => {
    try {
      const data = await suspend(loader.load(GLB));
      const node = data.nodes?.[GEOMETRY_KEY] as Mesh | undefined;
      if (!node?.geometry) return;

      geometry = node.geometry;
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      geoWidth = box ? box.max.x - box.min.x || 1 : 1;

      const backdrop = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24),
        new THREE.MeshBasicMaterial({ color: '#f7f4ee' }),
      );
      backdrop.position.z = -8;
      bufferScene.add(backdrop);
      backdropMesh = backdrop;

      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.max(1, Math.floor(size.current.width * dpr));
      const h = Math.max(1, Math.floor(size.current.height * dpr));
      buffer = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.HalfFloatType,
      });

      transmissionMat = new MeshTransmissionMaterialImpl(10, false);
      pushProps();
    } catch (err) {
      console.warn('[FluidGlass] WebGL bar failed to load:', err);
    }
  });

  onDestroy(() => {
    buffer?.dispose();
    transmissionMat?.dispose();
    backdropMesh?.geometry.dispose();
    (backdropMesh?.material as THREE.Material)?.dispose();
  });

  useTask((_, delta) => {
    if (!geometry || !buffer || !transmissionMat || !barMesh) return;

    const cam = camera.current;
    if (!cam) return;

    const v = viewport.current;
    if (!v.width) return;

    const destY = lockToTop ? v.height / 2 - 0.06 : -v.height / 2 + 0.2;
    easing.damp3(barMesh.position, [0, destY, 0], 0.15, delta);

    if (merged.scale == null) {
      const maxWorld = v.width * 0.96;
      const desired = maxWorld / geoWidth;
      barMesh.scale.setScalar(Math.min(0.15, desired));
    }

    const dpr = renderer.getPixelRatio();
    const w = Math.max(1, Math.floor(size.current.width * dpr));
    const h = Math.max(1, Math.floor(size.current.height * dpr));
    if (buffer.width !== w || buffer.height !== h) buffer.setSize(w, h);

    const prevTarget = renderer.getRenderTarget();
    const prevTone = renderer.toneMapping;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setRenderTarget(buffer);
    renderer.render(bufferScene, cam);
    renderer.setRenderTarget(prevTarget);
    renderer.toneMapping = prevTone;

    transmissionMat.buffer = buffer.texture;
    transmissionMat.time = performance.now() / 1000;
  });
</script>

{#if geometry && transmissionMat}
  <T.Mesh bind:ref={barMesh} {geometry} material={transmissionMat} rotation.x={Math.PI / 2} />
{/if}
