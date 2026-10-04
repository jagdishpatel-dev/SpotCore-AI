import type { PointerEvent } from 'react';

/**
 * Pointer handler for a card grid: writes the cursor position into --mx/--my on
 * whichever `.geo-spotlight` card is under the pointer, so its border lights up there.
 */
export function onSpotlightMove(event: PointerEvent<HTMLElement>) {
  const card = (event.target as HTMLElement).closest<HTMLElement>('.geo-spotlight');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  card.style.setProperty('--my', `${event.clientY - rect.top}px`);
}
