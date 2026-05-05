<script lang="ts">
  import Pill from './Pill.svelte';
  import Reveal from './Reveal.svelte';
  import AccentIcon from './AccentIcon.svelte';
  import { generatedAtPretty, shortAddress } from '$lib/utils/report';
  import type { AnalyzeSiteResponse } from '$lib/types';

  export let result: AnalyzeSiteResponse;
  export let businessType: string = '';
  export let confidencePct: number;

  $: address = shortAddress(result.location?.label, result.location?.display_name);
  $: generated = generatedAtPretty();
</script>

<Reveal y={8} duration={350} immediate={true}>
  <div
    class="flex flex-wrap items-center justify-center gap-2 md:justify-start"
    aria-label="Report metadata"
  >
    <Pill tone="neutral">
      <AccentIcon name="pin" size={13} />
      <span class="text-ink/90">{address}</span>
    </Pill>
    {#if businessType}
      <Pill tone="cyan">
        <AccentIcon name="storefront" size={13} />
        <span>{businessType}</span>
      </Pill>
    {/if}
    <Pill tone="neutral">
      <AccentIcon name="clock" size={13} />
      <span class="text-muted">{generated}</span>
    </Pill>
    <Pill tone="blue">
      <AccentIcon name="sparkle" size={13} />
      <span class="gs-num">Confidence {confidencePct}%</span>
    </Pill>
  </div>
</Reveal>
