<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const quotes = [
    {
      quote:
        'We used to spend two weeks on broker packets. GeoScorer gives us a comparable read in an afternoon.',
      name: 'Maya Chen',
      role: 'Director of Development, regional QSR',
    },
    {
      quote:
        'The report reads like our actual portal—not a marketing mock. That continuity mattered when we rolled it out to franchisees.',
      name: 'James Okonkwo',
      role: 'VP Expansion, multi-unit fitness',
    },
    {
      quote:
        'Finally a site score we can explain: demand, competition, demographics—each with evidence, not a black box.',
      name: 'Priya Nair',
      role: 'Principal, retail advisory',
    },
  ];
</script>

<section aria-labelledby="testimonials-heading" use:reveal={{ childStagger: 70 }}>
  <div class="geo-section">
    <p class="geo-label">Operators</p>
    <h2 id="testimonials-heading" class="geo-section-title mt-3">Teams evaluating sites with GeoScorer</h2>

    <div class="mt-10 grid gap-4 md:grid-cols-3">
      {#each quotes as q}
        <blockquote class="reveal-init geo-card flex h-full flex-col p-5" data-reveal-child>
          <p class="flex-1 text-sm leading-relaxed text-geoscorer-text">"{q.quote}"</p>
          <footer class="mt-5 border-t border-geoscorer-border pt-4">
            <p class="text-sm font-semibold text-geoscorer-text">{q.name}</p>
            <p class="text-xs text-geoscorer-text-muted">{q.role}</p>
          </footer>
        </blockquote>
      {/each}
    </div>
  </div>
</section>
