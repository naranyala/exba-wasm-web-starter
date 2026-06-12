import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@bridge': path.resolve(__dirname, './src/bridge'),
      '@components': path.resolve(__dirname, './src/components'),
      '@shell': path.resolve(__dirname, './src/shell'),
      '@utils': path.resolve(__dirname, './src/utils'),
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
