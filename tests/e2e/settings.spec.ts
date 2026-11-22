import { expect, test, type Page } from '@playwright/test';
import { launchApp } from './helpers';

const cssVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

test('changes theme, font and size live, and keeps them after restart', async () => {
  const first = await launchApp();
  const page = first.page;
  await page.getByRole('button', { name: 'Réglages' }).click();
  const dialog = page.getByRole('dialog', { name: 'Réglages' });
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Sable' }).click();
  await expect(dialog.getByRole('button', { name: 'Sable' })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => cssVar(page, '--bg')).toBe('#f5efe3');

  await dialog.getByRole('button', { name: 'Lexend' }).click();
  await expect.poll(() => cssVar(page, '--ui-font')).toContain('Lexend');

  await dialog.getByLabel('Taille du texte').fill('18');
  await expect.poll(() => cssVar(page, '--font-size')).toBe('18px');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await page.waitForTimeout(500); // let the debounced save land
  await first.app.close();

  const second = await launchApp({ FORTY_HOME: first.home, FORTY_USER_DATA: first.userData });
  await expect.poll(() => cssVar(second.page, '--bg')).toBe('#f5efe3');
  await expect.poll(() => cssVar(second.page, '--font-size')).toBe('18px');
  await second.app.close();
});

test('closes with the Fermer button', async () => {
  const { app, page } = await launchApp();
  await page.getByRole('button', { name: 'Réglages' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByRole('dialog', { name: 'Réglages' })).toBeHidden();
  await app.close();
});

test('keeps keyboard focus on a slider while adjusting it', async () => {
  const { app, page } = await launchApp();
  await page.getByRole('button', { name: 'Réglages' }).click();
  const slider = page.getByLabel('Taille du texte');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => cssVar(page, '--font-size')).toBe('17px');
  await expect(slider).toBeFocused();
  await app.close();
});
