import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ensureWorkspace, readText, resolveInWorkspace, writeText } from '../../src/main/workspace';

const tempRoot = () => mkdtempSync(join(tmpdir(), 'forty-ws-'));

describe('workspace', () => {
  it('resolves paths inside the root', () => {
    const root = tempRoot();
    expect(resolveInWorkspace(root, 'a/b.sh')).toBe(join(root, 'a/b.sh'));
  });

  it.each(['../x', '/etc/passwd', 'a/../../x', ''])('rejects %j', (rel) => {
    expect(() => resolveInWorkspace(tempRoot(), rel)).toThrow('Chemin hors de ~/Forty');
  });

  it('creates brouillon.sh once and never overwrites it', async () => {
    const root = join(tempRoot(), 'Forty');
    await ensureWorkspace(root);
    expect(readFileSync(join(root, 'brouillon.sh'), 'utf8')).toBe('#!/bin/sh\necho "Bonjour Forty !"\n');
    writeFileSync(join(root, 'brouillon.sh'), 'edited');
    await ensureWorkspace(root);
    expect(readFileSync(join(root, 'brouillon.sh'), 'utf8')).toBe('edited');
  });

  it('reads null for missing files and round-trips written text', async () => {
    const root = tempRoot();
    expect(await readText(root, 'missing.txt')).toBeNull();
    await writeText(root, 'd/e.txt', 'hi');
    expect(await readText(root, 'd/e.txt')).toBe('hi');
  });

  it('refuses to write outside the root', async () => {
    await expect(writeText(tempRoot(), '../evil.txt', 'x')).rejects.toThrow('Chemin hors de ~/Forty');
  });
});
