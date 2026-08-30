/**
 * React hooks for the homepage interactive demo panel state machine.
 * Mirrors `$lib/stores/demoFlow` for use in React marketing components.
 */

import { useCallback, useSyncExternalStore } from 'react';
import { prefersReducedMotion, tweenNumber } from '$lib/utils/motion';

export type Phase = 'idle' | 'running' | 'done';

export interface FormState {
  address: string;
  concept: string;
  radius: string;
  profile: string;
}

export const CONCEPTS = [
  'Coffee shop',
  'Fast casual restaurant',
  'Boutique fitness',
  'Convenience retail',
] as const;

export const RADII = ['5 min drive', '1 mile', '15 min walk'] as const;

export const PROFILES = [
  'Young professionals',
  'Families',
  'Commuters',
] as const;

export const DEMO_EXAMPLE_ADDRESS = '123 Main St, Austin, TX';

export function demoDisplayAddress(address: string): string {
  return address.trim() || DEMO_EXAMPLE_ADDRESS;
}

export const STEPS = [
  'Resolving address and trade area',
  'Pulling demographic and income signals',
  'Mapping local competition',
  'Reading demand and mobility patterns',
  'Generating strategic summary',
  'Calculating viability score',
] as const;

export interface DemoFlowSnapshot {
  phase: Phase;
  formState: FormState;
  currentStep: number;
  progress: number;
  homepageDemoAutoplayDisabled: boolean;
  homepageDemoTimerGeneration: number;
}

const initialFormState: FormState = {
  address: '',
  concept: 'Coffee shop',
  radius: '5 min drive',
  profile: 'Young professionals',
};

let snapshot: DemoFlowSnapshot = {
  phase: 'idle',
  formState: { ...initialFormState },
  currentStep: -1,
  progress: 0,
  homepageDemoAutoplayDisabled: false,
  homepageDemoTimerGeneration: 0,
};

const listeners = new Set<() => void>();
let runId = 0;
let timers: number[] = [];
let progressCancel: (() => void) | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoFlowSnapshot(): DemoFlowSnapshot {
  return snapshot;
}

function getSnapshot(): DemoFlowSnapshot {
  return snapshot;
}

function getServerSnapshot(): DemoFlowSnapshot {
  return snapshot;
}

function setSnapshot(patch: Partial<DemoFlowSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
  progressCancel?.();
  progressCancel = null;
}

function setProgress(target: number, duration = 520) {
  progressCancel?.();
  const from = snapshot.progress;
  if (duration <= 0 || prefersReducedMotion()) {
    setSnapshot({ progress: target });
    return;
  }
  progressCancel = tweenNumber(from, target, duration, (v) => setSnapshot({ progress: v }));
}

export function run() {
  if (typeof window === 'undefined') return;

  const id = ++runId;
  clearTimers();

  const reduced = prefersReducedMotion();
  const initialDelay = reduced ? 0 : 200;
  const stepDelay = reduced ? 0 : 560;
  const total = STEPS.length;

  setSnapshot({ phase: 'running', currentStep: -1 });
  setProgress(0, 0);

  for (let i = 0; i <= total; i++) {
    const at = initialDelay + i * stepDelay;
    timers.push(
      window.setTimeout(() => {
        if (id !== runId) return;
        setSnapshot({ currentStep: i });
        setProgress(i / total);
      }, at),
    );
  }

  timers.push(
    window.setTimeout(
      () => {
        if (id !== runId) return;
        setSnapshot({ phase: 'done' });
      },
      initialDelay + total * stepDelay + 240,
    ),
  );
}

export function reset() {
  clearTimers();
  ++runId;
  setSnapshot({ currentStep: -1, phase: 'idle' });
  setProgress(0, 0);
}

export function disableHomepageDemoAutoplay() {
  setSnapshot({ homepageDemoAutoplayDisabled: true });
}

export function bumpHomepageDemoTimers() {
  setSnapshot({ homepageDemoTimerGeneration: snapshot.homepageDemoTimerGeneration + 1 });
}

export function scrollToId(id: string, offset = 72) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

export function replayDemo() {
  disableHomepageDemoAutoplay();
  bumpHomepageDemoTimers();
  reset();
  scrollToId('demo');
  if (typeof window === 'undefined') return;
  window.setTimeout(() => run(), 420);
}

export function useDemoFlow() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setFormState = useCallback((updater: FormState | ((prev: FormState) => FormState)) => {
    const next = typeof updater === 'function' ? updater(snapshot.formState) : updater;
    setSnapshot({ formState: next });
  }, []);

  const updateFormState = useCallback((patch: Partial<FormState>) => {
    setSnapshot({ formState: { ...snapshot.formState, ...patch } });
  }, []);

  return {
    ...state,
    setFormState,
    updateFormState,
    run: useCallback(() => run(), []),
    reset: useCallback(() => reset(), []),
    disableHomepageDemoAutoplay: useCallback(() => disableHomepageDemoAutoplay(), []),
    bumpHomepageDemoTimers: useCallback(() => bumpHomepageDemoTimers(), []),
    replayDemo: useCallback(() => replayDemo(), []),
  };
}

export function useDemoPhase(): Phase {
  return useDemoFlow().phase;
}
