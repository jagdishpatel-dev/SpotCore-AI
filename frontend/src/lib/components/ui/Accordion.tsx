import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
        return (
          <div
            key={item.id}
            className={cn(
              'transition-all duration-200',
              isOpen ? 'border-l-2 border-l-accent-cyan/70 pl-5' : 'border-l-2 border-l-transparent pl-5',
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              <span className="text-base font-semibold text-text-primary">{item.question}</span>
              <span
                className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border-soft)] text-text-secondary transition-transform"
                style={isOpen ? { transform: 'rotate(180deg)' } : undefined}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
            {isOpen ? (
              <div className="pb-5 pr-12 text-[15px] leading-relaxed text-text-secondary">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
