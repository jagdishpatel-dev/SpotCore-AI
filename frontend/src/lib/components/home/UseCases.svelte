<script lang="ts">
  import { ShoppingBag, Building2, Sparkles, ArrowRight } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { reveal } from '$lib/actions/reveal';

  export let startHref = '/analyze';

  const cases = [
    {
      Icon: ShoppingBag,
      title: 'Store Buyers',
      desc: 'Validate a location before making an acquisition or signing a lease.',
      tint: 'from-accent-cyan/10 via-transparent',
      iconClass: 'border-accent-cyan/30 bg-accent-cyan/12 text-accent-cyan',
    },
    {
      Icon: Building2,
      title: 'Franchise Operators',
      desc: 'Compare expansion opportunities using consistent, AI-powered scoring.',
      tint: 'from-accent-blue/10 via-transparent',
      iconClass: 'border-accent-blue/30 bg-accent-blue/12 text-accent-blue',
    },
    {
      Icon: Sparkles,
      title: 'Independent Brands',
      desc: 'Find neighborhoods where your concept genuinely fits.',
      tint: 'from-accent-purple/10 via-transparent',
      iconClass: 'border-accent-purple/30 bg-accent-purple/12 text-accent-purple',
    },
  ];
</script>

<section
  class="home-section py-24"
  use:reveal={{ childStagger: 120 }}
  aria-labelledby="usecases-heading"
>
  <div class="mx-auto max-w-7xl px-6 lg:px-10">
    <div class="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div class="max-w-2xl">
        <Badge variant="outline">Who uses GeoScore</Badge>
        <h2
          id="usecases-heading"
          class="mt-5 font-display text-3xl font-bold tracking-[-0.02em] text-text-primary md:text-4xl"
        >
          Built for serious operators
        </h2>
      </div>
      <p class="max-w-md text-[15px] leading-[1.6] text-text-secondary">
        From single-shop founders to multi-unit franchise teams — GeoScore turns
        every address into a defensible, comparable decision.
      </p>
    </div>

    <div class="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 lg:gap-6">
      {#each cases as c}
        <div class="reveal-init" data-reveal-child>
          <Card
            class="group relative h-full overflow-hidden p-7"
            interactive
          >
            <div
              class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br {c.tint} to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            ></div>
            <span
              class="grid h-12 w-12 place-items-center rounded-xl border {c.iconClass}"
            >
              <svelte:component this={c.Icon} class="h-5 w-5" />
            </span>
            <h3 class="mt-5 text-xl font-semibold text-text-primary">
              {c.title}
            </h3>
            <p class="mt-2 text-[15px] leading-[1.6] text-text-secondary">
              {c.desc}
            </p>
            <a
              href={startHref}
              class="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-cyan transition-colors hover:text-accent-blue"
            >
              Start analyzing
              <ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Card>
        </div>
      {/each}
    </div>
  </div>
</section>
