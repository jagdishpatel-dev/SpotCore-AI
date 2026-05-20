
import { useEffect, useRef, useState } from 'react';
import { tweenNumber } from '$lib/utils/motion';
import { cn } from '$lib/utils/cn';

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  immediate?: boolean;
  className?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 1100,
  decimals = 0,
  immediate = false,
  className,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const startedRef = useRef(false);
  const cancelRef = useRef<(() => void) | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    cancelRef.current?.();
    cancelRef.current = tweenNumber(from, to, duration, setValue);
  };

  useEffect(() => {
    if (immediate) start();
    return () => cancelRef.current?.();
  }, [immediate, from, to, duration]);

  useEffect(() => {
    if (immediate) return;
    const el = spanRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      start();
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  return (
    <span ref={spanRef} className={cn(className)}>
      {value.toFixed(decimals)}
    </span>
  );
}
