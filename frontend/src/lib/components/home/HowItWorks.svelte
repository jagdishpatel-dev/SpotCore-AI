<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, ScanSearch, FileText } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { reveal, prefersReducedMotion } from '$lib/actions/reveal';

  const steps = [
    {
      n: '01',
      Icon: MapPin,
      title: 'Enter address + business type',
      body: 'Drop in any U.S. address and your concept. We resolve the geography and the catchment area.',
    },
    {
      n: '02',
      Icon: ScanSearch,
      title: 'We pull every relevant signal',
      body: 'Demographics, mobility, demand trends, competition, reviews — fused into one scorable view.',
    },
    {
      n: '03',
      Icon: FileText,
      title: 'Get a clear, AI-written readout',
      body: 'A viability score, strategic readout, risks, and advantages — all decision-ready in minutes.',
    },
  ];

  let connectorEls: HTMLDivElement[] = [];
  let dotEls: HTMLDivElement[] = [];

  onMount(() => {
    if (prefersReducedMotion()) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            if (Number.isFinite(idx) && dotEls[idx]) {
              dotEls[idx].classList.add('run');
            }
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.4 }
    );

    connectorEls.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  });
</script>

<section
  id="how-it-works"
  class="home-section py-24"
  use:reveal={{ childStagger: 120 }}
  aria-labelledby="how-heading"
>
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="mx-auto max-w-2xl text-center">
      <Badge variant="outline">Simple Process</Badge>
      <h2
        id="how-heading"
        class="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl"
      >
        Three steps to a clear decision
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-base text-text-secondary md:text-lg">
        From an address to a strategic readout — without spreadsheets, broker
        calls, or guesswork.
      </p>
    </div>

    <div class="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:gap-6">
      {#each steps as step, i}
        <div class="reveal-init relative" data-reveal-child>
          <Card class="h-full p-7" interactive>
            <div class="flex items-start justify-between">
              <span
                class="font-display text-[40px] font-bold leading-none text-accent-cyan/90"
              >
                {step.n}
              </span>
              <span
                class="grid h-10 w-10 place-items-center rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
              >
                <svelte:component this={step.Icon} class="h-5 w-5" />
              </span>
            </div>
            <h3 class="mt-5 text-lg font-semibold text-text-primary">
              {step.title}
            </h3>
            <p class="mt-2 text-[15px] leading-[1.6] text-text-secondary">
              {step.body}
            </p>
          </Card>

          {#if i < steps.length - 1}
            <div
              bind:this={connectorEls[i]}
              data-idx={i}
              class="pointer-events-none absolute right-0 top-1/2 hidden h-[2px] w-6 -translate-y-1/2 translate-x-1/2 md:block"
              aria-hidden="true"
            >
              <div class="connector-line h-full w-full"></div>
              <div bind:this={dotEls[i]} class="connector-dot"></div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
