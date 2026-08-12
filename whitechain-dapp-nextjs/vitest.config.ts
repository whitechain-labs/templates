import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit/component test runner. Pairs with Playwright (e2e); see playwright.config.ts.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      // The unit-testable surface: modules that carry logic. The 80% floor keeps
      // that honest; wire it into your own CI if you want it enforced.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Rendering, wiring, and config singletons: covered by Playwright e2e or
        // too trivial to unit-test.
        'src/app/**',
        'src/components/**',
        'src/lib/cn.ts',
        'src/lib/wagmi.ts',
        'src/lib/wallet.ts',
        'src/lib/storage.ts',
        'src/empty-module.ts',
        // Test files.
        'src/**/*.test.{ts,tsx}',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
