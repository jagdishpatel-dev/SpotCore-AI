
import GlassCard from './GlassCard';
import Reveal from './Reveal';
import StaggeredText from './StaggeredText';
import AccentIcon from './AccentIcon';
import type { AnalyzeSiteResponse } from '$lib/types';

export function leadSentence(s: string): string {
  const m = s.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : s).trim();
}

export function restAfterLead(s: string): string {
  const m = s.match(/^[^.!?]*[.!?]\s*(.*)$/s);
  return (m?.[1] ?? '').trim();
}

export interface StrategicReadoutProps {
  result: AnalyzeSiteResponse;
}

export default function StrategicReadout({ result }: StrategicReadoutProps) {
  const insight =
    result.ai_insights?.insights?.strategic_overview ??
    result.summary?.[0] ??
    'Directional read on this block based on mapped signals.';

  const lead = leadSentence(insight);
  const rest = restAfterLead(insight);

  return (
    <section className="px-2">
      <Reveal y={14} duration={520}>
        <div className="mb-5 flex items-center gap-2.5">
          <span className="text-accent">
            <AccentIcon name="compass" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink md:text-xl">Strategic readout</h2>
        </div>
      </Reveal>

      <Reveal y={16} duration={560} delay={80}>
        <GlassCard tone="cyan">
          <p className="gs-label text-accent">Executive summary</p>
          <h3 className="mt-3 text-balance text-[22px] font-semibold leading-snug tracking-tight text-ink md:text-[26px]">
            <StaggeredText text={lead} stagger={45} duration={520} />
          </h3>
          {rest ? (
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">{rest}</p>
          ) : null}
        </GlassCard>
      </Reveal>
    </section>
  );
}
