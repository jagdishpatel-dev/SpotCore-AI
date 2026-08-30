import { cn } from '$lib/utils/cn';

const tones = ['surface', 'soft', 'accent', 'surface', 'soft', 'surface', 'accent-soft', 'surface'] as const;

export interface CityGridProps {
  cols?: number;
  rows?: number;
  cellClass?: string;
  gapClass?: string;
  className?: string;
}

export default function CityGrid({
  cols = 8,
  rows = 6,
  cellClass = 'h-3 w-3 md:h-3.5 md:w-3.5',
  gapClass = 'gap-1 md:gap-1.5',
  className = '',
}: CityGridProps) {
  const cells = Array.from({ length: cols * rows }, (_, i) => ({
    tone: tones[i % tones.length],
    accent: i % 17 === 5 || i % 23 === 11,
  }));

  return (
    <div
      className={cn('grid place-items-center', gapClass, className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {cells.map((cell, i) => (
        <span
          key={i}
          className={cn(
            'rounded-sm',
            cellClass,
            cell.tone === 'surface' && 'bg-spotcore-surface',
            cell.tone === 'soft' && 'bg-spotcore-surface-soft',
            cell.tone === 'accent-soft' && 'bg-spotcore-accent-soft',
            cell.tone === 'accent' && 'bg-spotcore-accent opacity-90',
            cell.accent && 'border border-spotcore-accent',
          )}
          style={cell.tone === 'accent' ? { opacity: 0.35 } : undefined}
        />
      ))}
    </div>
  );
}
