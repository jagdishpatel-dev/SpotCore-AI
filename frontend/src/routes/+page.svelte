<script lang="ts">
  import { analyzeSite, trendsAreaDemand } from '$lib/api';
  import AddressAutocomplete from '$lib/components/AddressAutocomplete.svelte';
  import RiskOpportunity from '$lib/components/RiskOpportunity.svelte';
  import ScoreCard from '$lib/components/ScoreCard.svelte';
  import SiteMap from '$lib/components/SiteMap.svelte';
  import ConsultantCorner from '$lib/components/ConsultantCorner.svelte';
  import ComparisonView from '$lib/components/ComparisonView.svelte';
  import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
  import WelcomeHero from '$lib/components/WelcomeHero.svelte';
  import type { AnalyzeSiteResponse, Recommendation, TrendsKeywordsResponse, TrendsTimeframe, CompareSitesResponse } from '$lib/types';

  let address = '86-16 208th St, Queens Village, NY';
  let addressB = '86-002 208th Street, New York, New York, 11427';
  let businessType = 'coffee shop';
  let radiusInput = '500';
  let budgetInput = '';

  let showWelcome = true;
  let theme: 'light' | 'dark' = 'dark'; // Default to dark for that "Midnight" vibe
  let mode: 'analyze' | 'compare' = 'analyze';
  let loading = false;
  let error: string | null = null;
  let result: AnalyzeSiteResponse | null = null;
  let compareResult: CompareSitesResponse | null = null;

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
    compareResult = null;
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
        result = await analyzeSite({
          address,
          business_type: businessType,
          budget,
          radius_m,
        });
      } else {
        const r = await (window as any).analyzeCompare({ 
          address_a: address,
          address_b: addressB,
          business_type: businessType,
          budget,
          radius_m,
        });
        compareResult = r;
      }
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

<div 
  class="min-h-screen transition-colors duration-300 {theme === 'dark' ? 'bg-canvas text-ink' : 'bg-canvas text-ink'}" 
  style="--color-canvas: {theme === 'dark' ? '#0a0a0a' : '#fafafa'}; --color-surface: {theme === 'dark' ? '#111111' : '#ffffff'}; --color-ink: {theme === 'dark' ? '#ffffff' : '#171717'}; --color-muted: {theme === 'dark' ? '#a1a1aa' : '#64748b'}; --color-line: {theme === 'dark' ? '#27272a' : '#e2e8f0'};"
>
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
      <div class="flex items-center gap-4">
        <button 
          on:click={() => theme = theme === 'light' ? 'dark' : 'light'}
          class="p-2 rounded-full border border-line bg-surface transition-all hover:scale-110 active:scale-90"
          title="Toggle Theme"
        >
          {#if theme === 'light'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          {/if}
        </button>
        <a
          class="hidden text-sm font-medium text-teal-700 transition hover:text-teal-900 sm:inline"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          Map data: OpenStreetMap
        </a>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14">
    {#if showWelcome}
      <WelcomeHero onStart={() => showWelcome = false} />
    {:else if loading}
      <LoadingOverlay active={true} />
    {:else if compareResult}
      <div class="flex flex-col gap-8 animate-fade-in-up">
        <ComparisonView 
          siteA={compareResult.site_a} 
          siteB={compareResult.site_b} 
          winner={compareResult.comparison_winner} 
          reason={compareResult.winner_reason} 
        />
      </div>
    {:else if result}
      <div class="flex flex-col gap-8 animate-fade-in-up">
        <ScoreCard
          title="Overall Viability"
          score={result.total_score}
          accent="teal"
          hint={result.recommendation}
        />
        
        <ConsultantCorner 
          insights={result.ai_insights?.insights} 
          confidence={result.ai_insights?.confidence_score ?? 0} 
        />

        <div class="grid gap-8 md:grid-cols-2">
          <div class="rounded-2xl border border-line/90 bg-surface/70 p-6 shadow-card ring-1 ring-white/60 backdrop-blur-md md:p-8">
            <h3 class="text-lg font-semibold text-ink mb-4">Demographics</h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Population</dt>
                <dd class="text-lg font-semibold text-ink">{result.demographics.total_population.toLocaleString()}</dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Avg Household Income</dt>
                <dd class="text-lg font-semibold text-ink">${result.demographics.avg_household_income.toLocaleString()}</dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Residential Density</dt>
                <dd class="text-lg font-semibold text-ink">{result.demographics.residential_density.toLocaleString()} /km²</dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Employment Rate</dt>
                <dd class="text-lg font-semibold text-ink">{result.demographics.employment_rate}%</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-2xl border border-line/90 bg-surface/70 p-6 shadow-card ring-1 ring-white/60 backdrop-blur-md md:p-8">
            <h3 class="text-lg font-semibold text-ink mb-4">Transit & Access</h3>
            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Bus / Light Rail</dt>
                <dd class="text-lg font-semibold text-ink">{result.transit.bus_or_light_rail_stops_within_400m} stops</dd>
              </div>
              <div class="flex flex-col gap-1">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Walk Score (est)</dt>
                <dd class="text-lg font-semibold text-ink">{result.transit.walk_score}</dd>
              </div>
              <div class="rounded-xl border border-line/60 bg-canvas/60 p-3 sm:col-span-2">
                <dt class="text-xs font-medium text-muted uppercase tracking-wider">Nearest subway node</dt>
                <dd class="mt-1 text-lg font-semibold text-ink">
                  {result.transit.nearest_subway_distance_m != null
                    ? `${Math.round(result.transit.nearest_subway_distance_m)}m`
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <section class="mt-4">
          <h2 class="text-lg font-semibold tracking-tight text-ink">Risks & opportunities</h2>
          <p class="mt-1 text-sm text-muted">Plain-language tradeoffs derived from the sub-scores.</p>
          <div class="mt-4">
            <RiskOpportunity scores={result.scores} />
          </div>
        </section>

        <section class="rounded-2xl border border-line/90 bg-surface p-6 shadow-card md:p-8">
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
      </div>
    {:else}
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
