import { expect, test } from '@playwright/test';
import { launchApp } from './helpers';

test('opens a window titled Forty', async () => {
  const { app, page } = await launchApp();
  expect(await page.title()).toBe('Forty');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await app.close();
});
