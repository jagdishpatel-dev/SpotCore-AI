<script context="module" lang="ts">
  function leadSentence(s: string): string {
    const m = s.match(/^[^.!?]*[.!?]/);
    return (m ? m[0] : s).trim();
  }
  function restAfterLead(s: string): string {
    const m = s.match(/^[^.!?]*[.!?]\s*(.*)$/s);
    return (m?.[1] ?? '').trim();
  }
</script>

<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import Reveal from './Reveal.svelte';
  import StaggeredText from './StaggeredText.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;

  $: insight =
    result.ai_insights?.insights?.strategic_overview ??
    result.summary?.[0] ??
    'Directional read on this block based on mapped signals.';

  $: lead = leadSentence(insight);
  $: rest = restAfterLead(insight);
</script>

<section class="px-2">
  <Reveal y={14} duration={520}>
    <div class="mb-5 flex items-center gap-2.5">
      <span class="text-accent"><AccentIcon name="compass" /></span>
      <h2 class="text-lg font-semibold tracking-tight text-ink md:text-xl">Strategic readout</h2>
    </div>
  </Reveal>

  <Reveal y={16} duration={560} delay={80}>
    <GlassCard tone="cyan">
      <p class="gs-label text-accent">Executive summary</p>
      <h3
        class="mt-3 text-balance text-[22px] font-semibold leading-snug tracking-tight text-ink md:text-[26px]"
      >
        <StaggeredText text={lead} stagger={45} duration={520} />
      </h3>
      {#if rest}
        <p class="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted md:text-base">
          {rest}
        </p>
      {/if}
    </GlassCard>
  </Reveal>
</section>
