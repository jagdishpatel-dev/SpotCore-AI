import Badge from '$lib/components/ui/Badge';
import ServicesAccordion, { type ServiceItem } from '$lib/components/ui/ServicesAccordion';
import { useReveal } from '$lib/hooks/useReveal';

const items: ServiceItem[] = [
  {
    id: 'market-entry',
    title: 'Market entry & new sites',
    subtitle: 'Find the strongest neighborhoods for new openings.',
    body:
      'Use GeoScore to quickly rank potential addresses by viability, so your team can focus on the locations that are most likely to perform.',
    bullets: [
      'Compare demand, competition, and income at a glance.',
      'Spot red flags before you commit to a lease.',
      'Share decision-ready summaries with stakeholders.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Portfolio optimization',
    subtitle: 'See which locations to grow, fix, or exit.',
    body:
      'Layer performance with local demand, competition, and income to understand which stores are overperforming or at risk.',
    bullets: [
      'Identify underperforming sites in soft markets.',
      'Find high-potential trade areas to reinvest in.',
      'Support board-level portfolio discussions with objective data.',
    ],
  },
  {
    id: 'diligence',
    title: 'Lender & investor diligence',
    subtitle: 'Defend your assumptions with location data.',
    body:
      'Back up acquisition or development decisions with transparent, location-level evidence instead of gut feel.',
    bullets: [
      'Package local demand and risk into a single score.',
      'Give lenders confidence with clear, visual reports.',
      'Reduce surprises after capital has been deployed.',
    ],
  },
  {
    id: 'franchise',
    title: 'Franchise territory planning',
    subtitle: 'Map territories that are fair and sustainable.',
    body:
      'Design territories using consistent data so franchisees feel confident in their opportunity.',
    bullets: [
      'Define territories using demand + income + competition.',
      'Avoid overlapping, cannibalizing trade areas.',
      'Provide new franchisees with a defensible territory story.',
    ],
  },
];

export default function Services() {
  const headingRef = useReveal();

  return (
    <section
      id="services"
      className="home-section relative overflow-hidden bg-[var(--bg-surface)]/40 py-24 md:py-28"
      aria-labelledby="services-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[260px]"
        style={{
          background: 'radial-gradient(900px 240px at 50% 0%, var(--glow-cyan), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div
          ref={headingRef}
          className="reveal-init relative mx-auto max-w-3xl text-center"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[240px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
            style={{
              background: 'radial-gradient(closest-side, var(--glow-cyan), transparent 70%)',
            }}
          />

          <Badge variant="outline">How GeoScore helps</Badge>
          <h2
            id="services-heading"
            className="mt-5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-text-primary sm:text-[52px] md:text-[60px] lg:text-[64px]"
          >
            Turn location questions into
            <span className="block shimmer-text">clear answers.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-text-secondary md:text-lg">
            Different teams use GeoScore in different ways. Explore the core use cases we support out of
            the box.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-[1040px] md:mt-14">
          <ServicesAccordion items={items} defaultOpen="market-entry" />
        </div>
      </div>
    </section>
  );
}
