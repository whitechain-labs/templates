import { expect, test } from '@playwright/test';

// Example e2e test. Loads the home page and asserts the dapp scaffold renders:
// the header plus the Wallet and Storage cards. The wallet connect flow itself
// needs a real wallet + Reown project id, so it's out of scope for a headless
// run — assert the surface that renders without one.
test('home page renders the dapp scaffold', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Whitechain dApp', level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Wallet', level: 2 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Storage contract', level: 2 })).toBeVisible();

  // With no wallet connected, the wallet panel shows its disconnected hint.
  await expect(page.getByText('No wallet connected yet.')).toBeVisible();
});
