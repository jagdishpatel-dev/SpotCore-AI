
import { cn } from '$lib/utils/cn';
import type { ReactNode } from 'react';

const toneClass: Record<string, string> = {
  neutral: 'border-line text-ink/90',
  cyan: 'border-accent/40 text-accent',
  blue: 'border-accent-2/40 text-accent-2',
  positive: 'border-positive/40 text-positive',
  warning: 'border-warning/40 text-warning',
  danger: 'border-danger/40 text-danger',
};

const sizeClass: Record<string, string> = {
  sm: 'px-2.5 py-1 text-[11px]',
  md: 'px-3 py-1.5 text-xs',
};

export interface PillProps {
  tone?: 'neutral' | 'cyan' | 'positive' | 'warning' | 'danger' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

export default function Pill({
  tone = 'neutral',
  size = 'sm',
  className,
  children,
}: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-white/[0.02] font-medium tracking-tight',
        toneClass[tone],
        sizeClass[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
