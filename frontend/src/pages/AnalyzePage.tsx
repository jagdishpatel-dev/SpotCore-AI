import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzeSite } from '$lib/api';
import LoadingOverlay from '$lib/components/LoadingOverlay';
import AnalysisIntakeForm from '$lib/components/analysis/AnalysisIntakeForm';
import type { AnalysisIntakeValues } from '$lib/components/analysis/analysisIntakeFormConfig';
import { SAMPLE_ANALYZE_SITE_RESPONSE } from '$lib/sampleReport';
import { saveReportSession } from '$lib/reportSession';

const tradeAreaRadiusMap: Record<string, number | null> = {
  '5-minute drive': 500,
  '10-minute drive': 1000,
  '1 mile radius': 1609,
  '10-minute walk': 800,
  'Custom boundary': null,
};

function radiusFromTradeArea(tradeArea: string): number | null {
  return tradeAreaRadiusMap[tradeArea] ?? 500;
}

function extractBudget(constraints: string): number | null {
  const normalized = constraints.toLowerCase();
  if (!/(\$|usd|rent|budget|lease|monthly|month|\/mo)/.test(normalized)) return null;
  const match = constraints.match(/(\d[\d,]*(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSampleReport(values: AnalysisIntakeValues) {
    const businessType = values.businessType || 'Coffee shop';
    saveReportSession({
      result: SAMPLE_ANALYZE_SITE_RESPONSE,
      businessType,
      viewingSample: true,
    });
    navigate('/report');
  }

  async function submit(values: AnalysisIntakeValues) {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeSite({
        address: values.address,
        business_type: values.businessType,
        budget: extractBudget(values.constraints),
        radius_m: radiusFromTradeArea(values.tradeArea),
      });
      saveReportSession({
        result,
        businessType: values.businessType,
        viewingSample: false,
      });
      navigate('/report');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading ? <LoadingOverlay active /> : null}
      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-10 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] md:items-start md:gap-10 md:px-6 md:py-14">
        <div className="gs-card overflow-hidden p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-xs font-medium text-muted underline-offset-4 transition hover:text-ink hover:underline">
              Back to Home
            </Link>
            <span className="text-line">/</span>
            <p className="gs-label text-accent">Run an analysis</p>
          </div>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-[2.35rem] md:leading-tight">
              Build a sharper location brief in under a minute.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted md:text-[15.5px]">
              Tell GeoScore what business you are evaluating, where the site is, who you want to attract,
              and what decision you are trying to make. We will turn that into a clean location readout
              across demand, competition, demographics, accessibility, and site quality.
            </p>
          </div>
          <div className="mt-8">
            <AnalysisIntakeForm
              loading={loading}
              error={error}
              onSubmitRequest={submit}
              onSampleRequest={loadSampleReport}
            />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="gs-card p-6 md:p-7">
            <p className="gs-label text-accent">How GeoScore uses this</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
              Enough structure for better answers, without making the form feel heavy.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The required inputs shape the core analysis. The optional details help GeoScore weight the
              readout around your priorities, constraints, and competitive context.
            </p>
            <ul className="mt-6 space-y-3.5 text-sm leading-relaxed text-muted">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <span><strong className="font-semibold text-ink">Business + customer fit</strong> calibrates the score to your concept, not a generic template.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <span><strong className="font-semibold text-ink">Location context</strong> shapes the trade area and the local market signals we read around the site.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                <span><strong className="font-semibold text-ink">Decision framing</strong> keeps the output focused on the call you actually need to make.</span>
              </li>
            </ul>
          </div>
          <div className="gs-card p-6">
            <p className="gs-label text-accent">Best results</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              <li>Use a full street address when you have one. A neighborhood or area still works for early-stage screening.</li>
              <li>Name a specific customer group, like commuters, families, students, or high-income shoppers.</li>
              <li>Add optional constraints only when they meaningfully change the recommendation.</li>
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
