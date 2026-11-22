import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from '@playwright/test';
import { THEME_IDS } from '../../src/shared/types';
import { DEFAULT_SETTINGS } from '../../src/shared/settings';
import { launchApp } from './helpers';

// Manual visual check: SCREENSHOTS_DIR=/some/dir npx playwright test screenshots
const dir = process.env.SCREENSHOTS_DIR;

for (const themeId of THEME_IDS) {
  test(`screenshot ${themeId}`, async () => {
    test.skip(!dir, 'set SCREENSHOTS_DIR to take screenshots');
    const { mkdtempSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const userData = mkdtempSync(join(tmpdir(), 'forty-shot-'));
    writeFileSync(join(userData, 'settings.json'), JSON.stringify({ ...DEFAULT_SETTINGS, themeId }));
    const { app, page } = await launchApp({ FORTY_USER_DATA: userData });
    await page.getByTestId('editor').locator('.view-lines').waitFor();
    await page.getByTestId('terminal').click();
    await page.keyboard.type('ls -la');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(dir!, `forty-${themeId}.png`) });
    await app.close();
  });
}
