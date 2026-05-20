import * as THREE from 'three';
import type { MeshTransmissionMaterialImpl } from './MeshTransmissionMaterialImpl';
import type { FluidGlassBarProps } from './fluidGlassTypes';

/** Apply every React Bits bar prop to MeshTransmissionMaterial (drei shader). */
export function applyFluidGlassMaterial(
  m: MeshTransmissionMaterialImpl,
  p: FluidGlassBarProps,
  bufferTexture?: THREE.Texture,
) {
  if (bufferTexture) m.buffer = bufferTexture;

  const transmission = p.transmission !== undefined ? p.transmission : 1;
  m._transmission = transmission;
  m.transmission = 0;

  if (p.ior !== undefined) m.ior = p.ior;
  if (p.thickness !== undefined) {
    m.thickness = p.thickness;
    m.uniforms.thickness.value = p.thickness;
  }
  if (p.roughness !== undefined) {
    m.roughness = p.roughness;
    m.uniforms.roughness.value = p.roughness;
  }
  if (p.chromaticAberration !== undefined) {
    m.chromaticAberration = p.chromaticAberration;
    m.uniforms.chromaticAberration.value = p.chromaticAberration;
  }

  const blur = p.anisotropicBlur ?? p.anisotropy;
  if (blur !== undefined) {
    m.anisotropicBlur = blur;
    m.uniforms.anisotropicBlur.value = blur;
  }

  if (p.color !== undefined) m.color = new THREE.Color(p.color);
  if (p.attenuationColor !== undefined) {
    m.attenuationColor = new THREE.Color(p.attenuationColor);
  }
  if (p.attenuationDistance !== undefined) m.attenuationDistance = p.attenuationDistance;

  m.needsUpdate = true;
}
