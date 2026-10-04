import { useEffect, useState } from 'react';
import BrandMark from '$lib/components/BrandMark';
import CityGrid from './CityGrid';
import { prefersReducedMotion } from '$lib/utils/motion';
import { cn } from '$lib/utils/cn';

const STORAGE_KEY = 'spotcore-intro-seen';
const HOLD_MS = 1100;
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
        <div className="intro-overlay__wordmark flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-spotcore-text md:text-4xl">
            SpotCore
          </p>
        </div>
        <div className="intro-overlay__city" aria-hidden="true">
          <CityGrid cols={12} rows={6} cellClass="h-2 w-2 sm:h-2.5 sm:w-2.5" gapClass="gap-1.5" />
        </div>
        <div className="intro-overlay__bar" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
