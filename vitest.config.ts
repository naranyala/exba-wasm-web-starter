import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './core'),
      '@bridge': path.resolve(__dirname, './bridge'),
      '@components': path.resolve(__dirname, './components'),
      '@shell': path.resolve(__dirname, './shell'),
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    exclude: [
      '**/node_modules/**',
      '**/archive/**',
      '**/src-alt/**',
      '**/dist/**',
    ],
  },
});
