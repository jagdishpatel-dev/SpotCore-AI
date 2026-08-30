/** React Bits FluidGlass `bar` mode material props. */
export interface FluidGlassBarProps {
  transmission?: number;
  roughness?: number;
  thickness?: number;
  ior?: number;
  scale?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  anisotropicBlur?: number;
  color?: string;
  attenuationColor?: string;
  attenuationDistance?: number;
}

/**
 * Navbar glass tuning (edit here, save, HMR refreshes).
 *
 * - **Scroll-through frost** (hero text blurring under the bar): `transmission`,
 *   `roughness`, `thickness` → CSS `backdrop-filter` on `.chrome-bar-backdrop`.
 * - **3D bar refraction** (React Bits mesh): same props → `MeshTransmissionMaterial`.
 *   The WebGL buffer only sees a flat scene, not live DOM — so scroll blur is CSS.
 */
export const FLUID_GLASS_BAR_INITIAL: FluidGlassBarProps = {
  transmission: 1,
  roughness: 0.4,
  thickness: 5,
  ior: 1.15,
  color: '#ffffff',
  attenuationColor: '#ffffff',
  attenuationDistance: 0.25,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
};
