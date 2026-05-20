/** React Bits FluidGlass `bar` mode material props (framework-agnostic). */
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

/** Edit to tune the glass bar — used by React AppChrome. */
/** Matches React Bits FluidGlass `bar` mode defaults (applied via CSS on `.chrome-bar`). */
export const FLUID_GLASS_BAR_INITIAL: FluidGlassBarProps = {
  transmission: 1,
  roughness: 0,
  thickness: 10,
  ior: 1.15,
  color: '#ffffff',
  attenuationColor: '#ffffff',
  attenuationDistance: 0.25,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
};
