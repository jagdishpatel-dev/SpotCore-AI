<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import ReportView from '$lib/components/report/ReportView.svelte';
  import type { AnalyzeSiteResponse } from '$lib/types';
  import { loadReportSession, clearReportSession } from '$lib/reportSession';

  let ready = false;
  let result: AnalyzeSiteResponse | null = null;
  let businessType = '';
  let viewingSample = false;

  function dismissSample() {
    clearReportSession();
    goto('/analyze');
  }

  function analyzeAnother() {
    clearReportSession();
    goto('/analyze');
  }

  onMount(() => {
    const payload = loadReportSession();
    if (!payload?.result) {
      goto('/analyze');
      return;
    }
    result = payload.result;
    businessType = payload.businessType ?? '';
    viewingSample = payload.viewingSample;
    ready = true;
  });
</script>

{#if ready && result}
  {#if viewingSample}
    <div class="mx-auto max-w-6xl px-4 pt-6 md:px-6">
      <div
        class="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-cyan-950/20 px-4 py-3 text-sm text-ink md:flex-row md:items-center md:justify-between md:px-5"
      >
        <p class="leading-relaxed">
          <span class="font-semibold text-accent">Sample report.</span>
          Illustrative scores so you can see the layout. Run
          <a href="/analyze" class="font-semibold text-ink underline underline-offset-2 hover:text-accent"
            >Analyze site</a
          >
          for live data.
        </p>
        <button
          type="button"
          class="shrink-0 rounded-full border border-line bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40"
          on:click={dismissSample}
        >
          Back to form
        </button>
      </div>
    </div>
  {/if}

  <ReportView
    {result}
    {businessType}
    onAnalyzeAnother={analyzeAnother}
    secondaryLabel={viewingSample ? null : 'Compare another address'}
    onSecondary={viewingSample ? null : analyzeAnother}
  />
{:else}
  <div class="mx-auto max-w-lg flex-1 px-4 py-24 text-center text-muted md:py-32">
    <p class="text-sm">Loading report…</p>
  </div>
{/if}
