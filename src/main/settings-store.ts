import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { normalizeSettings } from '@shared/settings';
import type { Settings } from '@shared/types';

export async function loadSettings(file: string): Promise<Settings> {
  try {
    return normalizeSettings(JSON.parse(await readFile(file, 'utf8')));
  } catch {
    return normalizeSettings(undefined);
  }
}

export async function saveSettings(file: string, s: Settings): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(normalizeSettings(s), null, 2), 'utf8');
  await rename(tmp, file);
}
