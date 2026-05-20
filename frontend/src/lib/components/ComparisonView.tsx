
import { cn } from '$lib/utils/cn';
import ScoreCard from './ScoreCard';
import type { AnalyzeSiteResponse } from '$lib/types';

export interface ComparisonViewProps {
  siteA: AnalyzeSiteResponse;
  siteB: AnalyzeSiteResponse;
  winner: string;
  reason: string;
}

export default function ComparisonView({ siteA, siteB, winner, reason }: ComparisonViewProps) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border-2 border-accent bg-accent/10 p-6 text-center shadow-lg shadow-accent/20">
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="text-xl font-bold uppercase tracking-wider text-accent">Winning Location</h3>
        </div>
        <p className="mb-3 text-2xl font-bold text-ink">{winner}</p>
        <div className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-white/5 p-4 text-sm italic leading-relaxed text-muted">
          &ldquo;{reason}&rdquo;
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div
          className={cn(
            'flex flex-col gap-6 rounded-3xl border border-line bg-surface/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30',
            winner === siteA.location.label && 'ring-2 ring-accent',
          )}
        >
          <div className="flex items-center justify-between">
            <h4 className="truncate pr-4 text-lg font-bold text-ink">{siteA.location.label}</h4>
            {winner === siteA.location.label ? (
              <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold uppercase text-white">
                Winner
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ScoreCard title="Demand" score={siteA.scores.demand} accent="sky" />
            <ScoreCard title="Competition" score={siteA.scores.competition} accent="amber" />
            <ScoreCard title="Accessibility" score={siteA.scores.accessibility} accent="emerald" />
            <ScoreCard title="Demo Fit" score={siteA.scores.demographic_fit} accent="violet" />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-canvas/50 p-4 text-xs italic text-muted">
            {siteA.recommendation}
          </div>
        </div>

        <div
          className={cn(
            'flex flex-col gap-6 rounded-3xl border border-line bg-surface/50 p-6 backdrop-blur-sm transition-all hover:border-accent/30',
            winner === siteB.location.label && 'ring-2 ring-accent',
          )}
        >
          <div className="flex items-center justify-between">
            <h4 className="truncate pr-4 text-lg font-bold text-ink">{siteB.location.label}</h4>
            {winner === siteB.location.label ? (
              <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-bold uppercase text-white">
                Winner
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ScoreCard title="Demand" score={siteB.scores.demand} accent="sky" />
            <ScoreCard title="Competition" score={siteB.scores.competition} accent="amber" />
            <ScoreCard title="Accessibility" score={siteB.scores.accessibility} accent="emerald" />
            <ScoreCard title="Demo Fit" score={siteB.scores.demographic_fit} accent="violet" />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-canvas/50 p-4 text-xs italic text-muted">
            {siteB.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}
