
import { useEffect, useRef, useState } from 'react';
import { cn } from '$lib/utils/cn';

export interface StaggeredTextProps {
  text: string;
  stagger?: number;
  duration?: number;
  delay?: number;
  immediate?: boolean;
  className?: string;
}

export default function StaggeredText({
  text,
  stagger = 55,
  duration = 500,
  delay = 0,
  immediate = false,
  className,
}: StaggeredTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(immediate);
  const words = text.split(/(\s+)/);

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
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [immediate]);

  return (
    <span
      ref={ref}
      className={cn('gs-stagger', visible && 'is-in', className)}
      style={{ '--gs-d': `${duration}ms` } as React.CSSProperties}
    >
      {words.map((w, i) =>
        w.trim() === '' ? (
          <span key={i} className="whitespace-pre">
            {w}
          </span>
        ) : (
          <span
            key={i}
            className="gs-word"
            style={{ '--gs-delay': `${delay + i * stagger}ms` } as React.CSSProperties}
          >
            {w}
          </span>
        ),
      )}
    </span>
  );
}
