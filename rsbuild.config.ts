import path from 'node:path';
import { defineConfig } from '@rsbuild/core';

const dirName = path.basename(process.cwd());
export default defineConfig({
  source: {
    entry: {
      index: './shell/main.ts',
    },
    alias: {
      '@core': './core',
      '@bridge': './bridge',
      '@components': './components',
      '@shell': './shell',
      '@utils': './utils',
    },
    define: {
      __DIRNAME__: JSON.stringify(dirName),
    },
  },
  html: {
    template: './public/index.html',
    title: dirName,
  },
});
