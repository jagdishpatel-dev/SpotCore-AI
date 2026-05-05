<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;

  // Decompose narrative strings into 3 bullets when possible.
  function bullets(text: string | undefined, fallback: string[]): string[] {
    if (!text) return fallback;
    // Try splitting on sentence boundaries; keep the first 3 useful pieces.
    const parts = text
      .split(/(?<=[.!?])\s+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 6);
    if (parts.length >= 2) return parts.slice(0, 3);
    return [text.trim(), ...fallback].slice(0, 3);
  }

  $: ai = result.ai_insights?.insights;

  $: advantage = {
    title: 'Advantage',
    summary: oneLine(ai?.the_edge) ?? 'Clear structural strengths the operator can lean into.',
    items: bullets(ai?.the_edge, [
      'Mapped foot traffic and transit support a real catchment.',
      'Complementary tenants validate the trade area.',
      'Demographics align with the concept profile.',
    ]),
  };

  $: risk = {
    title: 'Risk',
    summary: oneLine(ai?.the_blindspot) ?? 'Diligence gaps to close before signing a lease.',
    items: bullets(ai?.the_blindspot, [
      'Lease economics and TI costs are out of model — verify.',
      'OSM coverage may underestimate informal foot traffic.',
      'Census tracts smear neighborhood-level differences.',
    ]),
  };

  $: play = {
    title: 'Recommended play',
    summary: oneLine(ai?.the_power_move) ?? 'A focused first 90 days to convert the score into a real signal.',
    items: bullets(ai?.the_power_move, [
      'Pilot the strongest daypart before committing to evening hours.',
      'Run a 2-week traffic audit at the actual storefront.',
      'Lock co-tenancy conversations with adjacent complements.',
    ]),
  };

  function oneLine(s?: string): string | null {
    if (!s) return null;
    const m = s.match(/^[^.!?]*[.!?]/);
    return (m ? m[0] : s).trim();
  }

  type IconName = 'spark' | 'shield' | 'compass';
  const cards: Array<{
    key: string;
    icon: IconName;
    tone: 'positive' | 'warning' | 'cyan';
    accent: string;
    data: () => { title: string; summary: string; items: string[] };
  }> = [
    { key: 'adv', icon: 'spark', tone: 'positive', accent: 'text-positive', data: () => advantage },
    { key: 'risk', icon: 'shield', tone: 'warning', accent: 'text-warning', data: () => risk },
    { key: 'play', icon: 'compass', tone: 'cyan', accent: 'text-accent', data: () => play },
  ];
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="sparkle" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">
        Advantage · Risk · Recommended play
      </h2>
    </div>
  </Reveal>

  <div class="grid gap-5 md:grid-cols-3 md:gap-6">
    {#each cards as c, i (c.key)}
      <Reveal y={18} duration={520} delay={80 + i * 90}>
        <GlassCard tone={c.tone} interactive class="h-full">
          <div class="flex items-start justify-between gap-4">
            <p class="gs-label {c.accent}">{c.data().title}</p>
            <span class="{c.accent} opacity-90">
              <AccentIcon name={c.icon} size={20} />
            </span>
          </div>
          <p class="mt-3 text-base font-medium leading-snug text-ink">{c.data().summary}</p>
          <ul class="mt-5 space-y-3">
            {#each c.data().items as item}
              <li class="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-muted">
                <span class="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-current opacity-70 {c.accent}"></span>
                <span>{item}</span>
              </li>
            {/each}
          </ul>
        </GlassCard>
      </Reveal>
    {/each}
  </div>
</section>
