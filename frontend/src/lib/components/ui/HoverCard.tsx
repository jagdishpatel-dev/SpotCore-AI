import type { ReactNode } from 'react';
import { cn } from '$lib/utils/cn';

export interface HoverCardProps {
  active?: boolean;
  className?: string;
  children?: ReactNode;
  onEnter?: () => void;
  onLeave?: () => void;
  onActivate?: () => void;
}

export default function HoverCard({
  active = false,
  className,
  children,
  onEnter,
  onLeave,
  onActivate,
}: HoverCardProps) {
  function handleEnter() {
    onEnter?.();
    onActivate?.();
  }

  return (
    <button
      type="button"
      className={cn(
        'group relative flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-200',
        active
          ? 'border-accent-cyan/40 bg-[var(--bg-surface)] shadow-[0_18px_60px_-30px_rgba(34,211,238,0.32)]'
          : 'border-transparent hover:border-[var(--border-soft)] hover:bg-[var(--bg-surface)]/60',
        className
      )}
      onMouseEnter={handleEnter}
      onFocus={handleEnter}
      onMouseLeave={onLeave}
      onBlur={onLeave}
    >
      {children}
    </button>
  );
}
