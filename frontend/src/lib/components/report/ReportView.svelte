<script lang="ts">
  import MetaStrip from './MetaStrip.svelte';
  import HeroVerdict from './HeroVerdict.svelte';
  import BusinessSnapshot from './BusinessSnapshot.svelte';
  import StrategicReadout from './StrategicReadout.svelte';
  import PlayCards from './PlayCards.svelte';
  import ScoreDrivers from './ScoreDrivers.svelte';
  import DemandCharts from './DemandCharts.svelte';
  import LocationIntel from './LocationIntel.svelte';
  import BenefitsGrid from './BenefitsGrid.svelte';
  import FooterCTA from './FooterCTA.svelte';

  import type { AnalyzeSiteResponse } from '$lib/types';
  import { buildVerdict, driverData } from '$lib/utils/report';

  export let result: AnalyzeSiteResponse;
  export let businessType: string = '';
  export let onAnalyzeAnother: () => void;
  export let secondaryLabel: string | null = null;
  export let onSecondary: (() => void) | null = null;

  $: verdict = buildVerdict(result);
  $: drivers = driverData(result.scores);
</script>

<article class="gs-report mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-16 pt-6 md:gap-[72px] md:px-6 md:pb-20 md:pt-8">
  <!-- 1. Top metadata strip -->
  <MetaStrip {result} {businessType} confidencePct={verdict.confidencePct} />

  <!-- 2. Hero verdict -->
  <HeroVerdict score={result.total_score} {verdict} />

  <!-- 3. Business snapshot -->
  <BusinessSnapshot {result} {businessType} />

  <!-- 4. Strategic readout -->
  <StrategicReadout {result} />

  <!-- 5. Advantage / Risk / Recommended play -->
  <PlayCards {result} />

  <!-- 6. Score drivers -->
  <ScoreDrivers {drivers} />

  <!-- 7. Demand & future outlook -->
  <DemandCharts {result} />

  <!-- 8. Location intelligence -->
  <LocationIntel {result} />

  <!-- 9. What you get -->
  <BenefitsGrid />

  <!-- 10. Footer CTA -->
  <FooterCTA {onAnalyzeAnother} {secondaryLabel} {onSecondary} />
</article>

<style>
  .gs-report {
    color-scheme: dark;
  }
</style>
