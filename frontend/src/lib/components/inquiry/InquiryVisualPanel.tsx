import { Star } from 'lucide-react';
import { cn } from '$lib/utils/cn';
import './inquiry-visual-panel.css';

const CATEGORIES = ['Retail', 'Franchise', 'Clinics', 'Advisors'] as const;

export interface InquiryVisualPanelProps {
  className?: string;
}

export default function InquiryVisualPanel({ className = '' }: InquiryVisualPanelProps) {
  return (
    <aside
      className={cn('inquiry-visual', className)}
      aria-label="SpotCore location intelligence"
    >
      {/* Layer 1 — warm cream base gradient */}
      <div className="inquiry-visual__layer inquiry-visual__layer--base" aria-hidden="true" />

      {/* Layer 2 — top-down city / parcel abstraction */}
      <div className="inquiry-visual__layer inquiry-visual__layer--city" aria-hidden="true">
        <div className="inquiry-visual__city-grid" />
        <div className="inquiry-visual__city-blocks" />
        <div className="inquiry-visual__city-roads" />
      </div>

      {/* Layer 3 — signal dot grid */}
      <div className="inquiry-visual__layer inquiry-visual__layer--dots" aria-hidden="true" />

      {/* Layer 4 — warm focal bloom behind headline */}
      <div className="inquiry-visual__layer inquiry-visual__layer--bloom" aria-hidden="true" />

      {/* Subtle film grain */}
      <div className="inquiry-visual__layer inquiry-visual__layer--grain" aria-hidden="true" />

      {/* Layer 5 — content */}
      <div className="inquiry-visual__content">
        <header className="inquiry-visual__proof">
          <div className="inquiry-visual__stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="inquiry-visual__star" fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="inquiry-visual__proof-copy">
            Trusted for site decisions across growth teams
          </p>
        </header>

        <div className="inquiry-visual__hero">
          <h2 className="inquiry-visual__headline">
            Turn location uncertainty into clarity.
          </h2>
          <p className="inquiry-visual__support">
            See demand, competition, demographics, and local fit in one read—before you sign a
            lease or open a door.
          </p>
        </div>

        <footer className="inquiry-visual__strip">
          <p className="inquiry-visual__strip-label">Used to evaluate real-world location potential</p>
          <ul className="inquiry-visual__categories">
            {CATEGORIES.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </footer>
      </div>
    </aside>
  );
}
