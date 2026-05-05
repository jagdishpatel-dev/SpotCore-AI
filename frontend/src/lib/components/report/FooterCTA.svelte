<script lang="ts">
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';

  export let onAnalyzeAnother: () => void;
  export let secondaryLabel: string | null = null;
  export let onSecondary: (() => void) | null = null;
</script>

<section class="relative px-2 py-2 md:py-4">
  <Reveal y={16} duration={560}>
    <div
      class="relative overflow-hidden rounded-3xl border border-line/80 bg-surface px-6 py-12 text-center md:px-12 md:py-16"
    >
      <div
        class="pointer-events-none absolute inset-0"
        style="background:
          radial-gradient(60% 80% at 50% 0%, rgba(34, 211, 238, 0.18), transparent 60%),
          radial-gradient(50% 60% at 100% 100%, rgba(56, 189, 248, 0.10), transparent 60%);"
      ></div>
      <div class="relative">
        <p class="gs-label text-accent">Next step</p>
        <h3 class="mt-3 text-balance text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Compare another address.
        </h3>
        <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted md:text-base">
          Run another site and see how this block stacks up. Most operators short-list 3–5
          locations before committing.
        </p>

        <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            on:click={onAnalyzeAnother}
            class="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600 px-7 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.3),0_18px_48px_-12px_rgba(34,211,238,0.45)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
          >
            Run another analysis
            <span class="transition-transform duration-200 group-hover:translate-x-0.5">
              <AccentIcon name="arrow-right" size={16} />
            </span>
          </button>
          {#if secondaryLabel && onSecondary}
            <button
              type="button"
              on:click={onSecondary}
              class="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white/[0.02] px-6 py-3.5 text-sm font-medium text-ink transition hover:border-accent/40 hover:bg-white/[0.04]"
            >
              {secondaryLabel}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </Reveal>
</section>
