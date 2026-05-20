import { useCallback } from 'react';

export interface RevealOptions {
  /** delay in ms before the `revealed` class is applied */
  delay?: number;
  /** stagger applied per child element with [data-reveal-child] */
  childStagger?: number;
  /** how much of the element must be visible (0..1) before triggering */
  threshold?: number;
  /** rootMargin passed to IntersectionObserver */
  rootMargin?: string;
  /** trigger only once (default true) */
  once?: boolean;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function attachReveal(node: HTMLElement, options: RevealOptions = {}) {
  const {
    delay = 0,
    childStagger = 0,
    threshold = 0.18,
    rootMargin = '0px 0px -10% 0px',
    once = true,
  } = options;

  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('revealed');
    return () => {};
  }

  if (prefersReducedMotion()) {
    node.classList.add('revealed');
    node
      .querySelectorAll<HTMLElement>('[data-reveal-child]')
      .forEach((child) => child.classList.add('revealed'));
    return () => {};
  }

  let frame: number | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          frame = window.setTimeout(() => {
            node.classList.add('revealed');
            const children = node.querySelectorAll<HTMLElement>(
              '[data-reveal-child]'
            );
            children.forEach((child, index) => {
              window.setTimeout(() => {
                child.classList.add('revealed');
              }, index * childStagger);
            });
          }, delay);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          node.classList.remove('revealed');
          node
            .querySelectorAll<HTMLElement>('[data-reveal-child]')
            .forEach((child) => child.classList.remove('revealed'));
        }
      }
    },
    { threshold, rootMargin }
  );

  observer.observe(node);

  return () => {
    if (frame) window.clearTimeout(frame);
    observer.disconnect();
  };
}

/**
 * Ref callback that adds the `revealed` class when the element intersects
 * the viewport (port of `$lib/actions/reveal`).
 */
export function useReveal(options: RevealOptions = {}) {
  const {
    delay = 0,
    childStagger = 0,
    threshold = 0.18,
    rootMargin = '0px 0px -10% 0px',
    once = true,
  } = options;

  return useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      return attachReveal(node, {
        delay,
        childStagger,
        threshold,
        rootMargin,
        once,
      });
    },
    [delay, childStagger, threshold, rootMargin, once]
  );
}
