
import GlassCard from './GlassCard';
import Reveal from './Reveal';
import AccentIcon from './AccentIcon';
import type { AnalyzeSiteResponse } from '$lib/types';

export interface PlayCardsProps {
  result: AnalyzeSiteResponse;
}

function bullets(text: string | undefined, fallback: string[]): string[] {
  if (!text) return fallback;
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 6);
  if (parts.length >= 2) return parts.slice(0, 3);
  return [text.trim(), ...fallback].slice(0, 3);
}

function oneLine(s?: string): string | null {
  if (!s) return null;
  const m = s.match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : s).trim();
}

type IconName = 'spark' | 'shield' | 'compass';
type CardTone = 'positive' | 'warning' | 'cyan';

export default function PlayCards({ result }: PlayCardsProps) {
  const ai = result.ai_insights?.insights;

  const advantage = {
    title: 'Advantage',
    summary: oneLine(ai?.the_edge) ?? 'Clear structural strengths the operator can lean into.',
    items: bullets(ai?.the_edge, [
      'Mapped foot traffic and transit support a real catchment.',
      'Complementary tenants validate the trade area.',
      'Demographics align with the concept profile.',
    ]),
  };

  const risk = {
    title: 'Risk',
    summary: oneLine(ai?.the_blindspot) ?? 'Diligence gaps to close before signing a lease.',
    items: bullets(ai?.the_blindspot, [
      'Lease economics and TI costs are out of model — verify.',
      'OSM coverage may underestimate informal foot traffic.',
      'Census tracts smear neighborhood-level differences.',
    ]),
  };

  const play = {
    title: 'Recommended play',
    summary: oneLine(ai?.the_power_move) ?? 'A focused first 90 days to convert the score into a real signal.',
    items: bullets(ai?.the_power_move, [
      'Pilot the strongest daypart before committing to evening hours.',
      'Run a 2-week traffic audit at the actual storefront.',
      'Lock co-tenancy conversations with adjacent complements.',
    ]),
  };

  const cards: Array<{
    key: string;
    icon: IconName;
    tone: CardTone;
    accent: string;
    data: { title: string; summary: string; items: string[] };
  }> = [
    { key: 'adv', icon: 'spark', tone: 'positive', accent: 'text-positive', data: advantage },
    { key: 'risk', icon: 'shield', tone: 'warning', accent: 'text-warning', data: risk },
    { key: 'play', icon: 'compass', tone: 'cyan', accent: 'text-accent', data: play },
  ];

  return (
    <section className="px-2">
      <Reveal y={14} duration={520}>
        <div className="mb-5 flex items-center gap-2.5">
          <span className="text-accent">
            <AccentIcon name="sparkle" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-ink md:text-xl">
            Advantage · Risk · Recommended play
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {cards.map((c, i) => (
          <Reveal key={c.key} y={18} duration={520} delay={80 + i * 90}>
            <GlassCard tone={c.tone} interactive className="h-full">
              <div className="flex items-start justify-between gap-4">
                <p className={`gs-label ${c.accent}`}>{c.data.title}</p>
                <span className={`${c.accent} opacity-90`}>
                  <AccentIcon name={c.icon} size={20} />
                </span>
              </div>
              <p className="mt-3 text-base font-medium leading-snug text-ink">{c.data.summary}</p>
              <ul className="mt-5 space-y-3">
                {c.data.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-muted"
                  >
                    <span
                      className={`mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-current opacity-70 ${c.accent}`}
                    ></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
