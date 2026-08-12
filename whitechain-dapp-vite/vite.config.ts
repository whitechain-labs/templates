import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';

// Vite 7 SPA. The router plugin generates `src/routeTree.gen.ts` from the
// file-based routes in `src/routes` (must come BEFORE the react plugin).
export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // Only the always-loaded framework libs get a manual chunk. Do NOT force
    // @reown/wagmi into one: that eagerly bundles AppKit's lazy features (swaps,
    // onramp, socials) and grows the initial load. The web3 chunk is legitimately
    // large for a wallet dapp, so raise the advisory warning above it.
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(moduleId) {
          if (
            moduleId.includes('node_modules/react') ||
            moduleId.includes('node_modules/scheduler') ||
            moduleId.includes('@tanstack')
          ) {
            return 'framework';
          }
          return undefined;
        },
      },
    },
  },
});
