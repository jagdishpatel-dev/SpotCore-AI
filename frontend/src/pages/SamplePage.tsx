import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReportView from '$lib/components/report/ReportView';
import {
  HIGHLAND_PRESCREENS,
  HIGHLAND_SAMPLE_RESPONSE,
  HIGHLAND_ZONING_RETRIEVED,
  HIGHLAND_ZONING_SOURCE,
  type SamplePrescreen,
} from '$lib/sampleReport';
import { cn } from '$lib/utils/cn';

const BUSINESS_TYPE = 'Coffee shop';

const STATUS: Record<SamplePrescreen['status'], { label: string; sub: string; tone: string; dot: string }> = {
  permitted: {
    label: 'Likely permitted',
    sub: 'By right under the base district',
    tone: 'border-[rgba(47,125,79,0.24)] bg-[rgba(47,125,79,0.07)]',
    dot: 'bg-positive',
  },
  conditional: {
    label: 'Conditional use',
    sub: 'Needs a conditional use permit',
    tone: 'border-[rgba(184,100,28,0.24)] bg-[rgba(184,100,28,0.07)]',
    dot: 'bg-warning',
  },
  not_permitted: {
    label: 'Not permitted',
    sub: 'Prohibited in this district',
    tone: 'border-[rgba(180,65,47,0.24)] bg-[rgba(180,65,47,0.07)]',
    dot: 'bg-danger',
  },
  unclear: {
    label: 'Unclear: verify with the city',
    sub: 'An overlay could change the answer',
    tone: 'border-spotcore-border bg-spotcore-surface-soft',
    dot: 'bg-[#6d716c]',
  },
};

const CONFIDENCE: Record<SamplePrescreen['status'], string> = {
  permitted: 'High',
  conditional: 'Medium',
  not_permitted: 'High',
  unclear: 'Low',
};

