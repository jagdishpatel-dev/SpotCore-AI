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
    return (
      <div className="mx-auto max-w-lg flex-1 px-4 py-24 text-center text-muted md:py-32">
        <p className="text-sm">Loading report…</p>
      </div>
    );
  }

  return (
    <>
      {viewingSample ? (
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-cyan-950/20 px-4 py-3 text-sm text-ink md:flex-row md:items-center md:justify-between md:px-5">
            <p className="leading-relaxed">
              <span className="font-semibold text-accent">Sample report.</span>
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
              className="shrink-0 rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40"
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
