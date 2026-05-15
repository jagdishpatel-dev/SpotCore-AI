/**
 * demoFlow — shared state machine for the homepage interactive demo panel.
 *
 * `InteractiveDemoPanel` subscribes so input → loading → results stay in one
 * surface: user or autoplay calls `run()`, steps advance while `running`,
 * then `done` reveals results.
 *
 * The flow is simulated (no backend); timings mirror the real pipeline.
 */

import { writable } from 'svelte/store';
import { tweened, type Tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { prefersReducedMotion } from '$lib/actions/reveal';

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

/** Example address shown as a typing placeholder and in autoplay when the field is empty. */
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

export const formState = writable<FormState>({
  address: '',
  concept: 'Coffee shop',
  radius: '5 min drive',
  profile: 'Young professionals',
});

/** After the user interacts with the homepage demo, disable idle autoplay loops. */
export const homepageDemoAutoplayDisabled = writable(false);

export function disableHomepageDemoAutoplay() {
  homepageDemoAutoplayDisabled.set(true);
}

export const phase = writable<Phase>('idle');
/** -1 = no step yet, otherwise index of the most-recently-completed step */
export const currentStep = writable<number>(-1);

/** 0..1 progress of the analysis pipeline */
export const progress: Tweened<number> = tweened(0, {
  duration: 520,
  easing: cubicOut,
});

let runId = 0;
let timers: number[] = [];

function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
}

/**
 * Start a simulated run. Calling `run()` while one is already in flight
 * cancels the previous one cleanly via the `runId` token.
 *
 * Timeline (default):
 *   t=0      phase → 'running'
 *   t=200    step 0 starts (active),       progress = 0/6
 *   t=760    step 0 done,  step 1 active,  progress = 1/6
 *   t=1320   step 1 done,  step 2 active,  progress = 2/6
 *   …
 *   t=3560   final step done,              progress = 6/6
 *   t=3800   phase → 'done'
 */
export function run() {
  if (typeof window === 'undefined') return;

  const id = ++runId;
  clearTimers();

  const reduced = prefersReducedMotion();
  const initialDelay = reduced ? 0 : 200;
  const stepDelay = reduced ? 0 : 560;
  const total = STEPS.length;

  phase.set('running');
  currentStep.set(-1);
  progress.set(0, { duration: 0 });

  // Schedule step transitions: i = 0..total. Setting currentStep = i means
  // "step i is starting; steps 0..i-1 are done". progress mirrors completion.
  for (let i = 0; i <= total; i++) {
    const at = initialDelay + i * stepDelay;
    timers.push(
      window.setTimeout(() => {
        if (id !== runId) return;
        currentStep.set(i);
        progress.set(i / total);
      }, at)
    );
  }

  timers.push(
    window.setTimeout(
      () => {
        if (id !== runId) return;
        phase.set('done');
      },
      initialDelay + total * stepDelay + 240
    )
  );
}

/** Reset back to the idle state (cancels any in-flight run). */
export function reset() {
  clearTimers();
  ++runId;
  currentStep.set(-1);
  progress.set(0, { duration: 0 });
  phase.set('idle');
}

/**
 * Smoothly scroll the page to an element by id, accounting for the sticky
 * AppChrome height. No-op on the server.
 */
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

/** Lets `InteractiveDemoPanel` cancel idle/hold timers (e.g. before replay). */
export const homepageDemoTimerGeneration = writable(0);

export function bumpHomepageDemoTimers() {
  homepageDemoTimerGeneration.update((n) => n + 1);
}

/** Scroll to the homepage demo and restart the simulated pipeline. */
export function replayDemo() {
  disableHomepageDemoAutoplay();
  bumpHomepageDemoTimers();
  reset();
  scrollToId('demo');
  if (typeof window === 'undefined') return;
  window.setTimeout(() => run(), 420);
}
