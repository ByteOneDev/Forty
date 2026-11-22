export type ThemeId = 'minuit' | 'graphite' | 'foret' | 'sable' | 'nuage' | 'lavande';
export type UiFontId = 'inter' | 'lexend' | 'atkinson' | 'opendyslexic';
export type CodeFontId = 'jetbrains-mono' | 'fira-code' | 'atkinson-mono';

export const THEME_IDS: readonly ThemeId[] = ['minuit', 'graphite', 'foret', 'sable', 'nuage', 'lavande'];
export const UI_FONT_IDS: readonly UiFontId[] = ['inter', 'lexend', 'atkinson', 'opendyslexic'];
export const CODE_FONT_IDS: readonly CodeFontId[] = ['jetbrains-mono', 'fira-code', 'atkinson-mono'];

export interface Settings {
  version: 1;
  themeId: ThemeId;
  uiFont: UiFontId;
  codeFont: CodeFontId;
  /** px, 12–24 */
  fontSize: number;
  /** em, 0–0.2 */
  letterSpacing: number;
  /** 1.2–2.2 */
  lineHeight: number;
}

export interface FortyApi {
  settings: { load(): Promise<Settings>; save(s: Settings): Promise<void> };
  fs: {
    readText(rel: string): Promise<string | null>;
    writeText(rel: string, content: string): Promise<void>;
  };
  pty: {
    spawn(): Promise<string>;
    write(id: string, data: string): void;
    resize(id: string, cols: number, rows: number): void;
    kill(id: string): void;
    onData(id: string, cb: (data: string) => void): () => void;
    onExit(id: string, cb: (code: number) => void): () => void;
  };
}

export const IPC = {
  settingsLoad: 'settings:load',
  settingsSave: 'settings:save',
  fsReadText: 'fs:readText',
  fsWriteText: 'fs:writeText',
  ptySpawn: 'pty:spawn',
  ptyWrite: 'pty:write',
  ptyResize: 'pty:resize',
  ptyKill: 'pty:kill',
  ptyData: (id: string) => `pty:data:${id}`,
  ptyExit: (id: string) => `pty:exit:${id}`,
} as const;
