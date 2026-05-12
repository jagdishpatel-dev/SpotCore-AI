<script lang="ts" context="module">
  /** Item shape for the rich, services-style accordion. */
  export interface ServiceItem {
    id: string;
    title: string;
    /** Inline secondary line shown under the title in the row header. */
    subtitle?: string;
    /** Paragraph shown at the top of the expanded panel. */
    body: string;
    /** Up to ~3 short bullets shown beneath the body paragraph. */
    bullets?: string[];
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { slide, fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Plus } from 'lucide-svelte';
  import { cn } from '$lib/utils/cn';
  import { prefersReducedMotion } from '$lib/actions/reveal';

  export let items: ServiceItem[] = [];
  /** When true, multiple panels can be open at once. Default: single-open. */
  export let multiple = false;
  /**
   * id of the item open by default. When omitted, the first item opens.
   * Pass `null` to open none.
   */
  export let defaultOpen: string | null | undefined = undefined;
  /** Optional id prefix to keep aria-controls / labelledby unique per page. */
  export let idPrefix = 'svc';

  let className = '';
  export { className as class };

  const initial =
    defaultOpen === undefined ? items[0]?.id ?? null : defaultOpen;
  let openSet = new Set<string>(initial ? [initial] : []);

  function toggle(id: string) {
    const next = new Set(openSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      if (!multiple) next.clear();
      next.add(id);
    }
    openSet = next;
  }

  // Detect reduced-motion once on mount (client-only); SSR defaults to false.
  let reduce = false;
  if (typeof window !== 'undefined') reduce = prefersReducedMotion();

  // Tunable timings (ms)
  const SLIDE_OPEN = 220;
  const SLIDE_CLOSE = 170;
  const CONTENT_IN = 220;
  const CONTENT_OUT = 120;

  // Scroll-reveal: stagger the rows in once when the list enters the viewport.
  let listEl: HTMLDivElement;
  onMount(() => {
    if (!listEl) return;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      listEl.classList.add('svc-revealed');
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            listEl.classList.add('svc-revealed');
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(listEl);
    return () => obs.disconnect();
  });
</script>

<div bind:this={listEl} class={cn('svc-list flex flex-col gap-3', className)}>
  {#each items as item, i (item.id)}
    {@const open = openSet.has(item.id)}
    <div
      style={`--svc-i:${i}`}
      class={cn(
        'svc-row group/row relative rounded-xl border bg-[var(--bg-surface)] transition-[border-color,box-shadow,background-color] duration-200 ease-out',
        open
          ? 'border-accent-cyan/35 shadow-[0_18px_48px_-26px_rgba(34,211,238,0.32)]'
          : 'border-[var(--border-soft)] hover:border-accent-cyan/25 hover:bg-[var(--bg-surface-2)]/60 hover:shadow-[0_10px_28px_-18px_rgba(15,23,42,0.45)]'
      )}
    >
      <h3 class="m-0">
        <button
          type="button"
          id={`${idPrefix}-header-${item.id}`}
          aria-expanded={open}
          aria-controls={`${idPrefix}-panel-${item.id}`}
          on:click={() => toggle(item.id)}
          class="flex min-h-[64px] w-full items-center justify-between gap-5 rounded-xl px-5 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-0 sm:gap-6 sm:px-6 sm:py-6"
        >
          <span class="flex min-w-0 flex-col gap-1">
            <span
              class="text-[17px] font-semibold leading-snug tracking-[-0.005em] text-text-primary sm:text-[19px]"
            >
              {item.title}
            </span>
            {#if item.subtitle}
              <span class="text-[13px] font-normal leading-snug text-text-muted sm:text-[14px]">
                {item.subtitle}
              </span>
            {/if}
          </span>

          <span
            class={cn(
              'grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border transition-[transform,border-color,background-color,color] duration-200 ease-out',
              open
                ? 'rotate-45 border-accent-cyan/55 bg-accent-cyan/12 text-accent-cyan'
                : 'border-[var(--border-soft)] text-text-secondary group-hover/row:border-accent-cyan/45 group-hover/row:text-accent-cyan'
            )}
            aria-hidden="true"
          >
            <Plus class="h-4 w-4" strokeWidth={2.25} />
          </span>
        </button>
      </h3>

      {#if open}
        <div
          id={`${idPrefix}-panel-${item.id}`}
          role="region"
          aria-labelledby={`${idPrefix}-header-${item.id}`}
          in:slide={{ duration: reduce ? 0 : SLIDE_OPEN, easing: cubicOut }}
          out:slide={{ duration: reduce ? 0 : SLIDE_CLOSE, easing: cubicOut }}
        >
          <div
            class="px-5 pb-6 sm:px-6 sm:pb-7"
            in:fly={{
              y: reduce ? 0 : 4,
              duration: reduce ? 0 : CONTENT_IN,
              delay: reduce ? 0 : 60,
              easing: cubicOut,
            }}
            out:fade={{ duration: reduce ? 0 : CONTENT_OUT }}
          >
            <div class="max-w-[640px]">
              <p class="text-[15px] leading-[1.65] text-text-secondary">
                {item.body}
              </p>
              {#if item.bullets && item.bullets.length > 0}
                <ul class="mt-4 flex flex-col gap-2.5">
                  {#each item.bullets as b}
                    <li
                      class="flex items-start gap-3 text-[14.5px] leading-[1.55] text-text-secondary"
                    >
                      <span
                        class="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan/70"
                        aria-hidden="true"
                      ></span>
                      <span>{b}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>
