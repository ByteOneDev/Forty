import { CODE_FONT_IDS, THEME_IDS, UI_FONT_IDS, type Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  themeId: 'minuit',
  uiFont: 'inter',
  codeFont: 'jetbrains-mono',
  fontSize: 15,
  letterSpacing: 0,
  lineHeight: 1.6,
};

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

/** Turns anything (old file, broken file, partial object) into valid settings. */
export function normalizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    version: 1,
    themeId: pick(r.themeId, THEME_IDS, d.themeId),
    uiFont: pick(r.uiFont, UI_FONT_IDS, d.uiFont),
    codeFont: pick(r.codeFont, CODE_FONT_IDS, d.codeFont),
    fontSize: clamp(r.fontSize, 12, 24, d.fontSize),
    letterSpacing: clamp(r.letterSpacing, 0, 0.2, d.letterSpacing),
    lineHeight: clamp(r.lineHeight, 1.2, 2.2, d.lineHeight),
  };
}
