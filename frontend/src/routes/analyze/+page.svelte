<script lang="ts">
  import { goto } from '$app/navigation';
  import { analyzeSite } from '$lib/api';
  import AddressAutocomplete from '$lib/components/AddressAutocomplete.svelte';
  import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
  import { SAMPLE_ANALYZE_SITE_RESPONSE } from '$lib/sampleReport';
  import { saveReportSession } from '$lib/reportSession';

  let address = '86-16 208th St, Queens Village, NY';
  let businessType = 'coffee shop';
  let radiusInput = '500';
  let budgetInput = '';

  let loading = false;
  let error: string | null = null;

  function loadSampleReport() {
    saveReportSession({
      result: SAMPLE_ANALYZE_SITE_RESPONSE,
      businessType,
      viewingSample: true,
    });
    goto('/report');
  }

  async function submit() {
    loading = true;
    error = null;
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

      const result = await analyzeSite({
        address,
        business_type: businessType,
        budget,
        radius_m,
      });

      saveReportSession({ result, businessType, viewingSample: false });
      goto('/report');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Something went wrong.';
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <LoadingOverlay active={true} />
{/if}

<section
  class="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-10 md:px-6 md:py-16"
>
  <div class="gs-card p-6 md:p-8">
    <div class="flex flex-wrap items-center gap-3">
      <a
        href="/"
        class="text-xs font-medium text-muted underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Home
      </a>
      <span class="text-line">/</span>
      <p class="gs-label text-accent">Run an analysis</p>
    </div>
    <h1 class="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-[2rem] md:leading-tight">
      Is this block right for your concept?
    </h1>
    <p class="mt-3 max-w-xl text-base leading-relaxed text-muted">
      Enter an address and a business type. GeoScore pulls nearby OSM businesses, Census tract signals,
      and transit proximity, then opens an executive-grade location report on the next screen.
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
        <label class="text-sm font-medium text-ink" for="radius">OSM search radius (meters)</label>
        <input
          id="radius"
          inputmode="numeric"
          class="mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink transition focus:border-accent/50 focus:outline-none focus:ring-4 focus:ring-accent/15 md:max-w-xs"
          bind:value={radiusInput}
        />
        <p class="mt-1.5 text-xs leading-relaxed text-muted">
          Overpass uses this distance around the pin for businesses and transit POIs (100–2000m). Default
          500m matches the server env default.
        </p>
      </div>
      <div>
        <label class="text-sm font-medium text-ink" for="budget">Optional monthly budget (USD)</label>
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
        <div class="rounded-xl border border-danger/35 bg-danger/[0.08] px-4 py-3 text-sm text-ink">
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
        Opens a static demo report on the next page — no API call.
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
    <div class="mt-6 rounded-xl border border-line/70 bg-surface-2 p-4 text-xs leading-relaxed text-muted">
      MVP disclaimer: OSM coverage varies; Census is tract-level; scoring is rules-based. Treat this as a
      diligence starting point, not a lease decision.
    </div>
  </aside>
</section>
