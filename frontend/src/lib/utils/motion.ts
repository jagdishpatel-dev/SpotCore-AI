/**
 * Lightweight motion helpers shared by report primitives.
 *
 * These avoid pulling a runtime animation library; everything is CSS + a small
 * IntersectionObserver / rAF loop.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/** Smoothly tween a numeric value from `from` to `to` over `duration` ms. */
export function tweenNumber(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number) => void,
  ease: (t: number) => number = (t) => 1 - Math.pow(1 - t, 3),
): () => void {
  if (prefersReducedMotion()) {
    onUpdate(to);
    return () => {};
  }
  const start = performance.now();
  let raf = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / Math.max(1, duration));
    onUpdate(from + (to - from) * ease(t));
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export interface InViewOptions {
  /** Disconnects after first intersection. Default true. */
  once?: boolean;
  /** IntersectionObserver threshold 0..1. Default 0.18. */
  threshold?: number;
  /** Called when the node enters the viewport. */
  onEnter?: () => void;
  /** Called when the node leaves the viewport (only meaningful if `once: false`). */
  onLeave?: () => void;
}

/**
 * Reveal-once IntersectionObserver action.
 * Uses callback options (rather than DOM events) so consumers stay TS-safe.
 */
export function inView(node: HTMLElement, opts: InViewOptions = {}) {
  let { once = true, threshold = 0.18, onEnter, onLeave } = opts;

  if (typeof IntersectionObserver === 'undefined') {
    onEnter?.();
    return {
      update(next: InViewOptions) {
        ({ once = true, threshold = 0.18, onEnter, onLeave } = next ?? {});
      },
      destroy() {},
    };
  }

  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          onEnter?.();
          if (once) obs.disconnect();
        } else if (!once) {
          onLeave?.();
        }
      }
    },
    { threshold },
  );
  obs.observe(node);

  return {
    update(next: InViewOptions) {
      ({ once = true, threshold = 0.18, onEnter, onLeave } = next ?? {});
    },
    destroy() {
      obs.disconnect();
    },
  };
}
