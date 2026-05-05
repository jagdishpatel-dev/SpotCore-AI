<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import CountUp from './CountUp.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import type { DriverDatum } from '$lib/utils/report';

  export let drivers: DriverDatum[];

  function toneToText(t: DriverDatum['tone']): string {
    if (t === 'positive') return 'text-positive';
    if (t === 'cyan') return 'text-accent';
    if (t === 'warning') return 'text-warning';
    if (t === 'danger') return 'text-danger';
    return 'text-accent-2';
  }
  function toneToBg(t: DriverDatum['tone']): string {
    if (t === 'positive') return 'bg-positive';
    if (t === 'cyan') return 'bg-accent';
    if (t === 'warning') return 'bg-warning';
    if (t === 'danger') return 'bg-danger';
    return 'bg-accent-2';
  }
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <span class="text-accent"><AccentIcon name="chart" /></span>
        <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">Score drivers</h2>
      </div>
      <p class="hidden text-sm text-muted md:block">Why the score landed where it did.</p>
    </div>
  </Reveal>

  <Reveal y={16} duration={560} delay={80}>
    <GlassCard tone="neutral" padded={false}>
      <div class="grid gap-px overflow-hidden rounded-[22px] bg-line/40 sm:grid-cols-2 lg:grid-cols-6">
        {#each drivers as d, i (d.key)}
          <div
            class="group flex flex-col gap-3 bg-surface p-5 transition-colors duration-200 hover:bg-surface-2"
          >
            <div class="flex items-center justify-between">
              <p class="gs-label text-muted-2">{d.label}</p>
              <span class={toneToText(d.tone)}>
                <AccentIcon
                  name={d.key === 'demand'
                    ? 'chart'
                    : d.key === 'demographic_fit'
                      ? 'people'
                      : d.key === 'competition'
                        ? 'storefront'
                        : d.key === 'accessibility'
                          ? 'transit'
                          : d.key === 'cost_fit'
                            ? 'tag'
                            : 'sparkle'}
                  size={14}
                />
              </span>
            </div>
            <div class="flex items-baseline gap-1.5">
              <span class="gs-num text-[28px] font-semibold leading-none {toneToText(d.tone)}">
                <CountUp to={Math.round(d.value)} duration={900} />
              </span>
              <span class="gs-num text-xs text-muted-2">/ 100</span>
            </div>
            <div class="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <div
                class="absolute inset-y-0 left-0 origin-left rounded-full {toneToBg(d.tone)} animate-fill"
                style="--gs-target: {Math.max(0, Math.min(100, d.value))}%; --gs-delay: {i * 60 + 120}ms;"
              ></div>
            </div>
            <p class="text-xs leading-snug text-muted">{d.hint}</p>
          </div>
        {/each}
      </div>
    </GlassCard>
  </Reveal>
</section>

<style>
  .animate-fill {
    width: 0%;
    animation: gs-fill 900ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: var(--gs-delay);
  }
  @keyframes gs-fill {
    from {
      width: 0%;
    }
    to {
      width: var(--gs-target);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .animate-fill {
      width: var(--gs-target);
      animation: none;
    }
  }
</style>
