import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { launchApp } from './helpers';

test('shows the main screen panels', async () => {
  const { app, page } = await launchApp();
  await expect(page.getByText("Ta mission s'affichera ici.")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Réglages' })).toBeVisible();
  await expect(page.getByTestId('terminal')).toBeVisible();
  await app.close();
});

test('opens brouillon.sh and saves it with Cmd+S', async () => {
  const { app, page, home } = await launchApp();
  const editor = page.getByTestId('editor');
  await expect(editor.locator('.view-lines')).toContainText('Bonjour Forty', { timeout: 10000 });
  await editor.locator('.view-lines').click();
  await page.keyboard.press('Meta+ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('echo test-save');
  await page.keyboard.press('Meta+s');
  await expect(page.getByText('Enregistré ✓')).toBeVisible();
  await expect.poll(() => readFileSync(join(home, 'brouillon.sh'), 'utf8')).toContain('echo test-save');
  await app.close();
});
