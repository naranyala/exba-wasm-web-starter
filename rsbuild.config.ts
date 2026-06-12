import path from 'node:path';
import { defineConfig } from '@rsbuild/core';

const dirName = path.basename(process.cwd());
export default defineConfig({
  source: {
    entry: {
      index: './src/shell/main.ts',
    },
    alias: {
      '@core': './src/core',
      '@bridge': './src/bridge',
      '@components': './src/components',
      '@shell': './src/shell',
      '@utils': './src/utils',
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
