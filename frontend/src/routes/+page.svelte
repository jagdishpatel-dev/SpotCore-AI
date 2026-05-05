<script lang="ts">
  import { analyzeSite, trendsAreaDemand } from '$lib/api';
  import AddressAutocomplete from '$lib/components/AddressAutocomplete.svelte';
  import ComparisonView from '$lib/components/ComparisonView.svelte';
  import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
  import WelcomeHero from '$lib/components/WelcomeHero.svelte';
  import ReportView from '$lib/components/report/ReportView.svelte';
  import { SAMPLE_ANALYZE_SITE_RESPONSE } from '$lib/sampleReport';
  import type {
    AnalyzeSiteResponse,
    Recommendation,
    TrendsKeywordsResponse,
    TrendsTimeframe,
    CompareSitesResponse,
  } from '$lib/types';

  let address = '86-16 208th St, Queens Village, NY';
  let addressB = '86-002 208th Street, New York, New York, 11427';
  let businessType = 'coffee shop';
  let radiusInput = '500';
  let budgetInput = '';

  let showWelcome = true;
  /** True when `result` is the built-in sample preview, not a live API response */
  let viewingSample = false;
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

  function loadSampleReport() {
    result = SAMPLE_ANALYZE_SITE_RESPONSE;
    viewingSample = true;
    compareResult = null;
    error = null;
    showWelcome = false;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function dismissSample() {
    result = null;
    viewingSample = false;
  }

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
        viewingSample = false;
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
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      error = e instanceof Error ? e.message : 'Something went wrong.';
    } finally {
      loading = false;
    }
  }

  function reset() {
    result = null;
    viewingSample = false;
    error = null;
    trendsResult = null;
    trendsError = null;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
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

<div class="gs-page-bg min-h-screen text-ink">
  <header
    class="sticky top-0 z-40 border-b border-line/70 bg-canvas/70 backdrop-blur-xl backdrop-saturate-150"
  >
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
      <a class="flex items-center gap-3" href="/" on:click|preventDefault={reset}>
        <div
          class="grid h-9 w-9 place-items-center rounded-xl border border-accent/40 bg-gradient-to-b from-cyan-400 to-cyan-700 text-[11px] font-bold tracking-tight text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_8px_24px_-8px_rgba(34,211,238,0.5)]"
        >
          GS
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold tracking-tight text-ink">GeoScore</p>
          <p class="text-[11px] tracking-wide text-muted">Location intelligence for operators</p>
        </div>
      </a>
      <div class="flex items-center gap-3">
        {#if result || compareResult}
          <button
            type="button"
            on:click={reset}
            class="hidden rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40 sm:inline-flex"
          >
            New analysis
          </button>
        {/if}
        <a
          class="hidden text-[11px] font-medium text-muted transition hover:text-ink sm:inline"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          Map data: OpenStreetMap
        </a>
      </div>
    </div>
  </header>

  <main>
    {#if showWelcome}
      <WelcomeHero onStart={() => (showWelcome = false)} />
    {:else if loading}
      <LoadingOverlay active={true} />
    {:else if compareResult}
      <div class="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-14 animate-fade-in-up">
        <ComparisonView
          siteA={compareResult.site_a}
          siteB={compareResult.site_b}
          winner={compareResult.comparison_winner}
          reason={compareResult.winner_reason}
        />
      </div>
    {:else if result}
      {#if viewingSample}
        <div class="mx-auto max-w-6xl px-4 pt-6 md:px-6">
          <div
            class="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-cyan-950/20 px-4 py-3 text-sm text-ink md:flex-row md:items-center md:justify-between md:px-5"
          >
            <p class="leading-relaxed">
              <span class="font-semibold text-accent">Sample report.</span>
              Illustrative scores so you can see the layout. Run
              <strong class="text-ink">Analyze site</strong> for live data.
            </p>
            <button
              type="button"
              class="shrink-0 rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40"
              on:click={dismissSample}
            >
              Back to form
            </button>
          </div>
        </div>
      {/if}

      <ReportView
        {result}
        {businessType}
        onAnalyzeAnother={reset}
        secondaryLabel={viewingSample ? null : 'Compare another address'}
        onSecondary={viewingSample ? null : reset}
      />
    {:else}
      <section
        class="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-10 md:px-6 md:py-16"
      >
        <div class="gs-card p-6 md:p-8">
          <p class="gs-label text-accent">Run an analysis</p>
          <h1
            class="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-tight"
          >
            Is this block right for your concept?
          </h1>
          <p class="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Enter an address and a business type. GeoScore pulls nearby OSM businesses, Census tract
            signals, and transit proximity, then renders an executive-grade location report — not a
            black-box model.
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
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/55 transition focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/15"
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
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink transition focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/15 md:max-w-xs"
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
                class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/55 transition focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/15"
                bind:value={budgetInput}
                placeholder="e.g. 5000 (leave blank to ignore)"
              />
              <p class="mt-1.5 text-xs leading-relaxed text-muted">
                Used for a coarse cost-fit heuristic only — always validate real rent with a broker.
              </p>
            </div>

            {#if error}
              <div
                class="rounded-xl border border-danger/35 bg-danger/[0.08] px-4 py-3 text-sm text-ink"
              >
                {error}
              </div>
            {/if}

            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
              <button
                type="submit"
                class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-cyan-400 to-cyan-600 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_18px_48px_-12px_rgba(34,211,238,0.45)] transition-transform hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-[200px]"
                disabled={loading}
              >
                {#if loading}
                  <span class="inline-flex items-center gap-2">
                    <span
                      class="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/40 border-t-slate-900"
                    ></span>
                    Analyzing…
                  </span>
                {:else}
                  Analyze site
                {/if}
              </button>
              <button
                type="button"
                class="inline-flex w-full items-center justify-center rounded-xl border border-line bg-white/[0.02] px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-accent/40 hover:bg-white/[0.04] sm:w-auto sm:min-w-[200px]"
                disabled={loading}
                on:click={loadSampleReport}
              >
                View sample report
              </button>
            </div>
            <p class="text-xs leading-relaxed text-muted">
              Opens a static demo of the new executive report — no API call.
            </p>
          </form>
        </div>

        <aside class="gs-card p-6 md:p-7">
          <p class="gs-label text-accent">What you get</p>
          <ul class="mt-4 space-y-3.5 text-sm leading-relaxed text-muted">
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
              <span><strong class="font-semibold text-ink">Score + verdict</strong> with explicit sub-scores.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
              <span><strong class="font-semibold text-ink">Strategic readout</strong> tailored to your business type.</span>
            </li>
            <li class="flex gap-3">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
              <span><strong class="font-semibold text-ink">Map · demand · competition</strong> — visually connected.</span>
            </li>
          </ul>
          <div
            class="mt-6 rounded-xl border border-line/70 bg-surface-2 p-4 text-xs leading-relaxed text-muted"
          >
            MVP disclaimer: OSM coverage varies; Census is tract-level; scoring is rules-based. Treat
            this as a diligence starting point, not a lease decision.
          </div>
        </aside>
      </section>
    {/if}
  </main>

  <footer class="mt-16 border-t border-line/70 bg-canvas/80">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-6"
    >
      <p class="max-w-xl leading-relaxed">
        GeoScore · Premium location intelligence · Not financial or legal advice.
      </p>
      <p class="text-muted/70">Built with SvelteKit + FastAPI</p>
    </div>
  </footer>
</div>
