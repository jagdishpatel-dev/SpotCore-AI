import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyzeSite } from '$lib/api';
import LoadingOverlay from '$lib/components/LoadingOverlay';
import AnalysisIntakeForm from '$lib/components/analysis/AnalysisIntakeForm';
import type { AnalysisIntakeValues } from '$lib/components/analysis/analysisIntakeFormConfig';
import InquiryVisualPanel from '$lib/components/inquiry/InquiryVisualPanel';
import { SAMPLE_ANALYZE_SITE_RESPONSE } from '$lib/sampleReport';
import { saveReportSession } from '$lib/reportSession';
import './analyze-page.css';

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
      <section className="analyze-page mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(360px,1.05fr)] md:items-stretch md:gap-8 md:px-6 md:py-14 lg:gap-10">
        <InquiryVisualPanel className="md:sticky md:top-24 md:self-start" />
        <div className="analyze-page__form-card overflow-visible p-6 md:p-8 lg:p-9">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="analyze-page__back text-xs font-medium underline-offset-4 transition hover:underline"
            >
              Back to Home
            </Link>
            <span className="analyze-page__crumb">/</span>
            <p className="analyze-page__eyebrow-accent text-[11px] font-semibold uppercase tracking-[0.14em]">
              Run an analysis
            </p>
          </div>
          <div className="mt-4 max-w-3xl">
            <h1 className="analyze-page__title text-3xl font-semibold tracking-tight md:text-[2.35rem] md:leading-tight">
              Build a sharper location brief in under a minute.
            </h1>
            <p className="analyze-page__lead mt-3 max-w-2xl text-base leading-relaxed md:text-[15.5px]">
              Tell SpotCore what business you are evaluating, where the site is, who you want to attract,
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
      </section>
    </>
  );
}
