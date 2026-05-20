import { useState } from 'react';
import IntroOverlay from '$lib/components/home/IntroOverlay';
import Hero from '$lib/components/home/Hero';
import StatsTrust from '$lib/components/home/StatsTrust';
import DemoSection from '$lib/components/home/DemoSection';
import HowItWorks from '$lib/components/home/HowItWorks';
import InsightCategories from '$lib/components/home/InsightCategories';
import UseCases from '$lib/components/home/UseCases';
import SampleReport from '$lib/components/home/SampleReport';
import Testimonials from '$lib/components/home/Testimonials';
import FAQ from '$lib/components/home/FAQ';
import FinalCTA from '$lib/components/home/FinalCTA';

const startHref = '/analyze';

export default function HomePage() {
  const [heroRevealReady, setHeroRevealReady] = useState(false);

  return (
    <div className="marketing-page flex min-h-full flex-col">
      <IntroOverlay onComplete={() => setHeroRevealReady(true)} />
      <Hero startHref={startHref} heroRevealReady={heroRevealReady} />
      <StatsTrust />
      <DemoSection />
      <HowItWorks />
      <InsightCategories />
      <UseCases startHref={startHref} />
      <SampleReport startHref={startHref} />
      <Testimonials />
      <FAQ />
      <FinalCTA startHref={startHref} />
    </div>
  );
}
