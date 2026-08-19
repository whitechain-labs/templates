import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Unit tests only. Everything worth asserting in these examples is a pure
// function (formatting, envelope normalization), so no DOM environment is
// needed and the dependency list stays short.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
