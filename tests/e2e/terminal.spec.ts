import { expect, test, type Page } from '@playwright/test';
import { launchApp } from './helpers';

async function run(page: Page, command: string) {
  await page.getByTestId('terminal').click();
  await page.keyboard.type(command);
  await page.keyboard.press('Enter');
}

const termText = (page: Page) => page.getByTestId('terminal').locator('.xterm-rows').innerText();

async function columns(page: Page, tag: string): Promise<number> {
  await run(page, `echo ${tag}=$COLUMNS`);
  const re = new RegExp(`${tag}=(\\d+)`);
  await expect.poll(async () => re.test(await termText(page)), { timeout: 5000 }).toBe(true);
  return Number((await termText(page)).match(re)![1]);
}

test('runs commands in a real shell', async () => {
  const { app, page } = await launchApp();
  await run(page, 'echo forty-ok');
  await expect(page.getByTestId('terminal').getByText('forty-ok', { exact: false }).last()).toBeVisible({ timeout: 5000 });
  await app.close();
});

test('offers to restart after exit', async () => {
  const { app, page } = await launchApp();
  await run(page, 'exit');
  await expect(page.getByText("Le terminal s'est fermé")).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Relancer' }).click();
  await run(page, 'echo encore');
  await expect.poll(async () => (await termText(page)).includes('encore\n') || /\nencore/.test(await termText(page)), { timeout: 5000 }).toBe(true);
  await app.close();
});

test('reflows when the window is resized', async () => {
  const { app, page } = await launchApp();
  const before = await columns(page, 'avant');
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1000, 700));
  await expect.poll(() => columns(page, `apres${Date.now() % 1000}`), { timeout: 8000 }).not.toBe(before);
  await app.close();
});
