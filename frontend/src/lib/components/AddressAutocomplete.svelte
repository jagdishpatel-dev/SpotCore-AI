<script lang="ts">
  import { suggestAddress } from '$lib/api';
  import type { AddressSuggestion } from '$lib/types';
  import { onDestroy } from 'svelte';

  export let value: string;
  export let id: string;
  export let required = false;
  export let disabled = false;
  export let inputClass =
    'mt-1 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-sm ring-1 ring-slate-900/[0.02] placeholder:text-muted/45 transition focus:border-teal-600/40 focus:outline-none focus:ring-4 focus:ring-teal-600/15 disabled:cursor-not-allowed disabled:opacity-50';

  let open = false;
  let loading = false;
  let suggestions: AddressSuggestion[] = [];
  let active = -1;
  let container: HTMLDivElement;
  let debounce: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;
  let suppressSuggestUntil = 0;

  const DEBOUNCE_MS = 320;
  const MIN_CHARS = 3;

  function close() {
    open = false;
    active = -1;
  }

  async function runSuggest(q: string) {
    if (Date.now() < suppressSuggestUntil) {
      return;
    }
    controller?.abort();
    controller = new AbortController();
    const query = q.trim();
    if (query.length < MIN_CHARS) {
      suggestions = [];
      open = false;
      loading = false;
      return;
    }
    loading = true;
    try {
      const res = await suggestAddress(query, 8, controller.signal);
      suggestions = res.suggestions;
      open = suggestions.length > 0;
      active = open ? 0 : -1;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      suggestions = [];
      open = false;
      active = -1;
    } finally {
      loading = false;
    }
  }

  function scheduleSuggest(q: string) {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      debounce = null;
      void runSuggest(q);
    }, DEBOUNCE_MS);
  }

  $: if (!disabled) {
    scheduleSuggest(value);
  } else {
    close();
    suggestions = [];
  }

  function pick(s: AddressSuggestion) {
    suppressSuggestUntil = Date.now() + 450;
    value = s.label;
    close();
    suggestions = [];
  }

  function onKeydown(e: KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = (active + 1) % suggestions.length;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active - 1 + suggestions.length) % suggestions.length;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      pick(suggestions[active]);
    }
  }

  function onDocClick(ev: MouseEvent) {
    if (!container?.contains(ev.target as Node)) close();
  }

  onDestroy(() => {
    if (debounce) clearTimeout(debounce);
    controller?.abort();
  });
</script>

<svelte:window on:click={onDocClick} />

<div
  class="relative isolate"
  class:z-50={open && suggestions.length > 0}
  bind:this={container}
>
  <input
    {id}
    name="address"
    class={inputClass}
    autocomplete="off"
    autocapitalize="words"
    spellcheck="true"
    {required}
    {disabled}
    bind:value
    on:focus={() => {
      if (suggestions.length > 0) open = true;
    }}
    on:keydown={onKeydown}
    aria-autocomplete="list"
    aria-expanded={open}
    aria-controls={`${id}-listbox`}
    role="combobox"
  />
  {#if loading}
    <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 pt-1">
      <span
        class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-teal-700"
      ></span>
    </div>
  {/if}

  {#if open && suggestions.length > 0}
    <ul
      id={`${id}-listbox`}
      class="absolute left-0 right-0 z-[200] mt-2 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface py-1 shadow-lg ring-1 ring-slate-900/[0.06]"
      role="listbox"
    >
      {#each suggestions as s, i}
        <li role="presentation">
          <button
            type="button"
            class="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-canvas/50 {i === active ? 'bg-canvas/20' : ''}"
            on:mousedown|preventDefault={() => pick(s)}
            role="option"
            aria-selected={i === active}
          >
            <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" aria-hidden="true"></span>
            <span class="leading-snug">{s.label}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
