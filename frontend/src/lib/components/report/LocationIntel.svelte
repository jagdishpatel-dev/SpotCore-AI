<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import SiteMap from '$lib/components/SiteMap.svelte';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;

  $: pop = result.demographics?.population;
  $: income = result.demographics?.median_household_income;
  $: edu = result.demographics?.pct_bachelors_or_higher;
  $: age = result.demographics?.median_age;
  $: subwayCount = result.transit?.subway_stops_within_800m ?? 0;
  $: busCount = result.transit?.bus_or_light_rail_stops_within_400m ?? 0;
  $: nearestSubway = result.transit?.nearest_subway_distance_m;
  $: commuteTransit = result.demographics?.commute_pct_public_transit;
  $: compCount = result.competitors?.length ?? 0;
  $: compNearest = result.competitors?.[0]?.distance_m;
  $: complementCount = result.complementary_businesses?.length ?? 0;

  function fmtN(n?: number | null): string {
    if (n == null) return '—';
    return n.toLocaleString();
  }
  function fmtPct(n?: number | null): string {
    if (n == null) return '—';
    return `${Math.round(n)}%`;
  }
  function fmtUSD(n?: number | null): string {
    if (n == null) return '—';
    return `$${n.toLocaleString()}`;
  }
  function fmtMeters(n?: number | null): string {
    if (n == null) return '—';
    return `${Math.round(n)}m`;
  }

  function saturationLabel(c: number): { tone: 'positive' | 'cyan' | 'warning' | 'danger'; text: string } {
    if (c === 0) return { tone: 'positive', text: 'Open whitespace' };
    if (c <= 3) return { tone: 'cyan', text: 'Healthy density' };
    if (c <= 6) return { tone: 'warning', text: 'Crowded' };
    return { tone: 'danger', text: 'Saturated' };
  }
  $: sat = saturationLabel(compCount);
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="pin" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">Location intelligence</h2>
    </div>
  </Reveal>

  <div class="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:gap-6">
    <!-- MAP -->
    <Reveal y={16} duration={560} delay={80}>
      <GlassCard tone="neutral" padded={false}>
        <div class="border-b border-line/70 px-5 py-3.5">
          <div class="flex items-center justify-between">
            <p class="gs-label text-muted-2">Trade area &amp; nearby POIs</p>
            <div class="flex flex-wrap items-center gap-3 text-[11px] text-muted">
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
                Subject site
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full bg-danger"></span>
                Competitor
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block h-2 w-2 rounded-full bg-positive"></span>
                Complement
              </span>
            </div>
          </div>
        </div>
        <div class="p-2 md:p-3">
          <SiteMap
            lat={result.location.lat}
            lon={result.location.lon}
            competitors={result.competitors}
            complementary={result.complementary_businesses}
          />
        </div>
      </GlassCard>
    </Reveal>

    <!-- METRIC STACK -->
    <div class="flex flex-col gap-5 md:gap-6">
      <Reveal y={16} duration={520} delay={120}>
        <GlassCard tone="neutral" interactive>
          <div class="flex items-center justify-between">
            <p class="gs-label text-muted-2">Market profile</p>
            <span class="text-accent-2"><AccentIcon name="people" size={16} /></span>
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <dt class="text-xs text-muted">Population (tract)</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{fmtN(pop)}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Median income</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{fmtUSD(income)}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Bachelor's+</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{fmtPct(edu)}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Median age</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{age != null ? age : '—'}</dd>
            </div>
          </dl>
        </GlassCard>
      </Reveal>

      <Reveal y={16} duration={520} delay={180}>
        <GlassCard tone={sat.tone === 'positive' ? 'positive' : sat.tone === 'warning' ? 'warning' : sat.tone === 'danger' ? 'danger' : 'cyan'} interactive>
          <div class="flex items-center justify-between">
            <p class="gs-label text-muted-2">Competition</p>
            <span class="text-warning"><AccentIcon name="storefront" size={16} /></span>
          </div>
          <div class="mt-4 flex items-end justify-between gap-4">
            <div>
              <p class="gs-num text-3xl font-semibold text-ink">{compCount}</p>
              <p class="text-xs text-muted">competitors in radius</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-muted">Nearest competitor</p>
              <p class="gs-num mt-1 text-base font-medium text-ink">{fmtMeters(compNearest)}</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between rounded-xl border border-line/70 bg-white/[0.02] px-3 py-2">
            <span class="text-xs text-muted">Saturation</span>
            <span
              class="text-xs font-semibold"
              class:text-positive={sat.tone === 'positive'}
              class:text-accent={sat.tone === 'cyan'}
              class:text-warning={sat.tone === 'warning'}
              class:text-danger={sat.tone === 'danger'}
            >{sat.text}</span>
          </div>
          <div class="mt-3 flex items-center justify-between text-xs text-muted">
            <span>Complementary POIs</span>
            <span class="gs-num text-ink">{complementCount}</span>
          </div>
        </GlassCard>
      </Reveal>

      <Reveal y={16} duration={520} delay={240}>
        <GlassCard tone="cyan" interactive>
          <div class="flex items-center justify-between">
            <p class="gs-label text-muted-2">Mobility &amp; access</p>
            <span class="text-accent"><AccentIcon name="transit" size={16} /></span>
          </div>
          <dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
            <div>
              <dt class="text-xs text-muted">Subway ≤ 800m</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{subwayCount}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Bus / LRT ≤ 400m</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{busCount}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Nearest subway</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{fmtMeters(nearestSubway)}</dd>
            </div>
            <div>
              <dt class="text-xs text-muted">Transit commute</dt>
              <dd class="gs-num mt-1 text-xl font-semibold text-ink">{fmtPct(commuteTransit)}</dd>
            </div>
          </dl>
        </GlassCard>
      </Reveal>
    </div>
  </div>
</section>
