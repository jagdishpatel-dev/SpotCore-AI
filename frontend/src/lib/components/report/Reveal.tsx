
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '$lib/utils/cn';

export interface ReportRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  threshold?: number;
  immediate?: boolean;
  className?: string;
}

export default function Reveal({
  children,
  delay = 0,
  y = 12,
  duration = 500,
  threshold = 0.18,
  immediate = false,
  className,
}: ReportRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate, threshold]);

  const style = {
    '--gs-y': `${y}px`,
    '--gs-d': `${duration}ms`,
    '--gs-delay': `${delay}ms`,
  } as CSSProperties;

  return (
    <div ref={ref} className={cn('gs-reveal', visible && 'is-in', className)} style={style}>
      {children}
    </div>
  );
}
