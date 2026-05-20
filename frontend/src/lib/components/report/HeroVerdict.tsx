
import GlassCard from './GlassCard';
import ThreadsBg from './ThreadsBg';
import CountUp from './CountUp';
import Reveal from './Reveal';
import Pill from './Pill';
import AccentIcon from './AccentIcon';
import { cn } from '$lib/utils/cn';
import type { VerdictMeta } from '$lib/utils/report';

export interface HeroVerdictProps {
  score: number;
  verdict: VerdictMeta;
}

export default function HeroVerdict({ score, verdict }: HeroVerdictProps) {
  const tone =
    verdict.tier === 'strong' ? 'positive' : verdict.tier === 'medium' ? 'warning' : 'danger';
  const scoreColor =
    verdict.tier === 'strong'
      ? 'gs-cyan-text'
      : verdict.tier === 'medium'
        ? 'text-warning'
        : 'text-danger';

  return (
    <section className="relative isolate">
      <ThreadsBg intensity={0.55} />

      <div className="relative px-2 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal y={8} duration={380} immediate>
            <p className="gs-label text-muted-2">Investment viability</p>
          </Reveal>

          <Reveal y={14} duration={520} delay={80} immediate>
            <GlassCard tone="cyan" className="mt-5 px-6 py-10 md:px-12 md:py-14">
              <div className="flex flex-col items-center gap-7">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'gs-num text-[60px] font-bold leading-none md:text-[88px]',
                      scoreColor,
                    )}
                  >
                    <CountUp to={Math.round(score)} duration={1100} immediate />
                  </span>
                  <span className="gs-num text-muted-2 text-2xl md:text-3xl">/ 100</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <Pill
                    tone={tone === 'positive' ? 'positive' : tone === 'warning' ? 'warning' : 'danger'}
                    size="md"
                  >
                    <AccentIcon name="shield" size={14} />
                    {verdict.label}
                  </Pill>
                  <Pill tone="cyan" size="md">
                    <AccentIcon name="sparkle" size={14} />
                    <span className="gs-num">Confidence {verdict.confidencePct}%</span>
                  </Pill>
                </div>

                <p className="max-w-xl text-balance text-base leading-relaxed text-ink/90 md:text-lg">
                  {verdict.oneLiner}
                </p>

                {verdict.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    {verdict.tags.map((t, i) => (
                      <Reveal key={t} y={6} duration={400} delay={520 + i * 70} immediate>
                        <Pill tone="neutral">{t}</Pill>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
