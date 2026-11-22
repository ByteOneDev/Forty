import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings } from '@shared/settings';

describe('normalizeSettings', () => {
  it('returns the defaults for undefined', () => {
    expect(normalizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid fields, clamps numbers and replaces unknown ids', () => {
    const s = normalizeSettings({ themeId: 'sable', fontSize: 99, uiFont: 'comic' });
    expect(s.themeId).toBe('sable');
    expect(s.fontSize).toBe(24);
    expect(s.uiFont).toBe('inter');
  });

  it('replaces out-of-range and non-numeric values', () => {
    const s = normalizeSettings({ letterSpacing: -1, lineHeight: 'x' });
    expect(s.letterSpacing).toBe(0);
    expect(s.lineHeight).toBe(1.6);
  });

  it('uses the documented defaults', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      version: 1, themeId: 'minuit', uiFont: 'inter', codeFont: 'jetbrains-mono',
      fontSize: 15, letterSpacing: 0, lineHeight: 1.6,
    });
  });
});
