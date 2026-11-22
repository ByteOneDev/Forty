import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS } from '@shared/settings';
import type { Settings } from '@shared/types';
import { getTheme } from '../theme/themes';
import { themeCssVars } from '../theme/adapters';
import { codeFontFamily, uiFontFamily } from '../fonts/fonts';

interface SettingsApi {
  settings: Settings;
  update(patch: Partial<Settings>): void;
}

const SettingsContext = createContext<SettingsApi | null>(null);

function applyToDocument(s: Settings): void {
  const root = document.documentElement;
  const theme = getTheme(s.themeId);
  const vars: Record<string, string> = {
    ...themeCssVars(theme),
    '--ui-font': uiFontFamily(s.uiFont),
    '--code-font': codeFontFamily(s.codeFont),
    '--font-size': `${s.fontSize}px`,
    '--letter-spacing': `${s.letterSpacing}em`,
    '--line-height': String(s.lineHeight),
  };
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  root.dataset.themeKind = theme.kind;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const latest = useRef(settings);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    window.forty.settings.load().then((s) => {
      if (!alive) return;
      latest.current = s;
      setSettings(s);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => applyToDocument(settings), [settings]);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    applyToDocument(next);
    setSettings(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void window.forty.settings.save(latest.current), 300);
  }, []);

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsApi {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
