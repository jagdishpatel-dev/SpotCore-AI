
import Pill from './Pill';
import Reveal from './Reveal';
import AccentIcon from './AccentIcon';
import { generatedAtPretty, shortAddress } from '$lib/utils/report';
import type { AnalyzeSiteResponse } from '$lib/types';

export interface MetaStripProps {
  result: AnalyzeSiteResponse;
  businessType?: string;
  confidencePct: number;
}

export default function MetaStrip({ result, businessType = '', confidencePct }: MetaStripProps) {
  const address = shortAddress(result.location?.label, result.location?.display_name);
  const generated = generatedAtPretty();

  return (
    <Reveal y={8} duration={350} immediate>
      <div
        className="flex flex-wrap items-center justify-center gap-2 md:justify-start"
        aria-label="Report metadata"
      >
        <Pill tone="neutral">
          <AccentIcon name="pin" size={13} />
          <span className="text-ink/90">{address}</span>
        </Pill>
        {businessType ? (
          <Pill tone="cyan">
            <AccentIcon name="storefront" size={13} />
            <span>{businessType}</span>
          </Pill>
        ) : null}
        <Pill tone="neutral">
          <AccentIcon name="clock" size={13} />
          <span className="text-muted">{generated}</span>
        </Pill>
        <Pill tone="blue">
          <AccentIcon name="sparkle" size={13} />
          <span className="gs-num">Confidence {confidencePct}%</span>
        </Pill>
      </div>
    </Reveal>
  );
}
