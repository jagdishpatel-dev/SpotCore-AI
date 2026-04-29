'use client';

import { useMemo, useState } from 'react';
import { analyzeSite, analyzeCompare } from '@/lib/api';
import AddressAutocomplete from '@/lib/components/AddressAutocomplete';
import ComparisonView from '@/lib/components/ComparisonView';
import LoadingOverlay from '@/lib/components/LoadingOverlay';
import ExecutiveReport from '@/lib/components/ExecutiveReport';
import type {
  AnalyzeSiteResponse,
  CompareSitesResponse,
} from '@/lib/types';

export default function AnalyzePage() {
  const [address, setAddress] = useState('');
  const [addressB] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [radiusInput, setRadiusInput] = useState('500');
  const [budgetInput, setBudgetInput] = useState('');

  const [mode] = useState<'analyze' | 'compare'>('analyze');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeSiteResponse | null>(null);
  const [compareResult, setCompareResult] = useState<CompareSitesResponse | null>(null);

  const isMockResult = useMemo(
    () =>
      !!result &&
      typeof result.data_sources === 'object' &&
      result.data_sources !== null &&
      (result.data_sources as Record<string, unknown>)['mode'] === 'mock',
    [result],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCompareResult(null);
    try {
      const budget = budgetInput.trim() === '' ? null : Number(budgetInput);
      if (budget !== null && (Number.isNaN(budget) || budget < 0)) {
        throw new Error('Budget must be a positive number (monthly USD) or left blank.');
      }
      const rRaw = radiusInput.trim() === '' ? 500 : Number(radiusInput);
      if (Number.isNaN(rRaw) || !Number.isFinite(rRaw)) {
        throw new Error('Search radius must be a number (meters), e.g. 500.');
      }
      const radius_m = Math.round(rRaw);
      if (radius_m < 100 || radius_m > 2000) {
        throw new Error('Search radius must be between 100 and 2000 meters.');
      }

      if (mode === 'analyze') {
        const r = await analyzeSite({
          address,
          business_type: businessType,
          budget,
          radius_m,
        });
        setResult(r);
      } else {
        const r = await analyzeCompare({
          address_a: address,
          address_b: addressB,
          business_type: businessType,
          budget,
          radius_m,
        });
        setCompareResult(r);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <main className="mx-auto max-w-6xl px-4 pt-32 pb-16 md:px-6 md:pt-36 md:pb-20">
        {loading ? (
          <LoadingOverlay active={true} />
        ) : compareResult ? (
          <div className="flex flex-col gap-8 animate-fade-in-up">
            <ComparisonView
              siteA={compareResult.site_a}
              siteB={compareResult.site_b}
              winner={compareResult.comparison_winner}
              reason={compareResult.winner_reason}
            />
          </div>
        ) : result ? (
          <ExecutiveReport
            result={result}
            businessType={businessType}
            isMock={isMockResult}
            onReset={() => setResult(null)}
          />
        ) : (
          <section className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-10">
            <div className="rounded-2xl border border-line/90 bg-surface/70 p-6 shadow-card ring-1 ring-white/10 backdrop-blur-md backdrop-saturate-150 md:p-8">
              <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-tight">
                Is this block right for your concept?
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                Enter an address and business type. GeoScore pulls nearby OSM businesses, Census tract
                signals, and simple transit proximity to produce a transparent 0–100 score—not a black
                box model.
              </p>

              <form className="mt-8 space-y-5" onSubmit={submit}>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="addr">Address</label>
                  <AddressAutocomplete id="addr" value={address} onChange={setAddress} required />
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Suggestions use Photon (OSM) with an NYC-area bias; debounced after 3+ characters.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="biz">Business type</label>
                  <input
                    id="biz"
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-white/5 placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="coffee shop, nail salon, gym…"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="radius">
                    OSM search radius (meters)
                  </label>
                  <input
                    id="radius"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-white/5 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15 md:max-w-xs"
                    value={radiusInput}
                    onChange={(e) => setRadiusInput(e.target.value)}
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    Overpass uses this distance around the pin for businesses and transit POIs (100–2000m).
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="budget">
                    Optional monthly budget (USD)
                  </label>
                  <input
                    id="budget"
                    inputMode="numeric"
                    className="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-white/5 placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="e.g. 5000 (leave blank to ignore)"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-55 md:w-auto md:min-w-[220px]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Analyzing…
                    </span>
                  ) : (
                    'Analyze site'
                  )}
                </button>
              </form>
            </div>

            <aside className="rounded-2xl border border-line/90 bg-surface/85 p-6 shadow-card ring-1 ring-white/10 backdrop-blur-lg backdrop-saturate-150 md:p-7">
              <p className="text-sm font-semibold tracking-tight text-ink">What you get</p>
              <ul className="mt-4 space-y-3.5 text-sm leading-relaxed text-muted">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-600/30" />
                  <span><strong className="font-semibold text-ink">Score + rationale</strong> with explicit sub-scores.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-600/30" />
                  <span><strong className="font-semibold text-ink">Competitors vs complements</strong> from OpenStreetMap.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-600/30" />
                  <span><strong className="font-semibold text-ink">Census + transit summaries</strong> for tract context.</span>
                </li>
              </ul>
              <div className="mt-6 rounded-xl border border-line/60 bg-canvas/80 p-4 text-xs leading-relaxed text-muted">
                MVP disclaimer: OSM coverage varies; Census is tract-level; scoring is rules-based. Treat
                this as a diligence starting point, not a lease decision.
              </div>
            </aside>
          </section>
        )}
      </main>

      <footer className="mt-20 border-t border-line/80 bg-surface/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-6">
          <p className="max-w-xl leading-relaxed">
            GeoScore AI MVP · Rules-based scoring · Not financial or legal advice
          </p>
          <p className="text-muted/70">Built with Next.js + FastAPI</p>
        </div>
      </footer>
    </div>
  );
}
