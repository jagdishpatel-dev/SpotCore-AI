<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { MapPin, Sparkles, ArrowRight, ChevronDown, Search } from 'lucide-svelte';
  import {
    formState,
    phase,
    run,
    CONCEPTS,
    RADII,
    PROFILES,
    DEMO_EXAMPLE_ADDRESS,
  } from '$lib/stores/demoFlow';
  import { prefersReducedMotion } from '$lib/actions/reveal';

  export let onEngage: () => void = () => {};

  let conceptOpen = false;
  let conceptRoot: HTMLDivElement;
  let filter = '';

  function setConcept(c: string) {
    onEngage();
    formState.update((s) => ({ ...s, concept: c }));
    conceptOpen = false;
    filter = '';
  }
  function setRadius(r: string) {
    onEngage();
    formState.update((s) => ({ ...s, radius: r }));
  }
  function setProfile(p: string) {
    onEngage();
    formState.update((s) => ({ ...s, profile: p }));
  }

  function onSubmit(e: Event) {
    e.preventDefault();
    onEngage();
    run();
  }

  function toggleConcept() {
    onEngage();
    conceptOpen = !conceptOpen;
    if (conceptOpen) filter = '';
  }

  $: filteredConcepts = CONCEPTS.filter((c) =>
    c.toLowerCase().includes(filter.trim().toLowerCase())
  );

  $: isRunning = $phase === 'running';

  let addressFocused = false;
  let placeholderText = '';
  let placeholderTimers: number[] = [];

  const reducedMotion = prefersReducedMotion();

  $: showTypingPlaceholder =
    !reducedMotion && !addressFocused && $formState.address.trim().length === 0;

  $: if (showTypingPlaceholder) {
    startPlaceholderTyping();
  } else {
    clearPlaceholderTimers();
    placeholderText = '';
  }

  function clearPlaceholderTimers() {
    placeholderTimers.forEach((t) => clearTimeout(t));
    placeholderTimers = [];
  }

  function startPlaceholderTyping() {
    if (!browser || reducedMotion) return;
    clearPlaceholderTimers();
    placeholderText = '';

    let i = 0;
    const full = DEMO_EXAMPLE_ADDRESS;

    const step = () => {
      if (!showTypingPlaceholder) return;
      placeholderText = full.slice(0, i);
      i += 1;
      if (i <= full.length) {
        placeholderTimers.push(window.setTimeout(step, 38));
        return;
      }
      placeholderTimers.push(
        window.setTimeout(() => {
          if (!showTypingPlaceholder) return;
          i = 0;
          placeholderText = '';
          placeholderTimers.push(window.setTimeout(step, 420));
        }, 2400)
      );
    };

    placeholderTimers.push(window.setTimeout(step, 280));
  }

  function onAddressFocus() {
    addressFocused = true;
    onEngage();
  }

  function onAddressBlur() {
    addressFocused = false;
  }

  onMount(() => {
    const close = (e: MouseEvent) => {
      if (conceptRoot && !conceptRoot.contains(e.target as Node)) conceptOpen = false;
    };
    document.addEventListener('click', close, true);

    return () => {
      document.removeEventListener('click', close, true);
      clearPlaceholderTimers();
    };
  });
</script>

