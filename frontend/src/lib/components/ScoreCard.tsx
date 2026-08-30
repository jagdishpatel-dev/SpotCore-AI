
import { cn } from '$lib/utils/cn';

const bar: Record<string, string> = {
  sky: 'bg-[#2563EB]',
  amber: 'bg-[#D97706]',
  emerald: 'bg-teal-700',
  violet: 'bg-slate-500',
  rose: 'bg-[#DC2626]',
};

export interface ScoreCardProps {
  title: string;
  score: number;
  hint?: string;
  accent?: 'sky' | 'amber' | 'emerald' | 'violet' | 'rose';
}

export default function ScoreCard({
  title,
  score,
  hint = '',
  accent = 'sky',
}: ScoreCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line/90 bg-surface p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover">
      <div
        className={cn('absolute inset-y-0 left-0 w-[3px] rounded-full', bar[accent])}
        aria-hidden="true"
      ></div>
      <div className="pl-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
            {hint ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{hint}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink">{score}</p>
            <p className="text-[11px] font-medium text-muted/80">/ 100</p>
          </div>
        </div>
      </div>
    </div>
  );
}
