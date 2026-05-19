<script lang="ts">
  import { reveal } from '$lib/actions/reveal';

  const insights = [
    {
      title: 'Demand signals',
      body: 'Foot traffic patterns, category interest, and daypart strength—so you know when the trade area is actually active.',
    },
    {
      title: 'Nearby competition',
      body: 'POI density, brand overlap, and whitespace—mapped to your concept so saturation is visible before you tour.',
    },
    {
      title: 'Demographic fit',
      body: 'Income, age mix, and household composition aligned to your target customer—not generic market averages.',
    },
    {
      title: 'Area momentum',
      body: 'Neighborhood growth, new development, and mobility trends that signal whether demand is building or fading.',
    },
    {
      title: 'Site quality factors',
      body: 'Visibility, access, parking, and co-tenancy cues that affect real-world performance beyond the spreadsheet.',
    },
    {
      title: 'Decision-ready summary',
      body: 'A plain-language verdict with risks, opportunities, and next steps—written for operators, not data scientists.',
    },
  ];
</script>

<section
  id="insights"
  class="scroll-mt-24"
  aria-labelledby="insights-heading"
  use:reveal={{ childStagger: 50 }}
>
  <div class="geo-section">
    <p class="geo-label">What you get</p>
    <h2 id="insights-heading" class="geo-section-title mt-3">Insight categories in every report</h2>
    <p class="mt-3 max-w-2xl text-base text-geoscorer-text-muted">
      Each section answers a specific question expansion teams ask before committing capital to a site.
    </p>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each insights as item}
        <article class="reveal-init geo-card group p-5" data-reveal-child>
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-geoscorer-accent" aria-hidden="true"></span>
          <h3 class="mt-3 text-lg font-semibold text-geoscorer-text">{item.title}</h3>
          <p class="mt-2 text-sm leading-relaxed text-geoscorer-text-muted">{item.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>
