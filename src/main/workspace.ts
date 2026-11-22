import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';

const OUTSIDE = 'Chemin hors de ~/Forty';
const BROUILLON = '#!/bin/sh\necho "Bonjour Forty !"\n';

/** Resolves `rel` inside `root`; throws if it points outside (or at the root itself). */
export function resolveInWorkspace(root: string, rel: string): string {
  if (!rel || isAbsolute(rel)) throw new Error(OUTSIDE);
  const full = resolve(root, rel);
  const back = relative(resolve(root), full);
  if (!back || back.startsWith('..') || isAbsolute(back)) throw new Error(OUTSIDE);
  return full;
}

export async function ensureWorkspace(root: string): Promise<void> {
  await mkdir(root, { recursive: true });
  const file = join(root, 'brouillon.sh');
  try {
    await access(file);
  } catch {
    await writeFile(file, BROUILLON, 'utf8');
  }
}

export async function readText(root: string, rel: string): Promise<string | null> {
  const file = resolveInWorkspace(root, rel);
  try {
    return await readFile(file, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

export async function writeText(root: string, rel: string, content: string): Promise<void> {
  const file = resolveInWorkspace(root, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}
