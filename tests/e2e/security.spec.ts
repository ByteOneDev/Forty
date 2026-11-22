import { execSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { launchApp } from './helpers';

test('the main window cannot navigate away from Forty', async () => {
  const { app, page } = await launchApp();
  await page.getByTestId('app-root').waitFor();
  const before = page.url();
  await page.evaluate(() => { window.location.href = 'https://example.com/'; });
  await page.waitForTimeout(1000);
  // Ask the main process: Playwright itself keeps waiting for the (cancelled) navigation.
  const state = await app.evaluate(async ({ BrowserWindow }) => {
    const wc = BrowserWindow.getAllWindows()[0].webContents;
    return {
      url: wc.getURL(),
      hasRoot: await wc.executeJavaScript('!!document.querySelector(\'[data-testid="app-root"]\')'),
    };
  });
  expect(state.url).toBe(before);
  expect(state.hasRoot).toBe(true);
  await app.close();
});

test('pages cannot open new Electron windows', async () => {
  const { app, page } = await launchApp();
  await page.evaluate(() => window.open('about:blank'));
  await page.waitForTimeout(1000);
  expect(app.windows()).toHaveLength(1);
  await app.close();
});

test('reloading the page does not leave old shells running', async () => {
  const { app, page } = await launchApp();
  const pid = await app.evaluate(() => process.pid);
  const shells = () => {
    const rows = execSync('ps -A -o ppid=,comm=').toString().trim().split('\n');
    return rows.filter((r) => {
      const [ppid, comm] = r.trim().split(/\s+/, 2);
      return Number(ppid) === pid && /(^|\/)-?(zsh|bash|sh|fish)$/.test(comm);
    }).length;
  };
  await expect.poll(shells, { timeout: 5000 }).toBe(1);
  await page.reload();
  await page.getByTestId('terminal').waitFor();
  await page.waitForTimeout(1500);
  expect(shells()).toBe(1);
  await app.close();
});
