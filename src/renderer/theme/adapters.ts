import type { editor } from 'monaco-editor';
import type { ITheme } from '@xterm/xterm';
import type { Theme, ThemeColors } from './themes';

const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export function themeCssVars(t: Theme): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(t.colors) as (keyof ThemeColors)[]).map((k) => [`--${kebab(k)}`, t.colors[k]]),
  );
}

const noHash = (c: string) => c.slice(1);

export function toMonacoTheme(t: Theme): editor.IStandaloneThemeData {
  const c = t.colors;
  return {
    base: t.kind === 'dark' ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [
      { token: '', foreground: noHash(c.text) },
      { token: 'keyword', foreground: noHash(c.accent) },
      { token: 'string', foreground: noHash(c.success) },
      { token: 'number', foreground: noHash(c.warning) },
      { token: 'function', foreground: noHash(c.info) },
      { token: 'type', foreground: noHash(c.accent2) },
      { token: 'comment', foreground: noHash(c.textMuted), fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': c.surface,
      'editor.foreground': c.text,
      'editor.lineHighlightBackground': c.surfaceAlt,
      'editor.selectionBackground': `${c.accent}55`,
      'editorCursor.foreground': c.accent,
      'editorLineNumber.foreground': c.textMuted,
      'editorLineNumber.activeForeground': c.text,
      'editorGutter.background': c.surface,
      'editorWidget.background': c.surfaceAlt,
      'editorWidget.border': c.border,
    },
  };
}

export function toXtermTheme(t: Theme): ITheme {
  const c = t.colors;
  return {
    background: c.surface,
    foreground: c.text,
    cursor: c.accent,
    cursorAccent: c.surface,
    selectionBackground: `${c.accent}55`,
    red: c.danger, brightRed: c.danger,
    green: c.success, brightGreen: c.success,
    yellow: c.warning, brightYellow: c.warning,
    blue: c.info, brightBlue: c.info,
    magenta: c.accent, brightMagenta: c.accent,
    cyan: c.accent2, brightCyan: c.accent2,
  };
}
