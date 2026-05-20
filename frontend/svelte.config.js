import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: false,
  },
  kit: {
    adapter: adapter(),
  },
  vitePlugin: {
    /** @threlte/core v8 is authored with runes; app components stay legacy. */
    dynamicCompileOptions({ filename }) {
      if (filename.includes('node_modules/@threlte')) {
        return { runes: true };
      }
      if (filename.includes('/chrome/FluidGlass')) {
        return { runes: true };
      }
    },
  },
};

export default config;
