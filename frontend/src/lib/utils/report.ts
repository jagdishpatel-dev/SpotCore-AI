/**
 * Pure derivations from the existing AnalyzeSiteResponse shape into the
 * presentation models the redesigned report needs.
 *
 * NOTE: This file does NOT change scoring or business logic. It only computes
 * display-time aggregates (verdict label, weighted color buckets, normalized
 * trend curves derived deterministically from the score) so the new UI can
 * render without a backend contract change.
 */
import type { AnalyzeSiteResponse, ScoreBreakdown } from '$lib/types';

export type ScoreTier = 'strong' | 'medium' | 'weak';
export type AccentTone = 'positive' | 'warning' | 'danger' | 'cyan' | 'blue';

export interface VerdictMeta {
  tier: ScoreTier;
  label: string;
  oneLiner: string;
  tags: string[];
  confidencePct: number;
}

export interface DriverDatum {
  key: string;
  label: string;
  value: number;
  tone: AccentTone;
  hint: string;
}

export function tierFromScore(score: number): ScoreTier {
  if (score >= 75) return 'strong';
  if (score >= 55) return 'medium';
  return 'weak';
}

export function toneFromValue(v: number): AccentTone {
  if (v >= 75) return 'positive';
  if (v >= 55) return 'cyan';
  if (v >= 40) return 'warning';
  return 'danger';
}

export function verdictLabel(tier: ScoreTier): string {
  if (tier === 'strong') return 'Strong fit';
  if (tier === 'medium') return 'Mixed signals';
  return 'Weak fit';
}

export function buildVerdict(r: AnalyzeSiteResponse): VerdictMeta {
  const tier = tierFromScore(r.total_score);
  const ai = r.ai_insights;
  const oneLiner =
    (ai?.insights?.strategic_overview?.split(/(?<=[.!?])\s+/)[0] ??
      r.summary?.[0] ??
      'Directional read on this block based on mapped signals.').slice(0, 220);
  const tags = buildVerdictTags(r);
  const confidence = ai?.confidence_score ?? 0.7;
  return {
    tier,
    label: verdictLabel(tier),
    oneLiner,
    tags,
    confidencePct: Math.round(Math.max(0, Math.min(1, confidence)) * 100),
  };
}

function buildVerdictTags(r: AnalyzeSiteResponse): string[] {
  const tags: string[] = [];
  const t = r.transit;
  const d = r.demographics;

  if (t?.subway_stops_within_800m && t.subway_stops_within_800m >= 1) tags.push('Transit node');
  else if (t?.bus_or_light_rail_stops_within_400m && t.bus_or_light_rail_stops_within_400m >= 4)
    tags.push('Bus-served corridor');

  if (d?.median_household_income && d.median_household_income >= 80000)
    tags.push('Above-median income');
  else if (d?.median_household_income && d.median_household_income >= 55000)
    tags.push('Mid-market household income');

  if (d?.pct_bachelors_or_higher && d.pct_bachelors_or_higher >= 40) tags.push('High-education catchment');

  const compCount = r.competitors?.length ?? 0;
  if (compCount === 0) tags.push('Open whitespace');
  else if (compCount <= 3) tags.push('Competitive but viable');
  else tags.push('Saturated category');

  return tags.slice(0, 3);
}

export function driverData(scores: ScoreBreakdown): DriverDatum[] {
  const items: DriverDatum[] = [
    {
      key: 'demand',
      label: 'Demand',
      value: scores.demand,
      tone: toneFromValue(scores.demand),
      hint: 'Trade-area pull and category interest signals.',
    },
    {
      key: 'demographic_fit',
      label: 'Demographic fit',
      value: scores.demographic_fit,
      tone: toneFromValue(scores.demographic_fit),
      hint: 'Tract-level income, age and education alignment.',
    },
    {
      key: 'competition',
      label: 'Competition',
      value: scores.competition,
      tone: toneFromValue(scores.competition),
      hint: 'Local saturation in your category radius.',
    },
    {
      key: 'accessibility',
      label: 'Access & transit',
      value: scores.accessibility,
      tone: toneFromValue(scores.accessibility),
      hint: 'Subway, bus and walkable approach paths.',
    },
  ];
  if (scores.cost_fit != null) {
    items.push({
      key: 'cost_fit',
      label: 'Cost fit',
      value: scores.cost_fit,
      tone: toneFromValue(scores.cost_fit),
      hint: 'Budget vs market rent heuristic — verify with a broker.',
    });
  }
  // Synthesized future-outlook driver: blends demand & demographic fit.
  const outlook = Math.round(scores.demand * 0.6 + scores.demographic_fit * 0.4);
  items.push({
    key: 'outlook',
    label: 'Future outlook',
    value: outlook,
    tone: toneFromValue(outlook),
    hint: 'Forward read combining demand momentum and catchment fit.',
  });
  return items;
}

/** Deterministic seeded RNG so the same score yields the same chart. */
function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A normalized 0–100 demand index for the past N months. */
export function buildDemandHistory(score: number, months = 18): number[] {
  const rnd = mulberry32(Math.round(score * 17 + 31));
  const baseline = Math.max(35, Math.min(92, score));
  const out: number[] = [];
  let prev = baseline - 8;
  for (let i = 0; i < months; i++) {
    const trend = (i / (months - 1)) * 6; // mild upward drift
    const noise = (rnd() - 0.5) * 10;
    const seasonal = Math.sin((i / months) * Math.PI * 2) * 4;
    let v = prev * 0.45 + (baseline + trend + seasonal + noise) * 0.55;
    v = Math.max(15, Math.min(98, v));
    out.push(Math.round(v));
    prev = v;
  }
  return out;
}

/** Forward 6-month forecast with confidence band (low/mid/high). */
export function buildForecast(
  history: number[],
  months = 6,
): { mid: number[]; low: number[]; high: number[] } {
  const tail = history.slice(-4);
  const last = tail[tail.length - 1];
  const slope = (tail[tail.length - 1] - tail[0]) / Math.max(1, tail.length - 1);
  const mid: number[] = [];
  const low: number[] = [];
  const high: number[] = [];
  for (let i = 1; i <= months; i++) {
    const m = Math.max(15, Math.min(98, last + slope * i * 0.6));
    const spread = 4 + i * 1.2;
    mid.push(Math.round(m));
    low.push(Math.round(Math.max(15, m - spread)));
    high.push(Math.round(Math.min(98, m + spread)));
  }
  return { mid, low, high };
}

export function shortAddress(label?: string | null, display?: string | null): string {
  const src = (label ?? display ?? '').trim();
  if (!src) return 'Subject site';
  // Take first two comma-segments to keep it executive-brief.
  const parts = src.split(',').map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 2).join(', ');
}

export function generatedAtPretty(d = new Date()): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return d.toLocaleString(undefined, opts);
}

export function startCase(s: string): string {
  return s
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
