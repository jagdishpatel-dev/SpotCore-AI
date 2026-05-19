<script lang="ts">
  import InteractiveDemoPanel from './InteractiveDemoPanel.svelte';
  import { reveal } from '$lib/actions/reveal';
</script>

<section aria-labelledby="demo-section-heading" use:reveal>
  <div class="geo-section">
    <div class="reveal-init mx-auto max-w-xl text-center" data-reveal-child>
      <p class="geo-label">Live preview</p>
      <h2 id="demo-section-heading" class="geo-section-title mt-3">
        See how a site gets scored
      </h2>
      <p class="mt-3 text-base text-geoscorer-text-muted">
        Try a sample location to see how GeoScorer evaluates demand, competition, and fit—no account
        required.
      </p>
    </div>

    <div class="reveal-init mt-10" data-reveal-child>
      <InteractiveDemoPanel />
    </div>
  </div>
</section>
