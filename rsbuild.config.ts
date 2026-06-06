import { defineConfig } from '@rsbuild/core';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  source: {
    entry: {
      index: './src/main.ts',
    },
  },
});
