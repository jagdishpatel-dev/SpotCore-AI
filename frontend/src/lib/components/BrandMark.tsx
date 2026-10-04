import { cn } from '$lib/utils/cn';

export interface BrandMarkProps {
  className?: string;
}

/** SpotCore mark: a parcel grid with a targeted lot. Matches /favicon.svg. */
export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('h-9 w-9 shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill="var(--gs-accent)" />
      <path
        d="M8 11.5h16M8 16h16M8 20.5h16M11.5 8v16M16 8v16M20.5 8v16"
        stroke="#fffdf9"
        strokeOpacity=".22"
        strokeWidth="1"
      />
      <circle cx="16" cy="16" r="4.25" fill="none" stroke="#fffdf9" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.5" fill="#fffdf9" />
    </svg>
  );
}
