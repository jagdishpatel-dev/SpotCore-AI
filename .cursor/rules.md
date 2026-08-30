# Cursor Project Rules – SpotCore

## Purpose
SpotCore is an AI-powered location intelligence product. The app analyzes an address + business type and returns a premium, executive-style location report for people deciding whether to buy or open a store.

## General rules
- Do NOT break or change core data logic, scoring logic, or external API calls unless explicitly asked.
- When I say “redesign” or “style”, update **only the UI/UX layer** (components, layout, CSS/Tailwind, animations).
- Keep the design consistent across all pages: same colors, typography, spacing, and motion.

## Design system
- Theme: dark, premium, “executive intelligence” feel (similar to high-end fintech / analytics).
- Colors:
  - Background: #020617
  - Surfaces: #020A1A / #050F24
  - Primary text: #E5E7EB
  - Secondary text: #9CA3AF
  - Accent: #22D3EE / #38BDF8
  - Positive: #22C55E
  - Warning: #F97316
  - Danger: #EF4444
- Typography:
  - Use **Inter** or **Geist** for all UI text.
  - Use **Space Grotesk** (or similar) for big scores / numeric displays where it fits.
  - Keep copy short and scannable. Avoid long paragraphs in the UI.
- Layout:
  - Use an 8px spacing system.
  - Cards are rounded (18–24px), with subtle borders and soft shadows.
  - Prefer sections with clear headings, then concise content.

## Animations
- Use subtle, premium motion:
  - Fade + slight slide-up on section reveal.
  - Smooth score count-up animation.
  - Small hover lift and border highlight on cards and buttons.
- Avoid:
  - Bouncy / elastic animations.
  - Spinning icons.
  - Loud neon/glitch effects.
- Respect reduced-motion preferences where possible.

## Technology / components
- Framework: [fill in – e.g., Next.js + React + Tailwind].
- Reuse existing layout and components where possible.
- When adding fancy UI (backgrounds, glass cards, devices), prefer using **React Bits** or similar, but:
  - Keep backgrounds subtle and ensure content is always readable.
  - Do not introduce complex dependencies without clear benefit.

## Important files
- Report page UI: [put path, e.g., `src/app/report/page.tsx` or similar]
- Shared layout / shell: [path]
- Design tokens / theme: [path, e.g., `src/styles/globals.css` or `tailwind.config.ts`]
- Core analysis logic (DO NOT casually edit):
  - Business context + scoring: [path]
  - Data fetching / APIs: [path]

## When I ask for changes
- If I say “redesign the report”, assume:
  - Keep the data intact, only change layout, styling, and animations.
  - Keep component names and props unless they are obviously bad.
- If something is ambiguous, prefer:
  - Cleaner, more minimal design.
  - Better readability and hierarchy.
  - Less visual noise over more decoration.