function PrescreenCard({ p, primary }: { p: SamplePrescreen; primary?: boolean }) {
  const s = STATUS[p.status];
  return (
    <article className={cn('geo-card flex flex-col overflow-hidden hover:!translate-y-0', primary && 'shadow-gs-hero')}>
      <header className="flex items-center justify-between gap-3 border-b border-spotcore-border px-5 py-3.5 md:px-6">
        <span className="font-mono text-[11px] text-spotcore-text-muted">{p.label}</span>
        <span className="rounded-md bg-spotcore-surface-soft px-2 py-0.5 font-mono text-[11px] text-spotcore-text-lead">
          Preliminary
        </span>
      </header>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="font-mono text-[13px] text-spotcore-text">{p.zoningCode}</p>
        <p className="mt-1 text-sm text-spotcore-text-muted">Base district {p.baseDistrict}</p>

        <div className={cn('mt-5 flex items-center gap-3 rounded-xl border px-4 py-3', s.tone)}>
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', s.dot)} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-spotcore-text">{s.label}</p>
            <p className="text-xs text-spotcore-text-muted">{s.sub}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[11px] text-spotcore-text-muted">Confidence</p>
            <p className="font-mono text-sm font-medium text-spotcore-text">{CONFIDENCE[p.status]}</p>
          </div>
        </div>

        <p className="mt-4 max-w-[60ch] text-[14.5px] leading-relaxed text-spotcore-text-lead">{p.reason}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <div className="rounded-lg bg-spotcore-surface-soft px-3 py-2.5">
            <dt className="text-spotcore-text-muted">Matched use</dt>
            <dd className="mt-0.5 font-medium text-spotcore-text">{p.matchedUse}</dd>
          </div>
          <div className="rounded-lg bg-spotcore-surface-soft px-3 py-2.5">
            <dt className="text-spotcore-text-muted">Use table value</dt>
            <dd className="mt-0.5 font-mono font-medium text-spotcore-text">
              {p.tableValue} <span className="font-sans font-normal text-spotcore-text-muted">in {p.baseDistrict.split(' ')[0]}</span>
            </dd>
          </div>
        </dl>

        <h3 className="mt-6 font-mono text-[11px] font-medium text-spotcore-accent">Overlays checked</h3>
        <ul className="mt-2 divide-y divide-spotcore-border">
          {p.overlays.map((o) => (
            <li key={o.code} className="flex items-baseline gap-3 py-2 text-[13px]">
              <span
                className={cn(
                  'w-16 shrink-0 font-mono font-medium',
                  o.changesResult ? 'text-warning' : 'text-spotcore-text',
                )}
              >
                {o.code}
              </span>
              <span className="min-w-0 flex-1 text-spotcore-text-muted">{o.note}</span>
              <span className="shrink-0 font-mono text-[11px] text-spotcore-text-muted">{o.citation}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-mono text-[11px] font-medium text-spotcore-accent">Next steps</h3>
        <ol className="mt-2 space-y-1.5 text-[13.5px] text-spotcore-text">
          {p.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-2.5">
              <span className="font-mono text-[11px] leading-[1.6rem] text-spotcore-text-muted">{i + 1}</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        <footer className="mt-auto flex flex-wrap gap-1.5 pt-6">
          {[...p.citations, ...p.caseNumbers].map((c) => (
            <span
              key={c}
              className="rounded-md border border-spotcore-border bg-spotcore-surface px-2 py-0.5 font-mono text-[11px] text-spotcore-text-muted"
            >
              {c}
            </span>
          ))}
        </footer>
      </div>
    </article>
  );
}

export default function SamplePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Sample report: Highland, Austin · SpotCore';
    return () => {
      document.title = 'SpotCore — Zoning and location pre-screen';
    };
  }, []);

  const [primary, contrast] = HIGHLAND_PRESCREENS;

  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden border-b border-spotcore-border">
        <div className="geo-grid-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="geo-section !pb-14 !pt-10 md:!pb-16 md:!pt-14">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-spotcore-text-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-spotcore-text">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-mono text-spotcore-accent">Sample report</span>
          </nav>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="geo-badge">
                <span className="geo-badge__dot" aria-hidden="true" />
                Highland · Austin, TX
              </span>
              <h1 className="type-display mt-5 max-w-[16ch] text-[2.5rem] md:text-[3.5rem]">
                Can a coffee shop open in Highland?
              </h1>
              <p className="type-lead mt-5 max-w-[40rem]">
                Two parcels a few blocks apart, run through SpotCore's rules engine against the City of Austin's
                zoning data. Same base district, different answers, because of one overlay.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/analyze" className="geo-btn-primary group !px-5 !py-3">
                Run your own address
                <span className="geo-btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <p className="mt-8 font-mono text-[11px] leading-relaxed text-spotcore-text-muted">
            Zoning: {HIGHLAND_ZONING_SOURCE}, retrieved {HIGHLAND_ZONING_RETRIEVED}. Status decided by rules, not
            AI.
          </p>
        </div>
      </section>

      <section aria-labelledby="prescreen-heading">
        <div className="geo-section !pb-8 !pt-12 md:!pt-16">
          <p className="geo-label">Zoning pre-screen</p>
          <h2 id="prescreen-heading" className="geo-section-title mt-4 max-w-[22ch]">
            One overlay changes the answer
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <PrescreenCard p={primary} primary />
            <PrescreenCard p={contrast} />
          </div>
          <p className="mt-6 max-w-[70ch] text-[13px] leading-relaxed text-spotcore-text-muted">
            This is a preliminary pre-screen, not legal advice or approval from any authority. Final
            determinations come from the City of Austin Development Services Department.
          </p>
        </div>
      </section>

      <section aria-labelledby="market-heading" className="border-t border-spotcore-border">
        <div className="geo-section !pb-0 !pt-12 md:!pt-16">
          <p className="geo-label">Market read</p>
          <h2 id="market-heading" className="geo-section-title mt-4 max-w-[22ch]">
            Site report for the permitted parcel
          </h2>
          <p className="geo-section-lead mt-4">
            The map below loads live zoning for the area. Scores, competitors and demographics in this section are
            illustrative.
          </p>
        </div>
        <ReportView
          result={HIGHLAND_SAMPLE_RESPONSE}
          businessType={BUSINESS_TYPE}
          onAnalyzeAnother={() => navigate('/analyze')}
        />
      </section>
    </div>
  );
}
