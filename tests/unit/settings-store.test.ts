import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '@shared/settings';
import { loadSettings, saveSettings } from '../../src/main/settings-store';

const tempFile = () => join(mkdtempSync(join(tmpdir(), 'forty-settings-')), 'settings.json');

describe('settings store', () => {
  it('returns the defaults when the file is missing', async () => {
    expect(await loadSettings(tempFile())).toEqual(DEFAULT_SETTINGS);
  });

  it('returns the defaults when the file is not valid JSON', async () => {
    const file = tempFile();
    writeFileSync(file, '{not json');
    await expect(loadSettings(file)).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips saved settings', async () => {
    const file = tempFile();
    const s = { ...DEFAULT_SETTINGS, themeId: 'foret' as const };
    await saveSettings(file, s);
    expect(await loadSettings(file)).toEqual(s);
  });
});
