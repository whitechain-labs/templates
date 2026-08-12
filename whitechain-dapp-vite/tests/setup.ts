// Registers @testing-library/jest-dom matchers (e.g. toBeInTheDocument) on
// Vitest's `expect` and augments its types project-wide.
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount React trees between tests so the jsdom document stays isolated
// (auto-cleanup needs `globals: true`, which this config does not enable).
afterEach(() => {
  cleanup();
});
