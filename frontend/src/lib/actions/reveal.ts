/**
 * `use:reveal` — adds the `revealed` class to an element the first time it
 * intersects the viewport. Pair with the `.reveal-init` utility (see
 * `app.css`) to drive a fade + lift animation. Optional variants are added
 * via class names: `from-left`, `from-right`, `from-top`, `scale-in`.
 *
 * Usage:
 *   <div class="reveal-init" use:reveal={{ delay: 120 }}>…</div>
 */

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

export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  const {
    delay = 0,
    childStagger = 0,
    threshold = 0.18,
    rootMargin = '0px 0px -10% 0px',
    once = true,
  } = options;

  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('revealed');
    return { destroy() {} };
  }

  const prefersReduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduce) {
    node.classList.add('revealed');
    node
      .querySelectorAll<HTMLElement>('[data-reveal-child]')
      .forEach((child) => child.classList.add('revealed'));
    return { destroy() {} };
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

  return {
    destroy() {
      if (frame) window.clearTimeout(frame);
      observer.disconnect();
    },
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
