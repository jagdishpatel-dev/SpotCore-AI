import { writable } from 'svelte/store';

/** React Bits FluidGlass `bar` mode material props */
export interface FluidGlassBarProps {
  transmission?: number;
  roughness?: number;
  thickness?: number;
  ior?: number;
  scale?: number;
  chromaticAberration?: number;
  anisotropy?: number;
  /** Drei shader uniform (defaults to `anisotropy` when omitted) */
  anisotropicBlur?: number;
  color?: string;
  attenuationColor?: string;
  attenuationDistance?: number;
}

/**
 * Edit `INITIAL` below — save file to apply (HMR). No server restart.
 */
export const INITIAL: FluidGlassBarProps = {
  transmission: 0.3,
  roughness: 0.2,
  thickness: 5,
  ior: 1.15,
  color: '#ffffff',
  attenuationColor: '#ffffff',
  attenuationDistance: 0.1,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
};

export const fluidGlassBarDefaults = writable<FluidGlassBarProps>({ ...INITIAL });

/** @deprecated use `INITIAL` + `fluidGlassBarDefaults` */
export const FLUID_GLASS_BAR_DEFAULTS = INITIAL;

if (import.meta.hot) {
  import.meta.hot.accept((mod) => {
    const next = mod?.INITIAL ?? INITIAL;
    fluidGlassBarDefaults.set({ ...next });
  });
}
