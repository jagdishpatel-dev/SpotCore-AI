<script lang="ts">
  import { fade } from 'svelte/transition';

  export let insights: {
    strategic_overview: string;
    the_edge: string;
    the_blindspot: string;
    the_power_move: string;
  } | null = null;
  
  export let confidence: number = 0;
</script>

{#if insights}
  <div 
    transition:fade 
    class="my-6 p-6 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🤖</span>
        <h3 class="text-lg font-bold text-indigo-900">Consultant's Strategic Analysis</h3>
      </div>
      <div class="text-xs font-medium px-2 py-1 bg-indigo-200 text-indigo-700 rounded-full">
        Confidence: {Math.round(confidence * 100)}%
      </div>
    </div>

    <p class="text-indigo-800 font-medium mb-6 leading-relaxed italic">
      "{insights.strategic_overview}"
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-white border border-indigo-100 shadow-sm">
        <div class="flex items-center gap-2 mb-2 text-green-600 font-bold text-sm uppercase tracking-wider">
          <span>🚀</span> The Edge
        </div>
        <p class="text-sm text-slate-600 leading-snug">{insights.the_edge}</p>
      </div>

      <div class="p-4 rounded-xl bg-white border border-indigo-100 shadow-sm">
        <div class="flex items-center gap-2 mb-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
          <span>⚠️</span> The Blindspot
        </div>
        <p class="text-sm text-slate-600 leading-snug">{insights.the_blindspot}</p>
      </div>

      <div class="p-4 rounded-xl bg-white border border-indigo-100 shadow-sm">
        <div class="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
          <span>💡</span> Power Move
        </div>
        <p class="text-sm text-slate-600 leading-snug">{insights.the_power_move}</p>
      </div>
    </div>
  </div>
{:else}
  <div class="my-6 p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 italic">
    AI Consultant analysis will appear here after site validation...
  </div>
{/if}
