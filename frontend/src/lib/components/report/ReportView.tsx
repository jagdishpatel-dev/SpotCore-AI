
import MetaStrip from './MetaStrip';
import HeroVerdict from './HeroVerdict';
import BusinessSnapshot from './BusinessSnapshot';
import StrategicReadout from './StrategicReadout';
import PlayCards from './PlayCards';
import ScoreDrivers from './ScoreDrivers';
import DemandCharts from './DemandCharts';
import LocationIntel from './LocationIntel';
import BenefitsGrid from './BenefitsGrid';
import FooterCTA from './FooterCTA';
import { buildVerdict, driverData } from '$lib/utils/report';
import type { AnalyzeSiteResponse } from '$lib/types';
import './report.css';

export interface ReportViewProps {
  result: AnalyzeSiteResponse;
  businessType?: string;
  onAnalyzeAnother: () => void;
  secondaryLabel?: string | null;
  onSecondary?: (() => void) | null;
}

export default function ReportView({
  result,
  businessType = '',
  onAnalyzeAnother,
  secondaryLabel = null,
  onSecondary = null,
}: ReportViewProps) {
  const verdict = buildVerdict(result);
  const drivers = driverData(result.scores);

  return (
    <article className="gs-report mx-auto flex max-w-6xl flex-col gap-14 px-4 pb-16 pt-6 md:gap-[72px] md:px-6 md:pb-20 md:pt-8">
      <MetaStrip result={result} businessType={businessType} confidencePct={verdict.confidencePct} />
      <HeroVerdict score={result.total_score} verdict={verdict} />
      <BusinessSnapshot result={result} businessType={businessType} />
      <StrategicReadout result={result} />
      <PlayCards result={result} />
      <ScoreDrivers drivers={drivers} />
      <DemandCharts result={result} />
      <LocationIntel result={result} businessType={businessType} />
      <BenefitsGrid />
      <FooterCTA
        onAnalyzeAnother={onAnalyzeAnother}
        secondaryLabel={secondaryLabel}
        onSecondary={onSecondary}
      />
    </article>
  );
}
