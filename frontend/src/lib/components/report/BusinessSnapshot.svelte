<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import { startCase } from '$lib/utils/report';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;
  export let businessType: string = '';

  $: type = businessType?.trim() || 'Local retail concept';
  $: prettyType = startCase(type);

  // Tailored success factors based on business type keywords + signals.
  function successFactors(t: string, r: AnalyzeSiteResponse): string[] {
    const base = t.toLowerCase();
    const generic = [
      'Steady weekday foot traffic anchored by transit and offices.',
      'Mix of complementary retail that pulls the same customer.',
      'Visibility from a primary pedestrian or transit corridor.',
    ];
    const coffee = [
      'Morning commuter density within a 3–5 minute walk.',
      'Repeat-visit habits — proximity to dense daytime population beats one-off destination pull.',
      'Complementary co-tenancy (bakery, gyms, co-work) for daypart layering.',
      'Seat-to-takeaway ratio matched to local rent economics.',
    ];
    const gym = [
      'High-density residential within a 10-minute walk or drive.',
      'Above-median income and education catchment.',
      'Complementary wellness and food businesses to share traffic.',
    ];
    const restaurant = [
      'Lunch and dinner daypart layering matters more than total POI count.',
      'Walkable parking + transit access widens the effective trade area.',
      'Co-tenancy with bars / entertainment lifts evening returns.',
    ];
    const salon = [
      'Female-skewed catchment with discretionary spend headroom.',
      'Adjacent personal-care POIs cluster customers.',
      'Quiet street-level visibility beats raw foot traffic.',
    ];
    if (base.includes('coffee') || base.includes('cafe') || base.includes('café')) return coffee;
    if (base.includes('gym') || base.includes('fitness') || base.includes('yoga')) return gym;
    if (base.includes('restaurant') || base.includes('pizza') || base.includes('bar') || base.includes('food'))
      return restaurant;
    if (base.includes('salon') || base.includes('nail') || base.includes('spa')) return salon;
    return generic;
  }

  $: factors = successFactors(type, result);
  $: description =
    `GeoScore is reading this block through the lens of a ${prettyType.toLowerCase()}. The score weighs ` +
    `who actually walks past the door, what sits within its trade area, and how easy it is to reach by ` +
    `transit and on foot — not just a generic walkability number.`;
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="storefront" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">Business snapshot</h2>
    </div>
  </Reveal>

  <Reveal y={16} duration={560} delay={80}>
    <GlassCard tone="neutral">
      <div class="grid gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p class="gs-label text-muted-2">Concept being evaluated</p>
          <p class="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-[26px]">
            {prettyType}
          </p>
          <p class="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            {description}
          </p>
        </div>

        <div>
          <p class="gs-label text-muted-2">What success requires here</p>
          <ul class="mt-3 space-y-3">
            {#each factors as f, i}
              <Reveal y={8} duration={420} delay={120 + i * 70}>
                <li class="flex items-start gap-3 text-[15px] leading-relaxed text-ink/90">
                  <span class="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_rgba(34,211,238,0.6)]"></span>
                  <span>{f}</span>
                </li>
              </Reveal>
            {/each}
          </ul>
        </div>
      </div>
    </GlassCard>
  </Reveal>
</section>
