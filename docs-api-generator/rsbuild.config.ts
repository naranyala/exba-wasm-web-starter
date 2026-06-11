import { defineConfig } from '@rsbuild/core';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';
import path from 'node:path';

export default defineConfig({
  plugins: [pluginTypeCheck()],
  source: {
    entry: {
      index: './ui/src/index.ts',
    },
  },
  html: {
    template: './ui/index.html',
  },
  output: {
    distPath: {
      root: '../docs',
    },
    cleanDistPath: true,
  },
  server: {
    publicDir: [
      {
        name: 'ui/public',
      },
    ],
  },
});
