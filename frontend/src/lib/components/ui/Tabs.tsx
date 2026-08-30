import { useState, type ReactNode } from 'react';
import { cn } from '$lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  children?: ReactNode;
}

export default function Tabs({
  items,
  value: valueProp,
  defaultValue,
  onChange,
  className,
  children,
}: TabsProps) {
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? items[0]?.id ?? ''
  );
  const value = valueProp ?? uncontrolled;

  function selectTab(id: string) {
    if (id === value) return;
    if (valueProp === undefined) setUncontrolled(id);
    onChange?.(id);
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        role="tablist"
        className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--bg-surface-2)]/70 p-1 backdrop-blur-sm"
      >
        {items.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={value === tab.id}
            className={cn(
              'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              value === tab.id
                ? 'text-slate-950 dark:text-slate-950'
                : 'text-text-secondary hover:text-text-primary'
            )}
            onClick={() => selectTab(tab.id)}
          >
            {value === tab.id && (
              <span className="absolute inset-0 -z-10 rounded-full bg-accent-cyan shadow-[0_8px_28px_-12px_rgba(34,211,238,0.7)] transition-opacity duration-[180ms]" />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
