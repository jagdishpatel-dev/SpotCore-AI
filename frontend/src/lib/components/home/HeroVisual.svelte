<script lang="ts">
  import CityGrid from './CityGrid.svelte';

  const metrics = [
    { label: 'Demand index', value: 'High', pct: 78 },
    { label: 'Competition', value: 'Moderate', pct: 52 },
    { label: 'Demographic fit', value: 'Strong', pct: 86 },
    { label: 'Area momentum', value: 'Rising', pct: 71, pulse: true },
  ];
</script>

<article class="geo-glass relative overflow-hidden rounded-2xl p-5 shadow-gs-hero md:p-6">
  <div class="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
    <div class="absolute inset-4 flex items-center justify-center">
      <CityGrid cols={9} rows={5} cellClass="h-2 w-2" gapClass="gap-0.5" />
    </div>
    <div
      class="absolute inset-0 opacity-30"
      style="background-image: linear-gradient(var(--gs-border) 1px, transparent 1px), linear-gradient(90deg, var(--gs-border) 1px, transparent 1px); background-size: 28px 28px;"
    ></div>
  </div>

  <div class="relative">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="geo-label">Example analysis</span>
      <span class="geo-badge text-[11px]">Fast casual · 5 min drive</span>
    </div>
    <p class="mt-2 text-sm font-medium text-geoscorer-text">
      1847 South Lamar Blvd, Austin, TX
    </p>

    <div class="mt-6 flex items-center gap-5">
      <div
        class="relative grid h-20 w-20 shrink-0 place-items-center rounded-full"
        style="background: conic-gradient(var(--gs-accent) 0 295deg, var(--gs-surface-soft) 295deg 360deg);"
        aria-hidden="true"
      >
        <div class="grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full bg-geoscorer-surface">
          <span class="font-sans text-2xl font-medium tabular-nums tracking-tight text-geoscorer-accent">82</span>
        </div>
      </div>
      <div>
        <p class="font-sans text-xl font-medium tracking-tight text-geoscorer-text">Strong fit</p>
        <p class="mt-0.5 text-sm text-geoscorer-text-muted">Site score · 82 / 100</p>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-2 gap-2">
      {#each metrics as m}
        <div class="geo-metric-card bg-geoscorer-surface/90">
          <div class="flex items-center justify-between gap-2">
            <p class="text-[11px] font-medium text-geoscorer-text-muted">{m.label}</p>
            {#if m.pulse}
              <span class="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-geoscorer-accent" aria-hidden="true"></span>
            {/if}
          </div>
          <p class="mt-0.5 text-sm font-semibold text-geoscorer-text">{m.value}</p>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-geoscorer-surface-soft">
            <span class="block h-full rounded-full bg-geoscorer-accent" style="width: {m.pct}%"></span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</article>
