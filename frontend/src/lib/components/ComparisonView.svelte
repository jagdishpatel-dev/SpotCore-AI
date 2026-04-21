<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import ScoreCard from './ScoreCard.svelte';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let siteA: AnalyzeSiteResponse;
  export let siteB: AnalyzeSiteResponse;
  export let winner: string;
  export let reason: string;
</script>

<div class="space-y-8">
  <!-- Winner Banner -->
  <div 
    transition:fly={{ y: -20, duration: 600 }}
    class="rounded-2xl border-2 border-accent bg-accent/10 p-6 text-center shadow-lg shadow-accent/20"
  >
    <div class="flex items-center justify-center gap-2 mb-2">
      <span class="text-2xl">🏆</span>
      <h3 class="text-xl font-bold text-accent uppercase tracking-wider">Winning Location</h3>
    </div>
    <p class="text-2xl font-bold text-ink mb-3">{winner}</p>
    <div class="mx-auto max-w-2xl p-4 rounded-xl bg-white/5 border border-white/10 italic text-muted text-sm leading-relaxed">
      "{reason}"
    </div>
  </div>

  <!-- Side-by-Side Comparison -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Site A -->
    <div class="flex flex-col gap-6 p-6 rounded-3xl border border-line bg-surface/50 backdrop-blur-sm transition-all hover:border-accent/30" 
         class:ring-2 class:ring-accent={winner === siteA.location.label}>
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-bold text-ink truncate pr-4">{siteA.location.label}</h4>
        {#if winner === siteA.location.label}
          <span class="px-2 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase">Winner</span>
        {/if}
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <ScoreCard title="Demand" score={siteA.scores.demand} accent="sky" />
        <ScoreCard title="Competition" score={siteA.scores.competition} accent="amber" />
        <ScoreCard title="Accessibility" score={siteA.scores.accessibility} accent="emerald" />
        <ScoreCard title="Demo Fit" score={siteA.scores.demographic_fit} accent="violet" />
      </div>
      
      <div class="mt-4 p-4 rounded-xl bg-canvas/50 border border-line text-xs text-muted italic">
        {siteA.recommendation}
      </div>
    </div>

    <!-- Site B -->
    <div class="flex flex-col gap-6 p-6 rounded-3xl border border-line bg-surface/50 backdrop-blur-sm transition-all hover:border-accent/30"
         class:ring-2 class:ring-accent={winner === siteB.location.label}>
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-bold text-ink truncate pr-4">{siteB.location.label}</h4>
        {#if winner === siteB.location.label}
          <span class="px-2 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase">Winner</span>
        {/if}
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <ScoreCard title="Demand" score={siteB.scores.demand} accent="sky" />
        <ScoreCard title="Competition" score={siteB.scores.competition} accent="amber" />
        <ScoreCard title="Accessibility" score={siteB.scores.accessibility} accent="emerald" />
        <ScoreCard title="Demo Fit" score={siteB.scores.demographic_fit} accent="violet" />
      </div>
      
      <div class="mt-4 p-4 rounded-xl bg-canvas/50 border border-line text-xs text-muted italic">
        {siteB.recommendation}
      </div>
    </div>
  </div>
</div>
