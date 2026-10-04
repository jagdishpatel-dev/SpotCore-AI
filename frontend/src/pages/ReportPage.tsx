import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReportView from '$lib/components/report/ReportView';
import type { AnalyzeSiteResponse } from '$lib/types';
import { loadReportSession, clearReportSession } from '$lib/reportSession';

export default function ReportPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<AnalyzeSiteResponse | null>(null);
  const [businessType, setBusinessType] = useState('');
  const [viewingSample, setViewingSample] = useState(false);

  useEffect(() => {
    const payload = loadReportSession();
    if (!payload?.result) {
      navigate('/analyze', { replace: true });
      return;
    }
    setResult(payload.result);
    setBusinessType(payload.businessType ?? '');
    setViewingSample(payload.viewingSample);
    setReady(true);
  }, [navigate]);

  function dismissSample() {
    clearReportSession();
    navigate('/analyze');
  }

  function analyzeAnother() {
    clearReportSession();
    navigate('/analyze');
  }

  if (!ready || !result) {
    return <ReportSkeleton />;
  }

  return (
    <>
      {viewingSample ? (
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
          <div className="flex flex-col gap-3 rounded-xl border border-[rgba(15,111,104,0.2)] bg-spotcore-accent-soft px-4 py-3 text-sm text-ink md:flex-row md:items-center md:justify-between md:px-5">
            <p className="leading-relaxed">
              <span className="mr-1 rounded bg-spotcore-accent px-1.5 py-0.5 font-mono text-[11px] text-white">Sample</span>
              {' '}
              Illustrative scores so you can see the layout. Run
              {' '}
              <Link to="/analyze" className="font-semibold text-ink underline underline-offset-2 hover:text-accent">
                Analyze site
              </Link>
              {' '}
              for live data.
            </p>
            <button
              type="button"
              className="geo-btn-ghost shrink-0 !px-3.5 !py-1.5 !text-xs"
              onClick={dismissSample}
            >
              Back to form
            </button>
          </div>
        </div>
      ) : null}
      <ReportView
        result={result}
        businessType={businessType}
        onAnalyzeAnother={analyzeAnother}
        secondaryLabel={viewingSample ? null : 'Compare another address'}
        onSecondary={viewingSample ? null : analyzeAnother}
      />
    </>
  );
}

/** Layout-shaped placeholder shown while the saved report hydrates. */
function ReportSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 md:px-6" role="status" aria-label="Loading report">
      <div className="flex flex-wrap gap-2">
        {[180, 96, 140, 120].map((w) => (
          <div key={w} className="geo-skeleton h-7 !rounded-lg" style={{ width: w }} />
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-6 rounded-[20px] border border-spotcore-border bg-spotcore-surface px-6 py-14">
        <div className="geo-skeleton h-3 w-32" />
        <div className="geo-skeleton h-20 w-48 !rounded-2xl" />
        <div className="flex gap-2">
          <div className="geo-skeleton h-7 w-28 !rounded-lg" />
          <div className="geo-skeleton h-7 w-32 !rounded-lg" />
        </div>
        <div className="w-full max-w-md space-y-2">
          <div className="geo-skeleton h-3 w-full" />
          <div className="geo-skeleton mx-auto h-3 w-4/5" />
        </div>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-[20px] border border-spotcore-border bg-spotcore-surface p-6">
            <div className="geo-skeleton h-3 w-24" />
            <div className="geo-skeleton h-8 w-20" />
            <div className="geo-skeleton h-2 w-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading report…</span>
    </div>
  );
}
