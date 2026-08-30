import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { prefersReducedMotion } from '$lib/hooks/useReveal';

export interface BlurTextProps {
  text?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  delay?: number;
  stepDuration?: number;
  threshold?: number;
  rootMargin?: string;
  start?: boolean;
  className?: string;
  onAnimationComplete?: () => void;
  onComplete?: () => void;
}

const blurTextStyles = `
  .blur-text {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0;
  }

  .blur-text__segment {
    display: inline-block;
    will-change: transform, filter, opacity;
    filter: blur(10px);
    opacity: 0;
    transform: translateY(-50px);
  }

  .blur-text--bottom .blur-text__segment {
    transform: translateY(50px);
  }

  .blur-text__segment--active {
    animation: blur-text-from-top var(--blur-duration, 700ms) ease forwards;
    animation-delay: var(--blur-delay, 0s);
  }

  .blur-text--bottom .blur-text__segment--active {
    animation-name: blur-text-from-bottom;
  }

  @keyframes blur-text-from-top {
    0% {
      filter: blur(10px);
      opacity: 0;
      transform: translateY(-50px);
    }
    50% {
      filter: blur(5px);
      opacity: 0.5;
      transform: translateY(5px);
    }
    100% {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes blur-text-from-bottom {
    0% {
      filter: blur(10px);
      opacity: 0;
      transform: translateY(50px);
    }
    50% {
      filter: blur(5px);
      opacity: 0.5;
      transform: translateY(-5px);
    }
    100% {
      filter: blur(0);
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .blur-text__segment,
    .blur-text__segment--active {
      animation: none;
      filter: none;
      opacity: 1;
      transform: none;
    }
  }
`;

export default function BlurText({
  text = '',
  animateBy = 'words',
  direction = 'top',
  delay = 200,
  stepDuration = 0.35,
  threshold = 0.1,
  rootMargin = '0px',
  start,
  className = '',
  onAnimationComplete,
  onComplete,
}: BlurTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);

  const segments = useMemo(
    () => (animateBy === 'words' ? text.split(' ') : text.split('')),
    [animateBy, text]
  );

  const active = reduced || (start !== undefined ? start : inView);
  const durationMs = Math.round(stepDuration * 2 * 1000);

  function onSegmentAnimationEnd(index: number) {
    if (index === segments.length - 1) {
      onAnimationComplete?.();
      onComplete?.();
    }
  }

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduced || start !== undefined) return;

    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, start, threshold, rootMargin]);

  return (
    <>
      <style>{blurTextStyles}</style>
      <span
        ref={rootRef}
        className={`blur-text ${className}${direction === 'bottom' ? ' blur-text--bottom' : ''}`}
        aria-label={text}
      >
        {segments.map((segment, index) => {
          const style: CSSProperties = {
            ['--blur-delay' as string]: `${(index * delay) / 1000}s`,
            ['--blur-duration' as string]: `${durationMs}ms`,
          };

          return (
            <span
              key={`${segment}-${index}`}
              className={`blur-text__segment${active ? ' blur-text__segment--active' : ''}`}
              style={style}
              onAnimationEnd={() => onSegmentAnimationEnd(index)}
            >
              {segment}
              {animateBy === 'words' && index < segments.length - 1 ? '\u00a0' : null}
            </span>
          );
        })}
      </span>
    </>
  );
}
