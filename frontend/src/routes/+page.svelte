<script lang="ts">
  import { analyzeSite, trendsAreaDemand } from '$lib/api';
  import AddressAutocomplete from '$lib/components/AddressAutocomplete.svelte';
  import RiskOpportunity from '$lib/components/RiskOpportunity.svelte';
  import ScoreCard from '$lib/components/ScoreCard.svelte';
  import SiteMap from '$lib/components/SiteMap.svelte';
  import ConsultantCorner from '$lib/components/ConsultantCorner.svelte';
  import type { AnalyzeSiteResponse, Recommendation, TrendsKeywordsResponse, TrendsTimeframe } from '$lib/types';

  let address = '86-16 208th St, Queens Village, NY';
  let businessType = 'coffee shop';
  let radiusInput = '500';
  let budgetInput = '';

  let loading = false;
  let error: string | null = null;
  let result: AnalyzeSiteResponse | null = null;

  let trendsKeywordsInput = 'coffee, pizza';
  let trendsTimeframe: TrendsTimeframe = 'today 3-m';
  let trendsLoading = false;
  let trendsError: string | null = null;
  let trendsResult: TrendsKeywordsResponse | null = null;

  $: isMockResult =
    !!result &&
    typeof result.data_sources === 'object' &&
    result.data_sources !== null &&
    (result.data_sources as Record<string, unknown>)['mode'] === 'mock';

  function recLabel(r: Recommendation) {
    if (r === 'strong') return 'Strong fit (directional)';
    if (r === 'medium') return 'Mixed signals — worth deeper diligence';
    return 'Weak fit on mapped signals alone';
  }

  async function submit() {
    loading = true;
    error = null;
    result = null;
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
      result = await analyzeSite({
        address,
        business_type: businessType,
        budget,
        radius_m,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  function reset() {
    result = null;
    error = null;
    trendsResult = null;
    trendsError = null;
  }

  async function submitTrends() {
    trendsLoading = true;
    trendsError = null;
    trendsResult = null;
    try {
      const parts = trendsKeywordsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 0) {
        throw new Error('Enter at least one keyword (comma-separated, up to five).');
      }
      trendsResult = await trendsAreaDemand({
        address,
        keywords: parts.slice(0, 5),
        timeframe: trendsTimeframe,
      });
    } catch (e) {
      trendsError = e instanceof Error ? e.message : 'Trends request failed.';
    } finally {
      trendsLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-canvas">
  <header
    class="sticky top-0 z-40 border-b border-line/80 bg-surface/75 shadow-nav backdrop-blur-xl backdrop-saturate-150"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
      <div class="flex items-center gap-3.5">
        <div
          class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-teal-600 to-teal-800 text-xs font-bold tracking-tight text-white shadow-sm ring-1 ring-white/25"
        >
          GS
        </div>
        <div>
          <p class="text-sm font-semibold tracking-tight text-ink">GeoScore AI</p>
          <p class="text-xs text-muted">Location scoring for NYC / Queens retail</p>
        </div>
      </div>
      <a
        class="hidden text-sm font-medium text-teal-700 transition hover:text-teal-900 sm:inline"
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        Map data: OpenStreetMap
      </a>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14">
    {#if !result}
      <section class="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-10">
        <div
          class="rounded-2xl border border-line/90 bg-surface/70 p-6 shadow-card ring-1 ring-white/60 backdrop-blur-md backdrop-saturate-150 md:p-8"
        >
          <h1 class="text-3xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-tight">
            Is this block right for your concept?
          </h1>
          <p class="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Enter an address and business type. GeoScore pulls nearby OSM businesses, Census tract
            signals, and simple transit proximity to produce a transparent 0–100 score—not a black
            box model.
          </p>

          <form class="mt-8 space-y-5" on:submit|preventDefault={submit}>
            <div>
              <label class="text-sm font-medium text-ink" for="addr">Address</label>
              <AddressAutocomplete id="addr" bind:value={address} required />
              <p class="mt-1.5 text-xs leading-relaxed text-muted">
                Suggestions use Photon (OSM) with an NYC-area bias; debounced after 3+ characters.
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-ink" for="biz">Business type</label>
              <input
                id="biz"
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
                bind:value={businessType}
                placeholder="coffee shop, nail salon, gym…"
                required
              />
            </div>
            <div>
              <label class="text-sm font-medium text-ink" for="radius">
                OSM search radius (meters)
              </label>
              <input
                id="radius"
                inputmode="numeric"
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15 md:max-w-xs"
                bind:value={radiusInput}
              />
              <p class="mt-1.5 text-xs leading-relaxed text-muted">
                Overpass uses this distance around the pin for businesses and transit POIs (100–2000m).
                Default 500m matches the server env default.
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-ink" for="budget">
                Optional monthly budget (USD)
              </label>
              <input
                id="budget"
                inputmode="numeric"
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
                bind:value={budgetInput}
                placeholder="e.g. 5000 (leave blank to ignore)"
              />
              <p class="mt-1.5 text-xs leading-relaxed text-muted">
                Used for a coarse “cost fit” heuristic only—always validate real rent with a broker.
              </p>
            </div>

            {#if error}
              <div
                class="rounded-xl border border-danger/20 bg-danger/[0.06] px-4 py-3 text-sm text-ink"
              >
                {error}
              </div>
            {/if}

            <button
              type="submit"
              class="inline-flex w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-55 md:w-auto md:min-w-[220px]"
              disabled={loading}
            >
              {#if loading}
                <span class="inline-flex items-center gap-2">
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  Analyzing…
                </span>
              {:else}
                Analyze site
              {/if}
            </button>
          </form>
        </div>

        <aside
          class="rounded-2xl border border-line/90 bg-surface/85 p-6 shadow-card ring-1 ring-white/70 backdrop-blur-lg backdrop-saturate-150 md:p-7"
        >
          <p class="text-sm font-semibold tracking-tight text-ink">What you get</p>
          <ul class="mt-4 space-y-3.5 text-sm leading-relaxed text-muted">
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 shadow-sm shadow-teal-600/30"></span>
              <span><strong class="font-semibold text-ink">Score + rationale</strong> with explicit sub-scores.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 shadow-sm shadow-teal-600/30"></span>
              <span><strong class="font-semibold text-ink">Competitors vs complements</strong> from OpenStreetMap.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 shadow-sm shadow-teal-600/30"></span>
              <span><strong class="font-semibold text-ink">Census + transit summaries</strong> for tract context.</span>
            </li>
          </ul>
          <div
            class="mt-6 rounded-xl border border-line/60 bg-canvas/80 p-4 text-xs leading-relaxed text-muted"
          >
            MVP disclaimer: OSM coverage varies; Census is tract-level; scoring is rules-based. Treat
            this as a diligence starting point, not a lease decision.
          </div>
        </aside>
      </section>

      <section
        class="mt-14 rounded-2xl border border-line/90 bg-surface/80 p-6 shadow-card ring-1 ring-white/50 backdrop-blur-md md:p-8"
      >
        <h2 class="text-lg font-semibold tracking-tight text-ink">Keyword demand (Google Trends)</h2>
        <p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Uses the <strong class="text-ink">same address</strong> as above. Google Geocoding resolves the location;
          the backend derives a Trends-compatible region (not your street), then returns
          <strong class="text-ink">relative 0–100</strong> scores by area — not search counts or foot traffic.
        </p>

        <div class="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label class="text-sm font-medium text-ink" for="trends-kw">Keywords (comma-separated, max 5)</label>
            <input
              id="trends-kw"
              class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
              bind:value={trendsKeywordsInput}
            />
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div class="min-w-[10rem]">
              <label class="text-sm font-medium text-ink" for="trends-tf">Timeframe</label>
              <select
                id="trends-tf"
                class="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-3 text-sm text-ink shadow-sm focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15"
                bind:value={trendsTimeframe}
              >
                <option value="today 3-m">Last 3 months</option>
                <option value="today 12-m">Last 12 months</option>
                <option value="today 5-y">Last 5 years</option>
                <option value="now 7-d">Last 7 days</option>
              </select>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 disabled:opacity-55"
              disabled={trendsLoading}
              on:click={submitTrends}
            >
              {#if trendsLoading}
                <span class="inline-flex items-center gap-2">
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
                  Fetching…
                </span>
              {:else}
                Get area demand
              {/if}
            </button>
          </div>
        </div>

        {#if trendsError}
          <div class="mt-4 rounded-xl border border-danger/20 bg-danger/[0.06] px-4 py-3 text-sm text-ink">
            {trendsError}
          </div>
        {/if}

        {#if trendsResult}
          <p class="mt-4 rounded-xl border border-line/80 bg-canvas/60 p-3 text-xs leading-relaxed text-muted">
            {trendsResult.disclaimer}
          </p>
          <p class="mt-3 text-xs text-muted">
            Geocoded:
            <span class="font-medium text-ink">{trendsResult.geocode.formatted_address ?? '—'}</span>
            · Trends geo <span class="font-mono text-ink">{trendsResult.trends_geo}</span> · resolution
            <span class="font-mono text-ink">{trendsResult.trends_resolution}</span> · window
            <span class="font-mono text-ink">{trendsResult.timeframe}</span>
          </p>
          <div class="mt-4 overflow-x-auto rounded-xl border border-line/90">
            <table class="min-w-full divide-y divide-line text-left text-sm">
              <thead class="bg-canvas/80">
                <tr>
                  <th class="px-4 py-3 font-semibold text-ink">Region</th>
                  {#each trendsResult.keywords as kw}
                    <th class="px-4 py-3 font-semibold text-ink tabular-nums">{kw}</th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-line/80 bg-surface">
                {#each trendsResult.regions as row}
                  <tr class="hover:bg-canvas/40">
                    <td class="px-4 py-2.5 font-medium text-ink">{row.region}</td>
                    {#each trendsResult.keywords as kw}
                      <td class="px-4 py-2.5 tabular-nums text-muted">
                        {typeof row.scores[kw] === 'number' ? Math.round(row.scores[kw]) : '—'}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="mt-2 text-xs text-muted">
            Rows are sorted by the primary keyword <span class="font-semibold text-ink">{trendsResult.primary_keyword}</span> (highest first).
          </p>
        {/if}
      </section>
    {:else}
      <div
        class="flex flex-col gap-4 rounded-2xl border border-line/90 bg-surface/75 p-5 shadow-card ring-1 ring-white/50 backdrop-blur-md backdrop-saturate-150 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:p-6"
      >
        <div>
          <button
            type="button"
            class="text-sm font-semibold text-teal-700 transition hover:text-teal-900"
            on:click={reset}
          >
            ← New search
          </button>
          <h1 class="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {result.location.label}
          </h1>
          <p class="mt-1 text-sm text-muted">
            {result.location.display_name ?? ''}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-4 sm:justify-end">
          <!-- Badge colors use explicit hex + markup so Tailwind JIT never drops bg-* from JS strings -->
          {#if result.recommendation === 'strong'}
            <div
              class="rounded-full border border-[#15803d]/40 bg-[#16A34A] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              STRONG
            </div>
          {:else if result.recommendation === 'medium'}
            <div
              class="rounded-full border border-[#B45309]/50 bg-[#D97706] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              MEDIUM
            </div>
          {:else}
            <div
              class="rounded-full border border-[#B91C1C]/40 bg-[#DC2626] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              {(result.recommendation ?? 'weak').toUpperCase()}
            </div>
          {/if}
          <div class="rounded-xl border border-line/80 bg-canvas/50 px-4 py-3 text-right shadow-inner">
            <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Total score</p>
            <p class="text-4xl font-semibold tabular-nums leading-none tracking-tight text-ink">
              {result.total_score}<span class="text-lg font-medium text-muted">/100</span>
            </p>
          </div>
        </div>
      </div>

      <p class="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{recLabel(result.recommendation)}</p>

      {#if typeof result.data_sources === 'object' && result.data_sources !== null && result.data_sources['radius_m'] != null}
        <p class="mt-2 text-xs text-muted">
          OSM / Overpass search radius used:
          <span class="font-semibold text-ink">{String(result.data_sources['radius_m'])}m</span>
        </p>
      {/if}

      {#if isMockResult}
        <div
          class="mt-4 rounded-xl border border-warning/25 bg-warning/[0.08] px-4 py-3 text-sm text-ink"
        >
          Showing <strong>mock fallback</strong> data. Check backend logs/network; configure keys and
          retry for live results.
        </div>
      {/if}

      <section class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ScoreCard
          title="Demand"
          score={result.scores.demand}
          accent="sky"
          hint="Population + nearby commercial activity (OSM)."
        />
        <ScoreCard
          title="Competition"
          score={result.scores.competition}
          accent="amber"
          hint="Higher means fewer mapped direct competitors within your OSM search radius."
        />
        <ScoreCard
          title="Accessibility"
          score={result.scores.accessibility}
          accent="emerald"
          hint="Subway + bus/platform proximity (OSM-derived)."
        />
        <ScoreCard
          title="Demographic fit"
          score={result.scores.demographic_fit}
          accent="violet"
          hint="Income, education, age vs your stated concept (ACS tract)."
        />
        {#if result.scores.cost_fit != null}
          <ScoreCard
            title="Cost fit"
            score={result.scores.cost_fit}
            accent="rose"
            hint="Coarse budget check vs a simple local affordability proxy."
          />
        {/if}
      </section>

      <ConsultantCorner 
        insights={result.ai_insights?.insights} 
        confidence={result.ai_insights?.confidence_score ?? 0} 
      />

      <section class="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 class="text-lg font-semibold tracking-tight text-ink">Map</h2>
          <p class="mt-1 text-sm leading-relaxed text-muted">
            Teal: your geocoded site. Red: mapped competitors. Green: complementary draws.
          </p>
          <div class="mt-4">
            <SiteMap
              lat={result.location.lat}
              lon={result.location.lon}
              competitors={result.competitors}
              complementary={result.complementary_businesses}
            />
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold tracking-tight text-ink">Why this score</h2>
          <ul class="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
            {#each result.summary as line}
              <li class="flex gap-2.5">
                <span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-teal-600/90" aria-hidden="true"></span>
                <span class="text-ink/90">{line}</span>
              </li>
            {/each}
          </ul>

          <div class="mt-8 space-y-4">
            <div class="rounded-2xl border border-line/90 bg-surface p-5 shadow-card">
              <h3 class="text-sm font-semibold tracking-tight text-ink">Demographics</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{result.demographics.summary}</p>
              <dl class="mt-4 grid grid-cols-2 gap-3 text-xs text-muted">
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Population</dt>
                  <dd class="mt-1 tabular-nums text-sm font-semibold text-ink">
                    {result.demographics.population ?? '—'}
                  </dd>
                </div>
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Median income</dt>
                  <dd class="mt-1 tabular-nums text-sm font-semibold text-ink">
                    {#if result.demographics.median_household_income}
                      ${result.demographics.median_household_income.toLocaleString()}
                    {:else}
                      —
                    {/if}
                  </dd>
                </div>
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Median age</dt>
                  <dd class="mt-1 tabular-nums text-sm font-semibold text-ink">
                    {result.demographics.median_age?.toFixed(1) ?? '—'}
                  </dd>
                </div>
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Bachelor's+</dt>
                  <dd class="mt-1 tabular-nums text-sm font-semibold text-ink">
                    {result.demographics.pct_bachelors_or_higher != null
                      ? `${result.demographics.pct_bachelors_or_higher}%`
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="rounded-2xl border border-line/90 bg-surface p-5 shadow-card">
              <h3 class="text-sm font-semibold tracking-tight text-ink">Transit / access</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted">{result.transit.summary}</p>
              <dl class="mt-4 grid grid-cols-2 gap-3 text-xs text-muted">
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Subway nodes ≤800m</dt>
                  <dd class="mt-1 text-sm font-semibold text-ink">
                    {result.transit.subway_stops_within_800m}
                  </dd>
                </div>
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3">
                  <dt class="font-medium text-ink/80">Bus/platform ≤400m</dt>
                  <dd class="mt-1 text-sm font-semibold text-ink">
                    {result.transit.bus_or_light_rail_stops_within_400m}
                  </dd>
                </div>
                <div class="rounded-xl border border-line/60 bg-canvas/60 p-3 md:col-span-2">
                  <dt class="font-medium text-ink/80">Nearest subway node</dt>
                  <dd class="mt-1 text-sm font-semibold text-ink">
                    {result.transit.nearest_subway_distance_m != null
                      ? `${Math.round(result.transit.nearest_subway_distance_m)}m`
                      : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-12">
        <h2 class="text-lg font-semibold tracking-tight text-ink">Risks & opportunities</h2>
        <p class="mt-1 text-sm text-muted">Plain-language tradeoffs derived from the sub-scores.</p>
        <div class="mt-4">
          <RiskOpportunity scores={result.scores} />
        </div>
      </section>

      <section class="mt-12 rounded-2xl border border-line/90 bg-surface p-6 shadow-card md:p-8">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 class="text-lg font-semibold tracking-tight text-ink">Nearby businesses (OSM)</h2>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              Lists are filtered by simple category rules for your business type.
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 class="text-sm font-semibold text-danger">Competitors</h3>
            <ul class="mt-3 divide-y divide-line/80 overflow-hidden rounded-2xl border border-line/90 bg-canvas/30">
              {#each result.competitors as c}
                <li class="flex items-start justify-between gap-3 bg-surface px-4 py-3.5 text-sm transition hover:bg-canvas/50">
                  <div>
                    <p class="font-medium text-ink">{c.name}</p>
                    <p class="text-xs text-muted">{c.category}</p>
                  </div>
                  <p class="shrink-0 rounded-md bg-line/40 px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
                    {Math.round(c.distance_m)}m
                  </p>
                </li>
              {:else}
                <li class="px-4 py-6 text-sm text-muted">No mapped competitors in-radius.</li>
              {/each}
            </ul>
          </div>
          <div>
            <h3 class="text-sm font-semibold text-success">Complementary</h3>
            <ul class="mt-3 divide-y divide-line/80 overflow-hidden rounded-2xl border border-line/90 bg-canvas/30">
              {#each result.complementary_businesses as c}
                <li class="flex items-start justify-between gap-3 bg-surface px-4 py-3.5 text-sm transition hover:bg-canvas/50">
                  <div>
                    <p class="font-medium text-ink">{c.name}</p>
                    <p class="text-xs text-muted">{c.category}</p>
                  </div>
                  <p class="shrink-0 rounded-md bg-line/40 px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
                    {Math.round(c.distance_m)}m
                  </p>
                </li>
              {:else}
                <li class="px-4 py-6 text-sm text-muted">No mapped complementary POIs in-radius.</li>
              {/each}
            </ul>
          </div>
        </div>
      </section>
    {/if}
  </main>

  <footer class="mt-20 border-t border-line/80 bg-surface/90">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-6"
    >
      <p class="max-w-xl leading-relaxed">
        GeoScore AI MVP · Rules-based scoring · Not financial or legal advice
      </p>
      <p class="text-muted/70">Built with SvelteKit + FastAPI</p>
    </div>
  </footer>
</div>
