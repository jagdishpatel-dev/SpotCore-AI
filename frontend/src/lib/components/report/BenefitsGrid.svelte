<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';

  type IconName = 'spark' | 'compass' | 'people' | 'pin' | 'sparkle';
  const items: Array<{ icon: IconName; title: string; body: string }> = [
    {
      icon: 'spark',
      title: 'Decision-grade score',
      body: 'A single 0–100 number plus the verdict you can defend in a partner meeting.',
    },
    {
      icon: 'compass',
      title: 'Strategic readout',
      body: 'A business-specific narrative — not a generic walkability number.',
    },
    {
      icon: 'people',
      title: 'Demand · demographics · competition',
      body: 'The signals that actually move category economics, surfaced as one view.',
    },
    {
      icon: 'pin',
      title: 'Trade area on the map',
      body: 'Subject site, competitors, complements and transit — visually connected.',
    },
  ];
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="sparkle" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">
        What you get with GeoScore
      </h2>
    </div>
  </Reveal>

  <div class="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
    {#each items as it, i (it.title)}
      <Reveal y={16} duration={520} delay={80 + i * 70}>
        <GlassCard tone="neutral" interactive class="h-full">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/[0.08] text-accent">
            <AccentIcon name={it.icon} size={18} />
          </div>
          <p class="mt-4 text-base font-semibold text-ink">{it.title}</p>
          <p class="mt-1.5 text-sm leading-relaxed text-muted">{it.body}</p>
        </GlassCard>
      </Reveal>
    {/each}
  </div>
</section>
