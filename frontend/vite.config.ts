import path from 'node:path';
import os from 'node:os';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const viteCacheDir = path.join(os.homedir(), '.cache', 'geoscore-vite');

export default defineConfig({
  cacheDir: viteCacheDir,
  plugins: [react()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, './src/lib'),
    },
  },
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
