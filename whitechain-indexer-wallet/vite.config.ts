import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite 7 SPA. There is no server component: every request goes straight from the
// browser to the public Whitechain Blockscout API, so there are no secrets to
// hide and the build is a static bundle you can host anywhere.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
