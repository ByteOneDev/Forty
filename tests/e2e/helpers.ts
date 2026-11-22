import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test';

export async function launchApp(env: Record<string, string> = {}): Promise<{
  app: ElectronApplication; page: Page; home: string; userData: string;
}> {
  const home = env.FORTY_HOME ?? mkdtempSync(join(tmpdir(), 'forty-home-'));
  const userData = env.FORTY_USER_DATA ?? mkdtempSync(join(tmpdir(), 'forty-data-'));
  const app = await electron.launch({
    args: [join(process.cwd(), 'out/main/index.js')],
    env: { ...process.env, ...env, FORTY_HOME: home, FORTY_USER_DATA: userData } as Record<string, string>,
  });
  const page = await app.firstWindow();
  await page.waitForLoadState('domcontentloaded');
  return { app, page, home, userData };
}
