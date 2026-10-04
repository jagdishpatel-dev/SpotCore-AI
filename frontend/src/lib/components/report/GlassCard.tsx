
import { cn } from '$lib/utils/cn';
import type { CSSProperties, ReactNode } from 'react';

const toneToBorder: Record<string, string> = {
  neutral: 'var(--border-soft)',
  cyan: 'rgba(15, 111, 104, 0.22)',
  positive: 'rgba(47, 125, 79, 0.24)',
  warning: 'rgba(184, 100, 28, 0.24)',
  danger: 'rgba(180, 65, 47, 0.24)',
  blue: 'rgba(10, 79, 74, 0.2)',
};

const toneToGlow: Record<string, string> = {
  neutral: 'rgba(52, 44, 30, 0.22)',
  cyan: 'rgba(15, 111, 104, 0.26)',
  positive: 'rgba(47, 125, 79, 0.24)',
  warning: 'rgba(184, 100, 28, 0.24)',
  danger: 'rgba(180, 65, 47, 0.24)',
  blue: 'rgba(10, 79, 74, 0.24)',
};

export interface GlassCardProps {
  tone?: 'neutral' | 'cyan' | 'positive' | 'warning' | 'danger' | 'blue';
  interactive?: boolean;
  padded?: boolean;
  className?: string;
  children: ReactNode;
}

export default function GlassCard({
  tone = 'neutral',
  interactive = false,
  padded = true,
  className,
  children,
}: GlassCardProps) {
  const style = {
    '--gs-border': toneToBorder[tone],
    '--gs-glow': toneToGlow[tone],
  } as CSSProperties;

  return (
    <div
      className={cn(
        'gs-glass',
        interactive && 'gs-card-hover',
        padded && 'p-6 md:p-7',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
