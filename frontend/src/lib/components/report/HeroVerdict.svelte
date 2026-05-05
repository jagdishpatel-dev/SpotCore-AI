<script lang="ts">
  import GlassCard from './GlassCard.svelte';
  import ThreadsBg from './ThreadsBg.svelte';
  import CountUp from './CountUp.svelte';
  import Reveal from './Reveal.svelte';
  import Pill from './Pill.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import type { VerdictMeta } from '$lib/utils/report';

  export let score: number;
  export let verdict: VerdictMeta;

  $: tone = verdict.tier === 'strong' ? 'positive' : verdict.tier === 'medium' ? 'warning' : 'danger';
  $: scoreColor =
    verdict.tier === 'strong'
      ? 'gs-cyan-text'
      : verdict.tier === 'medium'
        ? 'text-warning'
        : 'text-danger';
</script>

<section class="relative">
  <!-- Animated background, restrained -->
  <ThreadsBg intensity={0.55} />

  <div class="relative px-2 py-12 md:py-16">
    <div class="mx-auto max-w-3xl text-center">
      <Reveal y={8} duration={380} immediate={true}>
        <p class="gs-label text-muted-2">Investment viability</p>
      </Reveal>

      <Reveal y={14} duration={520} delay={80} immediate={true}>
        <GlassCard tone="cyan" class="mt-5 px-6 py-10 md:px-12 md:py-14">
          <div class="flex flex-col items-center gap-7">
            <!-- Score -->
            <div class="flex items-baseline gap-2">
              <span class="gs-num {scoreColor} text-[60px] font-bold leading-none md:text-[88px]">
                <CountUp to={Math.round(score)} duration={1100} immediate={true} />
              </span>
              <span class="gs-num text-muted-2 text-2xl md:text-3xl">/ 100</span>
            </div>

            <!-- Verdict label -->
            <div class="flex flex-wrap items-center justify-center gap-2.5">
              <Pill tone={tone === 'positive' ? 'positive' : tone === 'warning' ? 'warning' : 'danger'} size="md">
                <AccentIcon name={tone === 'positive' ? 'check' : tone === 'warning' ? 'shield' : 'shield'} size={14} />
                {verdict.label}
              </Pill>
              <Pill tone="cyan" size="md">
                <AccentIcon name="sparkle" size={14} />
                <span class="gs-num">Confidence {verdict.confidencePct}%</span>
              </Pill>
            </div>

            <!-- One-liner -->
            <p class="max-w-xl text-balance text-base leading-relaxed text-ink/90 md:text-lg">
              {verdict.oneLiner}
            </p>

            <!-- Tags -->
            {#if verdict.tags.length}
              <div class="flex flex-wrap justify-center gap-2 pt-1">
                {#each verdict.tags as t, i (t)}
                  <Reveal y={6} duration={400} delay={520 + i * 70} immediate={true}>
                    <Pill tone="neutral">{t}</Pill>
                  </Reveal>
                {/each}
              </div>
            {/if}
          </div>
        </GlassCard>
      </Reveal>
    </div>
  </div>
</section>

<style>
  /* Score-section needs relative isolation so the threads layer doesn't escape. */
  section {
    isolation: isolate;
  }
</style>
