import path from 'node:path';
import { defineConfig } from '@rsbuild/core';

const dirName = path.basename(process.cwd());

export default defineConfig({
  source: {
    entry: {
      index: './src/main.ts',
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
