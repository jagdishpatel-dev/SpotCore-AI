<script lang="ts">
  import Hero from '$lib/components/home/Hero.svelte';
  import TrustBar from '$lib/components/home/TrustBar.svelte';
  import OldVsNew from '$lib/components/home/OldVsNew.svelte';
  import Services from '$lib/components/home/Services.svelte';
  import DataSignals from '$lib/components/home/DataSignals.svelte';
  import UseCases from '$lib/components/home/UseCases.svelte';
  import FAQ from '$lib/components/home/FAQ.svelte';
  import FinalCTA from '$lib/components/home/FinalCTA.svelte';

  const startHref = '/analyze';
</script>

<div class="home-bg flex flex-col">
  <!-- Promise + interactive demo (single hero band) -->
  <Hero {startHref} />

  <!-- Expansion + trust-building -->
  <TrustBar />
  <OldVsNew />
  <Services />
  <DataSignals />
  <UseCases {startHref} />
  <FAQ />
  <FinalCTA {startHref} />
</div>
