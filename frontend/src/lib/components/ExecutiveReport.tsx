
import type { AnalyzeSiteResponse, Recommendation, ScoreBreakdown } from '@/lib/types';

interface Props {
  result: AnalyzeSiteResponse;
  businessType: string;
  isMock?: boolean;
  onReset: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function verdictText(rec: Recommendation): string {
  if (rec === 'strong') return 'Strong site fundamentals. Recommend proceeding to site visit.';
  if (rec === 'medium') return 'Mixed signals present. Additional diligence advised before commitment.';
  return 'Weak fundamentals at this location. Consider evaluating alternative sites.';
}

function recLabel(rec: Recommendation): string {
  if (rec === 'strong') return 'Strong Fit';
  if (rec === 'medium') return 'Mixed Signals';
  return 'Weak Fit';
}

function recChipStyle(rec: Recommendation): string {
  if (rec === 'strong') return 'bg-[#E3F3EA] text-[#15803D]';
  if (rec === 'medium') return 'bg-[#FDF3E3] text-[#92400E]';
  return 'bg-red-50 text-red-700';
}

function barColor(score: number): string {
  if (score >= 75) return '#15803D';
  if (score >= 55) return '#B45309';
  return '#991B1B';
}

function fmt(n: number | null | undefined, prefix = '', suffix = ''): string {
  if (n == null) return '—';
  return `${prefix}${n.toLocaleString()}${suffix}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

function today(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-score bar row ───────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number | null | undefined }) {
  if (score == null) return null;
  const color = barColor(score);
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-[3px] bg-[#EBE7E2] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-6 text-right text-[11px] font-semibold tabular-nums" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#E4DFD9] rounded-xl p-6 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] mb-5">
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[9px] font-semibold uppercase tracking-widest text-[#9C9490]">{label}</dt>
      <dd className="text-[20px] font-semibold text-[#141414] leading-none tabular-nums">{value}</dd>
    </div>
  );
}

// ─── Risk signal row ─────────────────────────────────────────────────────────

const SIGNAL_MSGS: Record<string, [string, string, string]> = {
  demand: [
    'High commercial POI and complementary business density in the scanned radius.',
    'Moderate POI density in the scanned radius.',
    'Low commercial POI density within the search radius.',
  ],
  competition: [
    'Low competitor count mapped within the search radius.',
    'Moderate number of similar businesses mapped in the radius.',
    'High competitor density mapped within the search radius.',
  ],
  accessibility: [
    'Multiple subway and bus nodes mapped within range.',
    'Some transit infrastructure present within the search radius.',
    'Limited transit nodes mapped within the search radius.',
  ],
  demographic_fit: [
    'Census tract income and age profile aligns with this business type.',
    'Census tract demographics partially match — mixed fit signal.',
    'Census tract demographics show low alignment with this business type.',
  ],
};

function SignalRow({ dim, score }: { dim: string; score: number | null | undefined }) {
  if (score == null) return null;
  const msgs = SIGNAL_MSGS[dim];
  const idx = score >= 75 ? 0 : score >= 55 ? 1 : 2;
  const color = idx === 0 ? '#15803D' : idx === 1 ? '#B45309' : '#991B1B';
  const prefix = idx === 0 ? 'Signal' : idx === 1 ? 'Watch' : 'Risk';
  const label = dim === 'demographic_fit' ? 'Demographics' : dim.charAt(0).toUpperCase() + dim.slice(1);
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F0EBE5] last:border-0">
      <span className="mt-0.5 shrink-0 text-[10px]" style={{ color }}>●</span>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider mr-2" style={{ color }}>
          {prefix}
        </span>
        <span className="text-[13px] text-[#141414] font-medium">{label}</span>
        <p className="mt-0.5 text-[12px] text-[#6B6460] leading-snug">{msgs[idx]}</p>
      </div>
      <span className="shrink-0 text-[12px] font-semibold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

// ─── VerdictCard ─────────────────────────────────────────────────────────────

function VerdictCard({ result }: { result: AnalyzeSiteResponse }) {
  const { total_score, recommendation, scores, location, ai_insights } = result;
  const confidence = ai_insights?.confidence_score;

  return (
    <div className="bg-white border border-[#E4DFD9] rounded-xl shadow-sm overflow-hidden">
      {/* Top meta bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-[#F0EBE5]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490]">
          Investment Viability Report
        </span>
        <span className="text-[10px] text-[#9C9490]">
          {confidence != null && `Confidence ${Math.round(confidence * 100)}% · `}
          {today()}
          {location.census_tract && ` · Tract ${location.census_tract}`}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row gap-8 p-8">
        {/* Score column */}
        <div className="flex flex-col items-start md:w-44 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] mb-2">
            Investment Viability
          </p>
          <div className="flex items-end gap-1.5 leading-none">
            <span className="text-[88px] font-semibold tabular-nums text-[#141414] leading-none">
              {total_score}
            </span>
            <span className="text-[14px] text-[#9C9490] mb-3">/100</span>
          </div>
          <span
            className={`mt-3 inline-block text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide ${recChipStyle(recommendation)}`}
          >
            {recLabel(recommendation)}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-[#F0EBE5] self-stretch" />

        {/* Verdict + sub-scores */}
        <div className="flex-1 flex flex-col gap-5 justify-center">
          <p className="text-[18px] font-medium text-[#141414] leading-snug max-w-md">
            {verdictText(recommendation)}
          </p>
          <p className="text-[12px] text-[#9C9490]">
            {location.label}
            {location.county && `, ${location.county}`}
          </p>
          <div className="flex flex-col gap-2.5 mt-1 max-w-sm">
            <ScoreBar label="Demand" score={scores.demand} />
            <ScoreBar label="Access" score={scores.accessibility} />
            <ScoreBar label="Competition" score={scores.competition} />
            <ScoreBar label="Demographics" score={scores.demographic_fit} />
            {scores.cost_fit != null && <ScoreBar label="Cost Fit" score={scores.cost_fit} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StrategicReadout ─────────────────────────────────────────────────────────

function StrategicReadout({ insights }: { insights: AnalyzeSiteResponse['ai_insights'] }) {
  if (!insights) {
    return (
      <Section label="Strategic Readout">
        <p className="text-[13px] text-[#9C9490] italic">
          Strategic analysis will appear after the report is fully generated.
        </p>
      </Section>
    );
  }

  const { strategic_overview, the_edge, the_blindspot, the_power_move } = insights.insights;

  return (
    <div className="bg-white border border-[#E4DFD9] rounded-xl shadow-sm p-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] mb-5">
        Strategic Readout
      </p>

      {/* Quote */}
      <blockquote className="border-l-2 border-[#0E6B63] pl-5 mb-6">
        <p className="font-serif italic text-[17px] text-[#2C2C2C] leading-relaxed">
          &ldquo;{strategic_overview}&rdquo;
        </p>
      </blockquote>

      {/* Decision cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Advantage */}
        <div className="p-5 rounded-lg border border-[#E4DFD9] border-l-2 border-l-[#15803D]">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#15803D] mb-2">
            Advantage
          </p>
          <p className="text-[13px] text-[#6B6460] leading-relaxed">{the_edge}</p>
        </div>

        {/* Risk */}
        <div className="p-5 rounded-lg border border-[#E4DFD9] border-l-2 border-l-[#92400E]">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#92400E] mb-2">
            Risk
          </p>
          <p className="text-[13px] text-[#6B6460] leading-relaxed">{the_blindspot}</p>
        </div>

        {/* Recommended Play */}
        <div className="p-5 rounded-lg border border-[#E4DFD9] border-l-2 border-l-[#0E6B63]">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#0E6B63] mb-2">
            Recommended Play
          </p>
          <p className="text-[13px] text-[#6B6460] leading-relaxed">{the_power_move}</p>
        </div>
      </div>
    </div>
  );
}

// ─── MarketProfile ────────────────────────────────────────────────────────────

function MarketProfile({ demographics }: { demographics: AnalyzeSiteResponse['demographics'] }) {
  const d = demographics;
  return (
    <Section label="Market Profile">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
        <Stat label="Population" value={fmt(d.population ?? d.total_population)} />
        <Stat label="Median Income" value={fmt(d.median_household_income ?? d.avg_household_income, '$')} />
        <Stat label="Median Age" value={d.median_age != null ? `${d.median_age}` : '—'} />
        <Stat label="College Educated" value={fmtPct(d.pct_bachelors_or_higher)} />
        <Stat label="Vacancy Rate" value={fmtPct(d.vacancy_rate_pct)} />
        <Stat label="Transit Commuters" value={fmtPct(d.commute_pct_public_transit)} />
      </dl>
    </Section>
  );
}

// ─── MobilityAccess ───────────────────────────────────────────────────────────

function MobilityAccess({ transit }: { transit: AnalyzeSiteResponse['transit'] }) {
  const t = transit;
  const nearestM = t.nearest_subway_distance_m;
  return (
    <Section label="Mobility & Access">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
        <Stat label="Subway Nodes (800m)" value={fmt(t.subway_stops_within_800m)} />
        <Stat
          label="Nearest Subway"
          value={nearestM != null ? `${Math.round(nearestM)}m` : '—'}
        />
        <Stat label="Bus Stops (400m)" value={fmt(t.bus_or_light_rail_stops_within_400m)} />
        <Stat label="Walk Score" value={t.walk_score != null ? String(t.walk_score) : '—'} />
      </dl>
    </Section>
  );
}

// ─── CompetitionIntel ─────────────────────────────────────────────────────────

function CompetitionIntel({
  competitors,
  complementary,
  radiusM,
}: {
  competitors: AnalyzeSiteResponse['competitors'];
  complementary: AnalyzeSiteResponse['complementary_businesses'];
  radiusM: number;
}) {
  const MAX = 8;
  const showComp = competitors.slice(0, MAX);
  const showCompl = complementary.slice(0, MAX);

  return (
    <Section label="Competitive Landscape">
      <p className="text-[12px] text-[#9C9490] mb-5">
        {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} · {complementary.length} complementary business{complementary.length !== 1 ? 'es' : ''} within {radiusM}m
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitors */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] mb-3">
            Competitors
          </p>
          <ul className="space-y-0 divide-y divide-[#F0EBE5]">
            {showComp.map((c, i) => (
              <li key={i} className="flex items-center gap-2 py-2">
                <span className="flex-1 text-[13px] font-medium text-[#141414] truncate">{c.name}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-red-50 text-red-600 shrink-0">
                  {c.category}
                </span>
                <span className="text-[11px] tabular-nums text-[#9C9490] shrink-0 w-12 text-right">
                  {Math.round(c.distance_m)}m
                </span>
              </li>
            ))}
            {competitors.length > MAX && (
              <li className="py-2 text-[11px] text-[#9C9490] italic">
                and {competitors.length - MAX} more…
              </li>
            )}
          </ul>
        </div>

        {/* Complementary */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9C9490] mb-3">
            Complementary
          </p>
          <ul className="space-y-0 divide-y divide-[#F0EBE5]">
            {showCompl.map((c, i) => (
              <li key={i} className="flex items-center gap-2 py-2">
                <span className="flex-1 text-[13px] font-medium text-[#141414] truncate">{c.name}</span>
                <span className="text-[9px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-[#E3F3EA] text-[#15803D] shrink-0">
                  {c.category}
                </span>
                <span className="text-[11px] tabular-nums text-[#9C9490] shrink-0 w-12 text-right">
                  {Math.round(c.distance_m)}m
                </span>
              </li>
            ))}
            {complementary.length > MAX && (
              <li className="py-2 text-[11px] text-[#9C9490] italic">
                and {complementary.length - MAX} more…
              </li>
            )}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ─── RiskSignals ──────────────────────────────────────────────────────────────

function RiskSignals({ scores }: { scores: ScoreBreakdown }) {
  return (
    <Section label="Risk Signals">
      <div className="space-y-0">
        <SignalRow dim="demand" score={scores.demand} />
        <SignalRow dim="competition" score={scores.competition} />
        <SignalRow dim="accessibility" score={scores.accessibility} />
        <SignalRow dim="demographic_fit" score={scores.demographic_fit} />
        {scores.cost_fit != null && <SignalRow dim="cost_fit" score={scores.cost_fit} />}
      </div>
    </Section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ExecutiveReport({ result, businessType, isMock = false, onReset }: Props) {
  const radiusM =
    (result.data_sources as Record<string, unknown> | undefined)?.['radius_m'] as number | undefined ?? 500;

  return (
    <div className="min-h-screen bg-[#F7F5F2] animate-fade-in-up">
      <div className="max-w-[900px] mx-auto px-4 md:px-6 py-10 space-y-5">

        {/* Mock banner */}
        {isMock && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
            Showing mock data — set your API keys to see live results.
          </div>
        )}

        {/* Business type label + reset */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9C9490]">
            {businessType} · Site Analysis
          </p>
          <button
            onClick={onReset}
            className="text-[12px] text-[#6B6460] hover:text-[#141414] transition-colors"
          >
            ← New Analysis
          </button>
        </div>

        <VerdictCard result={result} />
        <StrategicReadout insights={result.ai_insights} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MarketProfile demographics={result.demographics} />
          <MobilityAccess transit={result.transit} />
        </div>

        <CompetitionIntel
          competitors={result.competitors}
          complementary={result.complementary_businesses}
          radiusM={radiusM}
        />

        <RiskSignals scores={result.scores} />

        {/* Footer */}
        <p className="text-center text-[10px] text-[#9C9490] border-t border-[#E4DFD9] pt-5 pb-2">
          SpotCore Intelligence Report · Data sourced from OSM &amp; US Census ACS5 · Not financial or legal advice
        </p>
      </div>
    </div>
  );
}
