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

  const heatCells = Array.from({ length: 30 }, (_, i) => i);

  $: heatReach =
    $phase === 'idle'
      ? 0
      : $phase === 'done'
        ? 1
        : Math.min(1, Math.max(0, $currentStep) / STEPS.length);

  function cellOpacity(i: number, reach: number): number {
    if (reach === 0) return 0.06;
    const cellPos = (i % 10) / 10 + Math.floor(i / 10) * 0.02;
    return cellPos < reach ? 0.45 - (i % 5) * 0.05 : 0.07;
  }

  const bars = [38, 62, 48, 74, 55, 82, 44];
</script>

<div class="demo-loading">
  <div class="demo-loading__header">
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
  </div>

  <div class="mt-5 gs-progress-track">
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

  <div class="demo-loading__split">
    <div class="demo-loading__steps">
      {#each STEPS as label, i}
        <div class="progress-row" data-state={stepStates[i]}>
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
          <span
            class="text-[11px] font-semibold uppercase tracking-[0.16em] {stepStates[i] === 'done'
              ? 'text-accent-cyan'
              : 'text-text-muted'}"
          >
            {stepStates[i] === 'done'
              ? 'Done'
              : stepStates[i] === 'active'
                ? 'Running'
                : 'Queued'}
          </span>
        </div>
      {/each}
    </div>

    <aside class="demo-loading__viz" aria-hidden="true">
      <div class="demo-loading__viz-head">
        <span class="gs-label">Coverage</span>
        <span class="demo-loading__streaming">
          <span class="demo-loading__stream-dot"></span>
          Live
        </span>
      </div>

      <div class="demo-loading__map">
        <div class="demo-loading__map-grid"></div>
        <div
          class="demo-loading__map-ring"
          style="opacity: {0.35 + heatReach * 0.5};"
        ></div>
        <div class="demo-loading__map-pin">P</div>
      </div>

      <div class="demo-loading__bars">
        {#each bars as h, bi}
          <span
            class="demo-loading__bar"
            style="height: {Math.max(
              22,
              h * (0.35 + heatReach * 0.65) + (stepStates[Math.min(bi, STEPS.length - 1)] === 'done'
                ? 8
                : 0)
            )}%;"
          ></span>
        {/each}
      </div>

      <div class="demo-loading__heatmap">
        {#each heatCells as cell}
          <span
            class="demo-loading__heat-cell"
            style="opacity: {cellOpacity(cell, heatReach)};"
          ></span>
        {/each}
      </div>
    </aside>
  </div>
</div>

<style>
  .demo-loading {
    display: flex;
    flex-direction: column;
  }

  .demo-loading__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .demo-loading__title {
    margin: 0;
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    font-size: clamp(1.15rem, 2.2vw, 1.35rem);
    font-weight: 600;
    letter-spacing: -0.03em;
    color: var(--text-primary);
  }

  .demo-loading__context {
    margin: 0.45rem 0 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.45;
  }

  .demo-loading__pct {
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .demo-loading__status {
    margin-top: 0.65rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.5rem;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .demo-loading__split {
    margin-top: 1.75rem;
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 900px) {
    .demo-loading__split {
      grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
      gap: 2rem;
      align-items: start;
    }
  }

  .demo-loading__steps {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .demo-loading__viz {
    border-radius: 16px;
    border: 1px solid var(--border-soft);
    background: linear-gradient(
      165deg,
      rgba(34, 211, 238, 0.06),
      rgba(56, 189, 248, 0.02) 40%,
      var(--bg-surface-2) 100%
    );
    padding: 1rem 1rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .demo-loading__viz-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .demo-loading__streaming {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    padding: 0.35rem 0.55rem;
    border-radius: 9999px;
    border: 1px solid var(--border-soft);
    background: rgba(15, 23, 42, 0.35);
  }

  :global(.light) .demo-loading__streaming {
    background: rgba(241, 245, 249, 0.9);
  }

  .demo-loading__stream-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: var(--accent-cyan);
    animation: demo-stream-dot 1.4s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .demo-loading__stream-dot {
      animation: none;
    }
  }

  @keyframes demo-stream-dot {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.35;
    }
  }

  .demo-loading__map {
    position: relative;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-soft);
    background: var(--bg-base);
  }

  .demo-loading__map-grid {
    position: absolute;
    inset: 0;
    opacity: 0.35;
    background-image:
      linear-gradient(var(--border-soft) 1px, transparent 1px),
      linear-gradient(90deg, var(--border-soft) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  .demo-loading__map-ring {
    position: absolute;
    left: 50%;
    top: 52%;
    width: 42%;
    height: 48%;
    transform: translate(-50%, -50%);
    border-radius: 9999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    background: radial-gradient(
      closest-side,
      rgba(34, 211, 238, 0.16),
      transparent 72%
    );
    transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-loading__map-pin {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 26px;
    height: 26px;
    border-radius: 9999px;
    display: grid;
    place-items: center;
    font-size: 10px;
    font-weight: 800;
    color: #020617;
    background: var(--accent-cyan);
    border: 2px solid var(--bg-base);
    box-shadow: 0 8px 24px -8px rgba(34, 211, 238, 0.65);
  }

  .demo-loading__map-pin::after {
    content: '';
    position: absolute;
    inset: -10px;
    border-radius: 9999px;
    border: 1px solid rgba(34, 211, 238, 0.35);
    animation: demo-map-pulse 2s ease-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .demo-loading__map-pin::after {
      animation: none;
      opacity: 0;
    }
  }

  @keyframes demo-map-pulse {
    0% {
      transform: scale(0.85);
      opacity: 0.55;
    }
    100% {
      transform: scale(1.35);
      opacity: 0;
    }
  }

  .demo-loading__bars {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 5px;
    height: 52px;
    padding: 0 2px;
  }

  .demo-loading__bar {
    flex: 1;
    border-radius: 4px 4px 2px 2px;
    background: linear-gradient(180deg, var(--accent-cyan), var(--accent-blue));
    opacity: 0.85;
    min-height: 18%;
    transition: height 480ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .demo-loading__heatmap {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 5px;
  }

  .demo-loading__heat-cell {
    aspect-ratio: 1;
    border-radius: 3px;
    background: var(--accent-cyan);
    transition: opacity 600ms cubic-bezier(0.22, 1, 0.36, 1);
  }
</style>
