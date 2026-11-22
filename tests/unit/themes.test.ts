import { describe, expect, it } from 'vitest';
import { THEME_IDS } from '@shared/types';
import { THEMES, getTheme } from '../../src/renderer/theme/themes';
import { contrastRatio } from '../../src/renderer/theme/contrast';
import { themeCssVars, toMonacoTheme, toXtermTheme } from '../../src/renderer/theme/adapters';

describe('themes', () => {
  it('has 3 dark and 3 light themes with the expected ids', () => {
    expect(THEMES).toHaveLength(6);
    expect(THEMES.filter((t) => t.kind === 'dark')).toHaveLength(3);
    expect(THEMES.filter((t) => t.kind === 'light')).toHaveLength(3);
    expect(THEMES.map((t) => t.id).sort()).toEqual([...THEME_IDS].sort());
  });

  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  for (const t of THEMES) {
    it(`${t.id}: text and muted text reach AA on every background`, () => {
      for (const fg of [t.colors.text, t.colors.textMuted]) {
        for (const bg of [t.colors.bg, t.colors.surface, t.colors.surfaceAlt]) {
          expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
    it(`${t.id}: onAccent reaches AA on accent`, () => {
      expect(contrastRatio(t.colors.onAccent, t.colors.accent)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('exposes colors as CSS variables', () => {
    const sable = getTheme('sable');
    expect(themeCssVars(sable)['--bg']).toBe(sable.colors.bg);
    expect(themeCssVars(sable)['--surface-alt']).toBe(sable.colors.surfaceAlt);
    expect(themeCssVars(sable)['--on-accent']).toBe(sable.colors.onAccent);
  });

  it('maps theme colors to Monaco and xterm', () => {
    const t = getTheme('minuit');
    const m = toMonacoTheme(t);
    expect(m.base).toBe('vs-dark');
    expect(m.rules.find((r) => r.token === 'keyword')?.foreground).toBe(t.colors.accent.slice(1));
    expect(m.colors['editor.background']).toBe(t.colors.surface);
    expect(toMonacoTheme(getTheme('sable')).base).toBe('vs');
    const x = toXtermTheme(t);
    expect(x.background).toBe(t.colors.surface);
    expect(x.cursor).toBe(t.colors.accent);
    expect(x.red).toBe(t.colors.danger);
  });
});
