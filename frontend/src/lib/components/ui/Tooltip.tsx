import { useState, type ReactNode } from 'react';
import { cn } from '$lib/utils/cn';

export interface TooltipProps {
  content?: string;
  side?: 'top' | 'bottom';
  className?: string;
  children?: ReactNode;
}

export default function Tooltip({
  content = '',
  side = 'top',
  className,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      role="presentation"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {children}
      {open && content ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--border-soft)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11px] font-medium text-text-primary shadow-lg transition-opacity duration-[120ms]',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
