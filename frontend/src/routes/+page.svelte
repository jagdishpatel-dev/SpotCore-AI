<script lang="ts">
  import IntroOverlay from '$lib/components/home/IntroOverlay.svelte';
  import Hero from '$lib/components/home/Hero.svelte';
  import StatsTrust from '$lib/components/home/StatsTrust.svelte';
  import DemoSection from '$lib/components/home/DemoSection.svelte';
  import HowItWorks from '$lib/components/home/HowItWorks.svelte';
  import InsightCategories from '$lib/components/home/InsightCategories.svelte';
  import UseCases from '$lib/components/home/UseCases.svelte';
  import SampleReport from '$lib/components/home/SampleReport.svelte';
  import Testimonials from '$lib/components/home/Testimonials.svelte';
  import FAQ from '$lib/components/home/FAQ.svelte';
  import FinalCTA from '$lib/components/home/FinalCTA.svelte';

  const startHref = '/analyze';

  let heroRevealReady = false;

  function onIntroComplete() {
    heroRevealReady = true;
  }
</script>

<div class="marketing-page flex min-h-full flex-col">
  <IntroOverlay oncomplete={onIntroComplete} />

  <Hero {startHref} revealReady={heroRevealReady} />
  <StatsTrust />
  <DemoSection />
  <HowItWorks />
  <InsightCategories />
  <UseCases {startHref} />
  <SampleReport {startHref} />
  <Testimonials />
  <FAQ />
  <FinalCTA {startHref} />
</div>
