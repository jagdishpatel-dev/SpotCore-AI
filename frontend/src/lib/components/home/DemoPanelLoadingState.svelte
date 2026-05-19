<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Activity, Check, MapPin } from 'lucide-svelte';
  import {
    STEPS,
    phase,
    currentStep,
    progress,
    formState,
    demoDisplayAddress,
  } from '$lib/stores/demoFlow';

  type StepState = 'pending' | 'active' | 'done';

  $: stepStates = STEPS.map<StepState>((_, i) => {
    if ($phase === 'done') return 'done';
    if ($phase === 'idle') return 'pending';
    if (i < $currentStep) return 'done';
    if (i === $currentStep) return 'active';
    return 'pending';
  });

  $: percent = Math.round($progress * 100);
  $: displayAddress = demoDisplayAddress($formState.address);

  $: activeLabel =
    $phase === 'running'
      ? $currentStep >= 0 && $currentStep < STEPS.length
        ? STEPS[$currentStep]
        : $currentStep >= STEPS.length
          ? 'Finalizing…'
          : 'Starting…'
      : '';
</script>

<div class="demo-loading">
  <header class="demo-loading__top">
    <div>
      <p class="demo-loading__title">Analyzing this address</p>
      <p class="demo-loading__context">
        <MapPin class="inline-block h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
        <span>{displayAddress}</span>
        <span class="text-text-muted">·</span>
        <span>{$formState.concept}</span>
      </p>
    </div>
    <span class="demo-loading__pct tabular-nums">{percent}%</span>
  </header>

  <div class="gs-progress-track demo-loading__progress">
    <div class="gs-progress-fill" style="width: {percent}%;"></div>
  </div>

  <div class="demo-loading__status">
    <Activity class="h-3.5 w-3.5 shrink-0 text-accent-cyan" aria-hidden="true" />
    {#key activeLabel}
      <span class="truncate" in:fly={{ y: 6, duration: 280, easing: cubicOut }}>
        {activeLabel}
      </span>
    {/key}
  </div>

  <div class="demo-panel-grid demo-loading__grid">
    <div class="demo-panel-col demo-loading__left">
      <div class="demo-loading__score-sk" aria-hidden="true">
        <div class="demo-sk demo-loading__sk-score"></div>
        <div class="demo-sk demo-loading__sk-bar"></div>
      </div>

      <div class="demo-loading__pillars" aria-hidden="true">
        {#each Array(4) as _}
          <div class="demo-loading__pillar">
            <div class="demo-sk demo-loading__sk-label"></div>
            <div class="demo-sk demo-loading__sk-value"></div>
            <div class="demo-sk demo-loading__sk-meter"></div>
          </div>
        {/each}
      </div>

      <div class="demo-sk demo-loading__sk-chart" aria-hidden="true"></div>

      <div class="demo-loading__steps">
        {#each STEPS as label, i}
          <div class="progress-row progress-row--compact" data-state={stepStates[i]}>
            <span class="progress-marker" aria-hidden="true">
              {#if stepStates[i] === 'done'}
                <Check class="h-3 w-3" strokeWidth={3} />
              {:else}
                <span class="text-[10px] font-semibold tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
              {/if}
            </span>
            <span class="progress-label">{label}</span>
          </div>
        {/each}
      </div>
    </div>

    <aside class="demo-panel-col demo-loading__right" aria-hidden="true">
      <div class="demo-loading__signals">
        <div class="demo-sk demo-loading__sk-section-title"></div>
        <div class="demo-loading__chips">
          {#each Array(6) as _, i}
            <div class="demo-sk demo-loading__sk-chip" style="width: {52 + (i % 3) * 18}px;"></div>
          {/each}
        </div>
      </div>

      <div class="demo-loading__metrics">
        <div class="demo-sk demo-loading__sk-section-title"></div>
        <div class="demo-loading__metric-grid">
          {#each Array(6) as _}
            <div class="demo-loading__metric-cell">
              <div class="demo-sk demo-loading__sk-metric-label"></div>
              <div class="demo-sk demo-loading__sk-metric-value"></div>
            </div>
          {/each}
        </div>
      </div>

      <div class="demo-sk demo-loading__sk-map"></div>
    </aside>
  </div>
</div>

<style>
  .demo-loading {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .demo-loading__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-shrink: 0;
  }

  .demo-loading__title {
    margin: 0;
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    font-size: 1.05rem;
    font-weight: 600;
    letter-spacing: -0.03em;
    color: var(--text-primary);
  }

  .demo-loading__context {
    margin: 0.35rem 0 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .demo-loading__pct {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .demo-loading__progress {
    margin-top: 0.65rem;
    flex-shrink: 0;
  }

  .demo-loading__status {
    margin-top: 0.45rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.25rem;
    font-size: 12px;
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .demo-loading__grid {
    margin-top: 0.85rem;
  }

  .demo-loading__left {
    gap: 0.65rem;
  }

  .demo-loading__score-sk {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .demo-loading__sk-score {
    height: 2.75rem;
    width: 5.5rem;
    border-radius: 12px;
  }

  .demo-loading__sk-bar {
    height: 6px;
    width: 100%;
    max-width: 14rem;
    border-radius: 9999px;
  }

  .demo-loading__pillars {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .demo-loading__pillar {
    border-radius: 12px;
    border: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--bg-surface-2) 55%, transparent);
    padding: 0.55rem 0.65rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .demo-loading__sk-label {
    height: 8px;
    width: 55%;
  }

  .demo-loading__sk-value {
    height: 14px;
    width: 35%;
  }

  .demo-loading__sk-meter {
    height: 4px;
    width: 100%;
    border-radius: 9999px;
  }

  .demo-loading__sk-chart {
    height: 4.5rem;
    width: 100%;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .demo-loading__steps {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    min-height: 0;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 75%, transparent 100%);
  }

  :global(.progress-row--compact) {
    padding: 7px 2px !important;
    gap: 10px !important;
  }

  :global(.progress-row--compact .progress-label) {
    font-size: 12px !important;
  }

  .demo-loading__right {
    gap: 0.75rem;
    border-radius: 16px;
    border: 1px solid var(--border-soft);
    background: linear-gradient(
      165deg,
      rgba(34, 211, 238, 0.05),
      rgba(56, 189, 248, 0.02) 40%,
      var(--bg-surface-2) 100%
    );
    padding: 0.85rem 0.9rem;
  }

  .demo-loading__sk-section-title {
    height: 10px;
    width: 4.5rem;
    margin-bottom: 0.5rem;
  }

  .demo-loading__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .demo-loading__sk-chip {
    height: 1.5rem;
    border-radius: 9999px;
  }

  .demo-loading__metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .demo-loading__metric-cell {
    border-radius: 10px;
    border: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--bg-surface-2) 50%, transparent);
    padding: 0.5rem 0.55rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .demo-loading__sk-metric-label {
    height: 7px;
    width: 70%;
  }

  .demo-loading__sk-metric-value {
    height: 12px;
    width: 45%;
  }

  .demo-loading__sk-map {
    margin-top: auto;
    height: 3.5rem;
    border-radius: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 899px) {
    .demo-loading__steps {
      mask-image: none;
      max-height: 7.5rem;
      overflow-y: auto;
    }
  }
</style>
