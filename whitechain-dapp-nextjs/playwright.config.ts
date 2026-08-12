import { defineConfig, devices } from '@playwright/test';

// e2e config. Spawns `pnpm dev` on :3000 and waits on /api/healthz before
// running the specs. Set PLAYWRIGHT_BASE_URL to point at an already-running
// server instead of spawning one.
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000/api/healthz',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
