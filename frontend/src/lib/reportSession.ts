/**
 * Persist the latest analysis result across full navigations (/analyze → /report).
 * Scoped to the tab/session; cleared when the browser session ends or explicitly cleared.
 */
import type { AnalyzeSiteResponse } from '$lib/types';

export const REPORT_SESSION_KEY = 'geoscore:report:v1';

export type ReportSessionPayload = {
  result: AnalyzeSiteResponse;
  businessType: string;
  viewingSample: boolean;
};

export function saveReportSession(p: ReportSessionPayload): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(REPORT_SESSION_KEY, JSON.stringify(p));
  } catch {
    // Quota or private mode — navigation to /report may fail to hydrate; user can retry.
  }
}

export function loadReportSession(): ReportSessionPayload | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(REPORT_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ReportSessionPayload;
    if (!data?.result || typeof data.businessType !== 'string') return null;
    return {
      result: data.result,
      businessType: data.businessType,
      viewingSample: Boolean(data.viewingSample),
    };
  } catch {
    return null;
  }
}

export function clearReportSession(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(REPORT_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