<form class="demo-panel-input" on:submit={onSubmit}>
  <header class="demo-panel-chrome">
    <span class="demo-panel-chrome__live">
      <span class="demo-panel-chrome__dot" aria-hidden="true"></span>
      Live workspace
    </span>
  </header>

  <div class="demo-panel-grid">
    <div class="demo-panel-col demo-panel-input__col">
    <label class="demo-panel-input__field">
      <span class="gs-label">Address</span>
      <span class="demo-panel-input__input-wrap">
        <MapPin
          class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-cyan"
        />
        <input
          type="text"
          class="gs-input"
          placeholder={reducedMotion ? DEMO_EXAMPLE_ADDRESS : ''}
          autocomplete="off"
          spellcheck="false"
          aria-label="Address"
          bind:value={$formState.address}
          on:focus={onAddressFocus}
          on:blur={onAddressBlur}
          on:input={onEngage}
        />
        {#if showTypingPlaceholder}
          <span class="demo-panel-input__type-placeholder" aria-hidden="true">
            {placeholderText}<span class="demo-panel-input__type-cursor">|</span>
          </span>
        {/if}
      </span>
    </label>

    <div class="demo-panel-input__field">
      <span class="gs-label">Business type</span>
      <div bind:this={conceptRoot} class="relative mt-2">
        <button
          type="button"
          class="demo-panel-input__select-trigger"
          aria-expanded={conceptOpen}
          aria-haspopup="listbox"
          on:click|stopPropagation={toggleConcept}
        >
          <span class="truncate text-left">{$formState.concept}</span>
          <ChevronDown
            class="h-4 w-4 shrink-0 text-text-muted transition-transform {conceptOpen
              ? 'rotate-180'
              : ''}"
          />
        </button>

        {#if conceptOpen}
          <div
            class="demo-panel-input__select-panel"
            role="listbox"
            aria-label="Business type"
          >
            <div class="demo-panel-input__search">
              <Search class="h-3.5 w-3.5 text-text-muted" />
              <input
                type="search"
                class="demo-panel-input__search-input"
                placeholder="Search types…"
                bind:value={filter}
                on:click|stopPropagation
              />
            </div>
            <ul class="demo-panel-input__options">
              {#each filteredConcepts as c}
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={$formState.concept === c}
                    class="demo-panel-input__option"
                    on:click|stopPropagation={() => setConcept(c)}
                  >
                    {c}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
    </div>

    <div class="demo-panel-col demo-panel-input__col demo-panel-input__col--right">
    <fieldset class="demo-panel-input__field">
      <legend class="gs-label">Trade area</legend>
      <div class="mt-2 flex flex-wrap gap-2">
        {#each RADII as r}
          <button
            type="button"
            class="gs-chip"
            aria-pressed={$formState.radius === r}
            on:click={() => setRadius(r)}
          >
            {r}
          </button>
        {/each}
      </div>
    </fieldset>

    <fieldset class="demo-panel-input__field">
      <legend class="gs-label">Target customer</legend>
      <div class="mt-2 flex flex-wrap gap-2">
        {#each PROFILES as p}
          <button
            type="button"
            class="gs-chip"
            aria-pressed={$formState.profile === p}
            on:click={() => setProfile(p)}
          >
            {p}
          </button>
        {/each}
      </div>
    </fieldset>

    <div class="demo-panel-input__actions">
      <button
        type="submit"
        class="group demo-panel-input__submit"
        disabled={isRunning}
      >
        <Sparkles class="h-4 w-4" />
        {isRunning ? 'Running…' : 'Run GeoScore Analysis'}
        {#if !isRunning}
          <ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        {/if}
      </button>
    </div>
    </div>
  </div>
</form>

<style>
  .demo-panel-input {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .demo-panel-input__col {
    gap: 1rem;
  }

  .demo-panel-input__col--right {
    justify-content: space-between;
  }

  @media (max-width: 899px) {
    .demo-panel-input__col--right {
      margin-top: 0.25rem;
    }
  }

  .demo-panel-input__field {
    display: block;
    min-width: 0;
  }

  .demo-panel-input__input-wrap {
    position: relative;
    margin-top: 0.5rem;
    display: block;
  }

  .demo-panel-input__type-placeholder {
    position: absolute;
    left: 44px;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .demo-panel-input__type-cursor {
    display: inline-block;
    margin-left: 1px;
    color: var(--accent-cyan);
    animation: demo-type-cursor 1s step-end infinite;
  }

  @keyframes demo-type-cursor {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .demo-panel-input__type-cursor {
      animation: none;
    }
  }

  .demo-panel-input__select-trigger {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    border-radius: 14px;
    border: 1px solid var(--border-soft);
    background: var(--bg-surface-2);
    color: var(--text-primary);
    font-size: 15px;
    font-weight: 500;
    padding: 14px 16px;
    cursor: pointer;
    transition:
      border-color 200ms ease,
      box-shadow 200ms ease;
  }

  .demo-panel-input__select-trigger:hover {
    border-color: rgba(34, 211, 238, 0.28);
  }

  .demo-panel-input__select-trigger:focus-visible {
    outline: none;
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow:
      0 0 0 4px rgba(34, 211, 238, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.04) inset;
  }

  .demo-panel-input__select-panel {
    position: absolute;
    z-index: 30;
    left: 0;
    right: 0;
    top: calc(100% + 8px);
    border-radius: 14px;
    border: 1px solid var(--border-soft);
    background: var(--bg-surface);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 24px 64px -28px rgba(2, 6, 23, 0.75);
    overflow: hidden;
  }

  :global(.light) .demo-panel-input__select-panel {
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.06),
      0 20px 50px -24px rgba(15, 23, 42, 0.2);
  }

  .demo-panel-input__search {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid var(--border-soft);
    background: var(--bg-surface-2);
  }

  .demo-panel-input__search-input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--text-primary);
  }

  .demo-panel-input__search-input::placeholder {
    color: var(--text-muted);
  }

  .demo-panel-input__search-input:focus {
    outline: none;
  }

  .demo-panel-input__options {
    max-height: 140px;
    overflow-y: auto;
    padding: 0.35rem;
    margin: 0;
    list-style: none;
  }

  .demo-panel-input__option {
    width: 100%;
    text-align: left;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    padding: 0.55rem 0.65rem;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      color 160ms ease;
  }

  .demo-panel-input__option:hover,
  .demo-panel-input__option:focus-visible {
    outline: none;
    background: rgba(34, 211, 238, 0.08);
    color: var(--text-primary);
  }

  .demo-panel-input__option[aria-selected='true'] {
    color: var(--accent-cyan);
    background: rgba(34, 211, 238, 0.1);
  }

  .demo-panel-input__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-top: auto;
    padding-top: 0.5rem;
  }

  .demo-panel-input__submit {
    display: inline-flex;
    height: 48px;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 9999px;
    border: 0;
    padding: 0 1.75rem;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #0f172a;
    background: linear-gradient(180deg, #5eead4 0%, var(--accent-cyan) 100%);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.35) inset,
      0 18px 48px -18px rgba(34, 211, 238, 0.55);
    cursor: pointer;
    transition:
      transform 200ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 200ms ease,
      opacity 200ms ease;
  }

  .demo-panel-input__submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.4) inset,
      0 22px 56px -18px rgba(34, 211, 238, 0.65);
  }

  .demo-panel-input__submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .demo-panel-input__submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .demo-panel-input__submit:hover:not(:disabled) {
      transform: none;
    }
  }

  :global(.dark) .demo-panel-input__submit,
  :global(:root:not(.light)) .demo-panel-input__submit {
    color: #020617;
  }
</style>
