import type { AddressSuggestResponse, AnalyzeSiteResponse, TrendsKeywordsResponse, TrendsTimeframe } from './types';

function baseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (env && env.length > 0) return env.replace(/\/$/, '');
  if (import.meta.env.DEV) return '/api';
  return 'http://127.0.0.1:8000';
}

export async function suggestAddress(
  q: string,
  limit = 8,
  signal?: AbortSignal,
): Promise<AddressSuggestResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`${baseUrl()}/suggest-address?${params.toString()}`, {
    method: 'GET',
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Suggest failed (${res.status})`);
  }
  return res.json() as Promise<AddressSuggestResponse>;
}

export async function analyzeSite(payload: {
  address: string;
  business_type: string;
  budget?: number | null;
  radius_m?: number | null;
}): Promise<AnalyzeSiteResponse> {
  const res = await fetch(`${baseUrl()}/analyze-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: payload.address,
      business_type: payload.business_type,
      budget: payload.budget ?? null,
      radius_m: payload.radius_m ?? null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<AnalyzeSiteResponse>;
}

export async function analyzeCompare(payload: {
  address_a: string;
  address_b: string;
  business_type: string;
  budget?: number | null;
  radius_m?: number | null;
}): Promise<CompareSitesResponse> {
  const res = await fetch(`${baseUrl()}/compare-sites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address_a: payload.address_a,
      address_b: payload.address_b,
      business_type: payload.business_type,
      budget: payload.budget ?? null,
      radius_m: payload.radius_m ?? null,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Comparison failed (${res.status})`);
  }
  return res.json() as Promise<CompareSitesResponse>;
}

export async function trendsAreaDemand(payload: {
  address: string;
  keywords: string[];
  timeframe?: TrendsTimeframe;
}): Promise<TrendsKeywordsResponse> {
  const res = await fetch(`${baseUrl()}/trends-area-demand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      address: payload.address,
      keywords: payload.keywords,
      timeframe: payload.timeframe ?? 'today 3-m',
    }),
  });
  if (!res.ok) {
    let msg = await res.text();
    try {
      const j = JSON.parse(msg) as { detail?: unknown };
      if (typeof j.detail === 'string') msg = j.detail;
      else if (Array.isArray(j.detail)) msg = JSON.stringify(j.detail);
    } catch {
      /* keep text */
    }
    throw new Error(msg || `Trends request failed (${res.status})`);
  }
  return res.json() as Promise<TrendsKeywordsResponse>;
}
