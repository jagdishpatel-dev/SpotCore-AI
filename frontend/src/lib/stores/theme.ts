import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light';

const STORAGE_KEY = 'geoscore-theme';

function applyToDom() {
  if (!browser) return;
  const root = document.documentElement;
  root.classList.add('light');
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
}

const internal = writable<Theme>('light');

if (browser) {
  applyToDom();
  internal.subscribe(() => {
    applyToDom();
    try {
      window.localStorage.setItem(STORAGE_KEY, 'light');
    } catch {
      /* ignore */
    }
  });
}

/** Light-only theme store (dark mode disabled). */
export const theme = {
  subscribe: internal.subscribe,
  set: () => internal.set('light'),
  toggle: () => internal.set('light'),
};
