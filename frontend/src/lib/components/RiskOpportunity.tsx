
export interface RiskOpportunityScores {
  demand: number;
  competition: number;
  accessibility: number;
  demographic_fit: number;
  cost_fit?: number | null;
}

type Row = { label: string; side: 'risk' | 'opportunity'; text: string };

function rows(scores: RiskOpportunityScores): Row[] {
  const out: Row[] = [];
  if (scores.demand < 55)
    out.push({
      label: 'Demand',
      side: 'risk',
      text: 'Demand signals look softer—validate foot traffic with weekday counts.',
    });
  else
    out.push({
      label: 'Demand',
      side: 'opportunity',
      text: 'Demand indicators are healthy enough to support a disciplined opening plan.',
    });

  if (scores.competition < 55)
    out.push({
      label: 'Competition',
      side: 'risk',
      text: 'Competition density is high on the map—win on product, hours, or service.',
    });
  else
    out.push({
      label: 'Competition',
      side: 'opportunity',
      text: 'Competitive pressure looks manageable in the scanned radius.',
    });

  if (scores.accessibility < 55)
    out.push({
      label: 'Accessibility',
      side: 'risk',
      text: 'Transit coverage is thin in OSM—double-check real walking paths and parking.',
    });
  else
    out.push({
      label: 'Accessibility',
      side: 'opportunity',
      text: 'Accessibility is a tailwind for catchment size and hiring pools.',
    });

  if (scores.demographic_fit < 55)
    out.push({
      label: 'Demographics',
      side: 'risk',
      text: 'Demographic fit is mixed—tighten assortment and price architecture to the block.',
    });
  else
    out.push({
      label: 'Demographics',
      side: 'opportunity',
      text: 'Demographic fit is workable for the stated concept.',
    });

  if (scores.cost_fit != null && scores.cost_fit < 55) {
    out.push({
      label: 'Budget',
      side: 'risk',
      text: 'Budget vs coarse affordability looks tight—get a broker quote before you commit.',
    });
  } else if (scores.cost_fit != null) {
    out.push({
      label: 'Budget',
      side: 'opportunity',
      text: 'Budget signal is OK under our simple heuristic—still verify real lease economics.',
    });
  }

  return out;
}

export interface RiskOpportunityProps {
  scores: RiskOpportunityScores;
}

export default function RiskOpportunity({ scores }: RiskOpportunityProps) {
  const items = rows(scores);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-danger/12 bg-gradient-to-b from-surface to-[#FEF2F2] p-5 shadow-card ring-1 ring-danger/[0.06]">
        <p className="text-sm font-semibold text-ink">Risks to validate</p>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
          {items
            .filter((i) => i.side === 'risk')
            .map((r) => (
              <li key={r.label} className="flex gap-2">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-danger/80"
                  aria-hidden="true"
                ></span>
                <span>
                  <span className="font-semibold text-ink">{r.label}:</span> {r.text}
                </span>
              </li>
            ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-success/12 bg-gradient-to-b from-surface to-[#F0FDF4] p-5 shadow-card ring-1 ring-success/[0.06]">
        <p className="text-sm font-semibold text-ink">Opportunities to lean on</p>
        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
          {items
            .filter((i) => i.side === 'opportunity')
            .map((r) => (
              <li key={r.label} className="flex gap-2">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-success/80"
                  aria-hidden="true"
                ></span>
                <span>
                  <span className="font-semibold text-ink">{r.label}:</span> {r.text}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
