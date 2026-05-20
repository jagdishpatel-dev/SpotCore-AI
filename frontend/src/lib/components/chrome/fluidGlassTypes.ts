import {
  FLUID_GLASS_BAR_INITIAL,
  type FluidGlassBarProps,
} from './fluidGlassDefaults';

export type { FluidGlassBarProps } from './fluidGlassDefaults';
export const INITIAL = FLUID_GLASS_BAR_INITIAL;

/** @deprecated use `INITIAL` */
export const FLUID_GLASS_BAR_DEFAULTS = INITIAL;

export type FluidGlassBarDefaults = FluidGlassBarProps;
