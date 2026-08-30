
import { useEffect, useState } from 'react';
import CityGrid from './CityGrid';
import { prefersReducedMotion } from '$lib/utils/motion';
import { cn } from '$lib/utils/cn';

const STORAGE_KEY = 'spotcore-intro-seen';
const HOLD_MS = 1000;
const FADE_OUT_MS = 420;
const REDUCED_HOLD_MS = 400;

export interface IntroOverlayProps {
  onComplete?: () => void;
}

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const finishIntro = () => onComplete?.();

    if (typeof window === 'undefined') {
      finishIntro();
      return;
    }

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') {
        finishIntro();
        return;
      }
    } catch {
      finishIntro();
      return;
    }

    setShowOverlay(true);
    const reduced = prefersReducedMotion();
    const hold = reduced ? REDUCED_HOLD_MS : HOLD_MS;
    const fadeOut = reduced ? 200 : FADE_OUT_MS;

    const holdTimer = window.setTimeout(() => {
      setExiting(true);
      finishIntro();
      window.setTimeout(() => {
        setShowOverlay(false);
        try {
          sessionStorage.setItem(STORAGE_KEY, '1');
        } catch {
          /* ignore */
        }
      }, fadeOut);
    }, hold);

    return () => window.clearTimeout(holdTimer);
  }, [onComplete]);

  if (!showOverlay) return null;

  return (
    <div
      className={cn('intro-overlay', exiting && 'intro-overlay--exit')}
      aria-hidden={exiting}
      role="presentation"
    >
      <div className="intro-overlay__inner">
        <p className="intro-overlay__wordmark font-sans text-2xl font-medium tracking-heading text-spotcore-text md:text-3xl">
          SpotCore
        </p>
        <div className="intro-overlay__city" aria-hidden="true">
          <CityGrid cols={10} rows={7} cellClass="h-2.5 w-2.5 sm:h-3 sm:w-3" gapClass="gap-1" />
        </div>
      </div>
    </div>
  );
}
