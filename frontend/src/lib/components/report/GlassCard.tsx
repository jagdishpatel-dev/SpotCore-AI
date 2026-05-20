
import { cn } from '$lib/utils/cn';
import type { CSSProperties, ReactNode } from 'react';

const toneToBorder: Record<string, string> = {
  neutral: 'rgba(148, 163, 184, 0.18)',
  cyan: 'rgba(34, 211, 238, 0.32)',
  positive: 'rgba(34, 197, 94, 0.32)',
  warning: 'rgba(249, 115, 22, 0.32)',
  danger: 'rgba(239, 68, 68, 0.32)',
  blue: 'rgba(56, 189, 248, 0.32)',
};

const toneToGlow: Record<string, string> = {
  neutral: 'rgba(2,6,23,0.6)',
  cyan: 'rgba(34, 211, 238, 0.18)',
  positive: 'rgba(34, 197, 94, 0.16)',
  warning: 'rgba(249, 115, 22, 0.18)',
  danger: 'rgba(239, 68, 68, 0.18)',
  blue: 'rgba(56, 189, 248, 0.2)',
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
