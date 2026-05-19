<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const stats = [
    { value: '300+', label: 'candidate locations analyzed' },
    { value: '60%', label: 'faster site review cycle' },
    { value: '1', label: 'report for every site decision' },
    { value: '4', label: 'pillars in every site score' },
  ];
</script>

<section class="border-y border-geoscorer-border bg-geoscorer-surface/60" aria-label="Trust metrics" use:reveal={{ childStagger: 60 }}>
  <div class="geo-section !py-8 md:!py-10">
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {#each stats as s}
        <div class="reveal-init geo-metric-card text-center md:text-left" data-reveal-child>
          <p class="font-display text-2xl font-semibold text-geoscorer-accent md:text-3xl">{s.value}</p>
          <p class="mt-1 text-sm text-geoscorer-text-muted">{s.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
