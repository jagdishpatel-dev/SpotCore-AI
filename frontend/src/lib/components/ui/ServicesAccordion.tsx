import { useEffect, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '$lib/utils/cn';
import { prefersReducedMotion } from '$lib/utils/motion';

export interface ServiceItem {
  id: string;
  title: string;
  subtitle?: string;
  body: string;
  bullets?: string[];
}

export interface ServicesAccordionProps {
  items: ServiceItem[];
  multiple?: boolean;
  defaultOpen?: string | null;
  idPrefix?: string;
  className?: string;
}

export default function ServicesAccordion({
  items,
  multiple = false,
  defaultOpen,
  idPrefix = 'svc',
  className = '',
}: ServicesAccordionProps) {
  const initial =
    defaultOpen === undefined ? (items[0]?.id ?? null) : defaultOpen;
  const [openSet, setOpenSet] = useState<Set<string>>(
    () => new Set(initial ? [initial] : []),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const reduce = prefersReducedMotion();

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      listEl.classList.add('svc-revealed');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            listEl.classList.add('svc-revealed');
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    obs.observe(listEl);
    return () => obs.disconnect();
  }, [reduce]);

  const toggle = (id: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div ref={listRef} className={cn('svc-list flex flex-col gap-3', className)}>
      {items.map((item, i) => {
        const open = openSet.has(item.id);
        return (
          <div
            key={item.id}
            style={{ '--svc-i': i } as React.CSSProperties}
            className={cn(
              'svc-row group/row relative rounded-xl border bg-[var(--bg-surface)] transition-[border-color,box-shadow,background-color] duration-200 ease-out',
              open
                ? 'border-geoscorer-accent/35 shadow-[0_18px_48px_-26px_rgba(15,124,117,0.2)]'
                : 'border-[var(--border-soft)] hover:border-accent-cyan/25 hover:bg-[var(--bg-surface-2)]/60 hover:shadow-[0_10px_28px_-18px_rgba(15,23,42,0.45)]',
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                id={`${idPrefix}-header-${item.id}`}
                aria-expanded={open}
                aria-controls={`${idPrefix}-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex min-h-[64px] w-full items-center justify-between gap-5 rounded-xl px-5 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-0 sm:gap-6 sm:px-6 sm:py-6"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[17px] font-semibold leading-snug tracking-[-0.005em] text-text-primary sm:text-[19px]">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="text-[13px] font-normal leading-snug text-text-muted sm:text-[14px]">
                      {item.subtitle}
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border transition-[transform,border-color,background-color,color] duration-200 ease-out',
                    open
                      ? 'rotate-45 border-accent-cyan/55 bg-accent-cyan/12 text-accent-cyan'
                      : 'border-[var(--border-soft)] text-text-secondary group-hover/row:border-accent-cyan/45 group-hover/row:text-accent-cyan',
                  )}
                  aria-hidden="true"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.25} />
                </span>
              </button>
            </h3>

            {open ? (
              <div
                id={`${idPrefix}-panel-${item.id}`}
                role="region"
                aria-labelledby={`${idPrefix}-header-${item.id}`}
                className="px-5 pb-6 sm:px-6 sm:pb-7"
                style={{
                  animation: reduce
                    ? undefined
                    : 'svc-panel-in 220ms cubic-bezier(0.22, 1, 0.36, 1) forwards',
                }}
              >
                <div className="max-w-[640px]">
                  <p className="text-[15px] leading-[1.65] text-text-secondary">{item.body}</p>
                  {item.bullets && item.bullets.length > 0 ? (
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {item.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-text-secondary"
                        >
                          <span
                            className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan/70"
                            aria-hidden="true"
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
