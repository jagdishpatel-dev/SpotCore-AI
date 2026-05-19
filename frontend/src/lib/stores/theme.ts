import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'geoscore-theme';

function readInitial(): Theme {
  if (!browser) return 'dark';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* ignore */
  }
  return 'light';
}

function applyToDom(value: Theme) {
  if (!browser) return;
  const root = document.documentElement;
  root.classList.toggle('dark', value === 'dark');
  root.classList.toggle('light', value === 'light');
  root.style.colorScheme = value;
}

const internal = writable<Theme>(readInitial());

if (browser) {
  internal.subscribe((value) => {
    applyToDom(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  });
}

export const theme = {
  subscribe: internal.subscribe,
  set: (value: Theme) => internal.set(value),
  toggle: () =>
    internal.update((current) => (current === 'dark' ? 'light' : 'dark')),
};
