import { useState } from 'react';
import { cn } from '$lib/utils/cn';

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className = '' }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <div className={cn('flex flex-col divide-y divide-[var(--border-soft)]', className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `accordion-panel-${item.id}`;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(item.id)}
            >
              <span
                className={cn(
                  'font-display text-lg font-medium tracking-[-0.02em] transition-colors md:text-xl',
                  isOpen ? 'text-spotcore-accent' : 'text-text-primary group-hover:text-spotcore-accent',
                )}
              >
                {item.question}
              </span>
              <span
                className={cn(
                  'relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors duration-300',
                  isOpen
                    ? 'border-spotcore-accent bg-spotcore-accent text-white'
                    : 'border-[var(--border-soft)] text-text-secondary',
                )}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 12 12"
                  className={cn('h-3 w-3 transition-transform duration-300', isOpen && 'rotate-45')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              className={cn(
                'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-[60ch] pb-6 pr-12 text-[15px] leading-relaxed text-text-secondary">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
