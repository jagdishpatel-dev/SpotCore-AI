import type { FluidGlassBarProps } from './fluidGlassDefaults';

/** Mirror glass props to CSS so every tweak is visible (WebGL + frosted bar). */
export function syncGlassCssVars(p: FluidGlassBarProps) {
  const root = document.documentElement;
  const t = p.transmission ?? 1;
  const r = p.roughness ?? 0;
  const th = p.thickness ?? 5;
  const ior = p.ior ?? 1.15;
  const chroma = p.chromaticAberration ?? 0.1;

  root.style.setProperty('--glass-transmission', String(t));
  root.style.setProperty('--glass-roughness', String(r));
  root.style.setProperty('--glass-thickness', String(Math.min(th / 15, 1)));
  root.style.setProperty('--glass-ior', String(Math.max(0, ior - 1)));
  root.style.setProperty('--glass-chroma', String(chroma));
}
