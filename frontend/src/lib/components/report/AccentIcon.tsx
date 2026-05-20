
export type AccentIconName =
  | 'spark'
  | 'shield'
  | 'compass'
  | 'pin'
  | 'transit'
  | 'people'
  | 'storefront'
  | 'chart'
  | 'sparkle'
  | 'check'
  | 'arrow-right'
  | 'clock'
  | 'tag';

export interface AccentIconProps {
  name: AccentIconName;
  size?: number;
}

export default function AccentIcon({ name, size = 18 }: AccentIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {name === 'spark' && (
        <>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </>
      )}
      {name === 'shield' && <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />}
      {name === 'compass' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path
            d="M15.5 8.5l-2 5-5 2 2-5 5-2z"
            fill="currentColor"
            stroke="none"
            opacity="0.85"
          />
        </>
      )}
      {name === 'pin' && (
        <>
          <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
          <circle cx="12" cy="9" r="2.5" />
        </>
      )}
      {name === 'transit' && (
        <>
          <rect x="6" y="3" width="12" height="14" rx="3" />
          <path d="M6 11h12M9 21l-1-2M16 21l-1-2" />
          <circle cx="9.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
        </>
      )}
      {name === 'people' && (
        <>
          <circle cx="9" cy="9" r="3" />
          <circle cx="17" cy="11" r="2.5" />
          <path d="M3 19c.6-3 3-5 6-5s5.4 2 6 5" />
          <path d="M14 19c.4-2 2-3.5 4-3.5s3.6 1.5 4 3.5" />
        </>
      )}
      {name === 'storefront' && (
        <>
          <path d="M3 9l1.5-4h15L21 9" />
          <path d="M4 9v10h16V9" />
          <path d="M3 9c0 2 1.5 3 3 3s3-1 3-3M9 9c0 2 1.5 3 3 3s3-1 3-3M15 9c0 2 1.5 3 3 3s3-1 3-3" />
        </>
      )}
      {name === 'chart' && <path d="M3 20h18M5 17V8M10 17v-6M15 17v-9M20 17v-4" />}
      {name === 'sparkle' && (
        <>
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
          <path d="M19 14l.8 2 2 .8-2 .8L19 20l-.8-2.4-2-.8 2-.8L19 14z" />
        </>
      )}
      {name === 'check' && <path d="M5 12l5 5 9-11" />}
      {name === 'arrow-right' && <path d="M5 12h14M13 6l6 6-6 6" />}
      {name === 'clock' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {name === 'tag' && (
        <>
          <path d="M3 12V5h7l11 11-7 7L3 12z" />
          <circle cx="7.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
