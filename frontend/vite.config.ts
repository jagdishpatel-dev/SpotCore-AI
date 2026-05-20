import path from 'node:path';
import os from 'node:os';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Outside the repo so iCloud never duplicates Vite's pre-bundle cache (deps 2, etc.)
const viteCacheDir = path.join(os.homedir(), '.cache', 'geoscore-vite');

export default defineConfig({
  cacheDir: viteCacheDir,
  plugins: [sveltekit()],
  server: {
    port: 5173,
    allowedHosts: ['jagdishpatel.tech'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
