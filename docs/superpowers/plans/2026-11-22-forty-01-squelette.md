# Forty — Plan 1 : le squelette — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A macOS Electron app called Forty that opens a JetBrains-style, airy window with a real Monaco editor, a real terminal (xterm.js + node-pty), 6 themes and font/spacing settings that persist.

**Architecture:** electron-vite project with three processes: `main` (window, settings file, workspace files, PTY), `preload` (a typed `window.forty` API via `contextBridge`), `renderer` (React UI). Pure logic (settings normalization, themes, path safety, PTY bookkeeping) lives in small modules tested with Vitest; the wiring is checked by Playwright driving the real Electron app.

**Tech Stack:** Electron 45, electron-vite 6, Vite 8, React 19, TypeScript, monaco-editor 0.57 + @monaco-editor/react 4.7, @xterm/xterm 6 + @xterm/addon-fit, node-pty 1.1 (+ @electron/rebuild), Vitest 5, @testing-library/react, Playwright 1.65 (`_electron`), @fontsource fonts.

**Spec:** `docs/superpowers/specs/2026-11-22-forty-ide-design.md` (this plan implements section 11 step 1: sections 3, 9, the font part of 7, and the main-screen layout sketch of 5).

This is plan 1 of 6. Later plans: 2 course engine + Vérifier + Moulinette, 3 Shell 00 content, 4 AI tutor, 5 accessibility & focus, 6 remaining content.

## Global Constraints

- macOS only. App name and window title: `Forty`.
- UI copy is French, short sentences, no unexplained jargon (spec §2 anti-goals).
- Workspace root: `~/Forty` (override with env `FORTY_HOME`, used by tests). Created on first launch.
- Settings file: `<app.getPath('userData')>/settings.json` (override with env `FORTY_USER_DATA`, used by tests).
- Electron security: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; renderer never touches Node directly; CSP in `index.html`: `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; worker-src 'self' blob:; img-src 'self' data:`.
- Monaco must load locally (no CDN): `loader.config({ monaco })` with Vite `?worker` imports for the editor worker.
- Style (spec §9): UI font Inter, code font JetBrains Mono by default; radii 8–12 px; generous padding; panels separated by space, not lines.
- Every theme: `text` and `textMuted` reach WCAG AA (≥ 4.5:1) against `bg`, `surface` and `surfaceAlt`; `onAccent` reaches ≥ 4.5:1 against `accent`.
- Fonts (all OFL, via @fontsource): UI = `inter` | `lexend` | `atkinson` | `opendyslexic`; code = `jetbrains-mono` | `fira-code` | `atkinson-mono` (@fontsource/atkinson-hyperlegible-mono). OpenDyslexic has no mono variant on npm: OpenDyslexic Mono is deferred to plan 5 (requires downloading the font from its GitHub repo — ask the user first).
- Terminal shell: the user's `$SHELL`, falling back to `/bin/zsh`; cwd `~/Forty`.

## Review Focus

1. **Corrupted, missing or old `settings.json`** → the app opens with defaults (keeping any valid fields), never a blank window. Test in Task 2.
2. **User types `exit` in the terminal** → the pane shows « Le terminal s'est fermé » with a « Relancer » button that starts a new shell; no crash, no dead pane. Test in Task 5.
3. **Window resized** → terminal reflows to the new size (PTY gets the new cols/rows). Test in Task 5.
4. **A renderer request for a path outside `~/Forty`** (`../`, absolute path, symlink-free traversal) → rejected, nothing read or written. Test in Task 4.
5. **A theme with unreadable text** (low contrast) → caught by the AA test, not by the user's eyes. Test in Task 3.

---

## File Structure

```
package.json, electron.vite.config.ts, tsconfig.json, tsconfig.node.json, tsconfig.web.json
vitest.config.ts, playwright.config.ts, .gitignore
src/shared/
  types.ts            Settings, ThemeId, UiFontId, CodeFontId, FortyApi, IPC channel names
  settings.ts         DEFAULT_SETTINGS, normalizeSettings()
src/main/
  index.ts            app lifecycle, BrowserWindow, registers IPC
  paths.ts            workspaceRoot(), userDataDir()
  settings-store.ts   loadSettings(), saveSettings()
  workspace.ts        resolveInWorkspace(), ensureWorkspace(), readText(), writeText()
  pty-manager.ts      PtyManager (injectable spawn function)
  ipc.ts              registerIpc(win, deps)
src/preload/index.ts  exposes window.forty: FortyApi
src/renderer/
  index.html, main.tsx, App.tsx
  styles/global.css   design tokens (spacing, radii, font vars) + base styles
  theme/themes.ts     THEMES (6), getTheme()
  theme/contrast.ts   contrastRatio()
  theme/adapters.ts   themeCssVars(), toMonacoTheme(), toXtermTheme()
  fonts/fonts.ts      UI_FONTS, CODE_FONTS (id, label, css family), imports @fontsource css
  state/settings-context.tsx  SettingsProvider, useSettings()
  components/TopBar.tsx, Layout.tsx, MissionPanel.tsx, TutorPanel.tsx
  components/EditorPane.tsx, TerminalPane.tsx, SettingsDialog.tsx
tests/unit/*.test.ts(x)   Vitest
tests/e2e/*.spec.ts       Playwright + Electron
```

---

### Task 1: Project scaffold that opens a "Forty" window

**Files:**
- Create: `package.json`, `electron.vite.config.ts`, `tsconfig*.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/main/index.ts`, `src/main/paths.ts`, `src/preload/index.ts`, `src/renderer/index.html`, `src/renderer/main.tsx`, `src/renderer/App.tsx`
- Test: `tests/e2e/launch.spec.ts`, `tests/e2e/helpers.ts`

**Interfaces:**
- Produces: `workspaceRoot(): string` (`FORTY_HOME` or `~/Forty`), `userDataDir(): string` (`FORTY_USER_DATA` or `app.getPath('userData')`). npm scripts: `dev`, `build`, `test` (vitest run), `test:e2e` (build then playwright), `postinstall` (`electron-rebuild -f -w node-pty`), `typecheck`.
- Produces: `tests/e2e/helpers.ts` → `launchApp(env?: Record<string,string>): Promise<{ app: ElectronApplication; page: Page; home: string; userData: string }>` launching `out/main/index.js` with fresh temp `FORTY_HOME` and `FORTY_USER_DATA` unless given.

- [ ] **Step 1:** `git init`, scaffold electron-vite React + TS layout by hand (versions from the Tech Stack line), install deps, `.gitignore` with `node_modules`, `out`, `dist`, `test-results`.
- [ ] **Step 2: Write the failing test** `tests/e2e/launch.spec.ts`:

```ts
test('opens a window titled Forty', async () => {
  const { app, page } = await launchApp();
  expect(await page.title()).toBe('Forty');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await app.close();
});
```

- [ ] **Step 3:** Run `npm run test:e2e` → FAIL (no app yet).
- [ ] **Step 4:** Implement `src/main/index.ts` (window 1280×800, min 960×600, `titleBarStyle: 'hiddenInset'`, security flags from Global Constraints), minimal preload, `App.tsx` rendering `<div data-testid="app-root">`. CSP meta in `index.html`.
- [ ] **Step 5:** Run `npm run test:e2e` → PASS; `npm run typecheck` → no errors.
- [ ] **Step 6: Commit** `feat: scaffold Forty electron app`.

---

### Task 2: Settings model and persistence

**Files:**
- Create: `src/shared/types.ts`, `src/shared/settings.ts`, `src/main/settings-store.ts`
- Modify: `src/main/index.ts`, `src/preload/index.ts` (IPC `settings:load`, `settings:save`)
- Test: `tests/unit/settings.test.ts`, `tests/unit/settings-store.test.ts`

**Interfaces:**
- Produces in `types.ts`:

```ts
export type ThemeId = 'minuit' | 'graphite' | 'foret' | 'sable' | 'nuage' | 'lavande';
export type UiFontId = 'inter' | 'lexend' | 'atkinson' | 'opendyslexic';
export type CodeFontId = 'jetbrains-mono' | 'fira-code' | 'atkinson-mono';
export interface Settings {
  version: 1; themeId: ThemeId; uiFont: UiFontId; codeFont: CodeFontId;
  fontSize: number;      // px, 12–24, default 15
  letterSpacing: number; // em, 0–0.2, default 0
  lineHeight: number;    // 1.2–2.2, default 1.6
}
export interface FortyApi {
  settings: { load(): Promise<Settings>; save(s: Settings): Promise<void> };
  fs: { readText(rel: string): Promise<string | null>; writeText(rel: string, content: string): Promise<void> };
  pty: {
    spawn(): Promise<string>; write(id: string, data: string): void;
    resize(id: string, cols: number, rows: number): void; kill(id: string): void;
    onData(id: string, cb: (data: string) => void): () => void;
    onExit(id: string, cb: (code: number) => void): () => void;
  };
}
declare global { interface Window { forty: FortyApi } }
```
- Produces: `DEFAULT_SETTINGS: Settings` (`minuit`, `inter`, `jetbrains-mono`, 15, 0, 1.6); `normalizeSettings(raw: unknown): Settings`; `loadSettings(file: string): Promise<Settings>`; `saveSettings(file: string, s: Settings): Promise<void>` (write to `file.tmp` then rename).

- [ ] **Step 1: Write failing tests** in `tests/unit/settings.test.ts`:
  - `normalizeSettings(undefined)` equals `DEFAULT_SETTINGS`
  - `normalizeSettings({ themeId: 'sable', fontSize: 99, uiFont: 'comic' })` → `themeId 'sable'`, `fontSize 24`, `uiFont 'inter'`
  - `normalizeSettings({ letterSpacing: -1, lineHeight: 'x' })` → `letterSpacing 0`, `lineHeight 1.6`
  
  and in `tests/unit/settings-store.test.ts` (temp dir):
  - missing file → `DEFAULT_SETTINGS`
  - file containing `{not json` → `DEFAULT_SETTINGS`, and no throw
  - `saveSettings` then `loadSettings` round-trips `{...DEFAULT_SETTINGS, themeId: 'foret'}`
- [ ] **Step 2:** `npx vitest run tests/unit/settings*` → FAIL.
- [ ] **Step 3:** Implement the three functions (clamp numbers, unknown enum → default, non-numbers → default). Wire IPC `settings:load` / `settings:save` with file `join(userDataDir(), 'settings.json')`; expose via preload.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5: Commit** `feat: settings model with safe loading`.

---

### Task 3: The 6 themes

**Files:**
- Create: `src/renderer/theme/themes.ts`, `src/renderer/theme/contrast.ts`, `src/renderer/theme/adapters.ts`
- Test: `tests/unit/themes.test.ts`

**Interfaces:**
- Produces:

```ts
export interface ThemeColors { bg; surface; surfaceAlt; border; text; textMuted; accent; onAccent; accent2; info; success; warning; danger: string }
export interface Theme { id: ThemeId; name: string; kind: 'dark' | 'light'; colors: ThemeColors }
export const THEMES: Theme[]; export function getTheme(id: ThemeId): Theme;
export function contrastRatio(a: string, b: string): number; // WCAG 2.x, hex #rrggbb
export function themeCssVars(t: Theme): Record<string, string>; // '--bg', '--surface', … one per color key, kebab-case
export function toMonacoTheme(t: Theme): monaco.editor.IStandaloneThemeData;
export function toXtermTheme(t: Theme): ITheme;
```
- Syntax mapping (shared by all themes, used in `toMonacoTheme`): keyword→`accent`, string→`success`, number→`warning`, function→`info`, type→`accent2`, comment→`textMuted` (italic), default text→`text`. xterm: background `surface`, foreground `text`, cursor `accent`, ANSI red/green/yellow/blue/magenta/cyan from `danger/success/warning/info/accent/accent2`.

- [ ] **Step 1: Write failing tests:**
  - `THEMES` has 6 entries, 3 `dark` and 3 `light`, ids exactly the `ThemeId` union
  - `contrastRatio('#000000', '#ffffff')` ≈ 21 (±0.01), `contrastRatio('#777777', '#ffffff')` ≈ 4.48 (±0.01)
  - for every theme: `text` and `textMuted` ≥ 4.5 against `bg`, `surface`, `surfaceAlt`; `onAccent` ≥ 4.5 against `accent` (test name includes theme id so failures say which)
  - `themeCssVars(getTheme('sable'))['--bg'] === getTheme('sable').colors.bg`
- [ ] **Step 2:** `npx vitest run tests/unit/themes.test.ts` → FAIL.
- [ ] **Step 3:** Implement with these starting palettes (`bg, surface, surfaceAlt, border, text, textMuted, accent, onAccent, accent2, info, success, warning, danger`). If an AA test fails, move only the lightness of the failing color until it passes, keeping its hue.

| id / name / kind | colors |
|---|---|
| `minuit` Minuit dark | #15172a #1c1f36 #242844 #30355a #cdd3f5 #8f97c2 #a98bf5 #15172a #f2728f #78a6f5 #93d47a #e8b86d #f2728f |
| `graphite` Graphite dark | #1e1f22 #2b2d30 #34363b #43454a #dfe1e5 #a3a6ad #2a66d9 #ffffff #c77dbb #6fa8f0 #6aab73 #e0b44b #f75464 |
| `foret` Forêt dark | #121c18 #18251f #203029 #2c4036 #d6e6dc #93ad9f #5fd4a8 #121c18 #e9b35f #6fb3d9 #7fd17f #e9b35f #f07b6e |
| `sable` Sable light | #f5efe3 #fbf7ef #ede4d3 #ddd0b8 #3a342b #5f574a #2a74b5 #ffffff #b0652c #2a74b5 #4f7f3a #8f6812 #b83f37 |
| `nuage` Nuage light | #f7f8fa #ffffff #eef1f5 #dde2ea #1f2430 #565e6e #2f6fde #ffffff #8a5cd6 #2f6fde #3a7f4c #8a6a12 #c43a4a |
| `lavande` Lavande light | #f6f3fb #fdfbff #ece6f6 #dcd3ec #2e2840 #5c5372 #7a4fd0 #ffffff #b5603f #5a62c8 #3d7f55 #8a6a12 #bf3f5e |

- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5: Commit** `feat: six themes with contrast checks`.

---

### Task 4: Safe workspace files

**Files:**
- Create: `src/main/workspace.ts`
- Modify: `src/main/index.ts` (call `ensureWorkspace()` on ready; IPC `fs:readText`, `fs:writeText`), `src/preload/index.ts`
- Test: `tests/unit/workspace.test.ts`

**Interfaces:**
- Produces: `resolveInWorkspace(root: string, rel: string): string` (throws `Error('Chemin hors de ~/Forty')` if the resolved path is not inside `root`); `ensureWorkspace(root: string): Promise<void>` (creates `root` and `root/brouillon.sh` containing `#!/bin/sh\necho "Bonjour Forty !"\n` if absent); `readText(root, rel): Promise<string | null>` (null if missing); `writeText(root, rel, content): Promise<void>` (creates parent dirs).

- [ ] **Step 1: Write failing tests** (temp root):
  - `resolveInWorkspace(root, 'a/b.sh')` === `join(root, 'a/b.sh')`
  - throws for `'../x'`, `'/etc/passwd'`, `'a/../../x'`
  - `ensureWorkspace` twice → `brouillon.sh` exists, second call doesn't overwrite edited content
  - `readText(root, 'missing.txt')` → `null`; `writeText(root, 'd/e.txt', 'hi')` then `readText` → `'hi'`
- [ ] **Step 2:** run → FAIL. **Step 3:** implement (`path.resolve` + `path.relative`, reject if relative starts with `..` or is absolute). **Step 4:** run → PASS.
- [ ] **Step 5: Commit** `feat: workspace file access limited to ~/Forty`.

---

### Task 5: Real terminal

**Files:**
- Create: `src/main/pty-manager.ts`, `src/renderer/components/TerminalPane.tsx`
- Modify: `src/main/index.ts` (IPC `pty:spawn`, `pty:write`, `pty:resize`, `pty:kill`; events `pty:data:<id>`, `pty:exit:<id>` sent to the window; kill all on window close), `src/preload/index.ts`, `src/renderer/App.tsx` (temporary mount)
- Test: `tests/unit/pty-manager.test.ts`, `tests/e2e/terminal.spec.ts`

**Interfaces:**
- Consumes: `workspaceRoot()`, `toXtermTheme()`, `useSettings()` is not yet available — take `theme: Theme` and `fontFamily: string` as props.
- Produces:

```ts
type SpawnFn = (shell: string, args: string[], opts: { cwd: string; cols: number; rows: number; env: Record<string,string> }) => IPtyLike;
interface IPtyLike { onData(cb: (d: string) => void): void; onExit(cb: (e: { exitCode: number }) => void): void; write(d: string): void; resize(c: number, r: number): void; kill(): void }
class PtyManager {
  constructor(spawn: SpawnFn, opts: { shell: string; cwd: string });
  spawn(onData: (id: string, d: string) => void, onExit: (id: string, code: number) => void): string;
  write(id: string, d: string): void; resize(id: string, cols: number, rows: number): void;
  kill(id: string): void; killAll(): void; has(id: string): boolean;
}
<TerminalPane theme={Theme} fontFamily={string} fontSize={number} />
```
- Env passed to the shell: `process.env` plus `TERM=xterm-256color`, `FORTY=1`. Initial size 80×24.

- [ ] **Step 1: Write failing unit tests** with a fake `SpawnFn`:
  - `spawn` returns unique ids; fake's `onData('x')` calls `onData(id,'x')`
  - `resize(id, 100, 30)` reaches the fake
  - after fake exit with code 0: `onExit(id, 0)` called and `has(id) === false`
  - `write`/`resize` on an unknown id do nothing (no throw)
  - `killAll()` kills every live pty
- [ ] **Step 2:** run → FAIL. **Step 3:** implement `PtyManager`; in `index.ts` build it with `node-pty`'s `spawn`. **Step 4:** run → PASS.
- [ ] **Step 5: Write failing e2e** `tests/e2e/terminal.spec.ts`:
  - type `echo forty-ok` + Enter in `getByTestId('terminal')` → text `forty-ok` visible within 5 s
  - type `exit` + Enter → text « Le terminal s'est fermé » and a button « Relancer » visible; click it → type `echo encore` → `encore` visible
  - resize window to 1000×700 (`app.evaluate` on `BrowserWindow`) → `echo $COLUMNS` output differs from the value before resize
- [ ] **Step 6:** Implement `TerminalPane` (xterm + FitAddon; `ResizeObserver` → `fit()` → `forty.pty.resize`; unsubscribe and `kill` on unmount; exit overlay with « Relancer »). Run `npm run test:e2e` → PASS.
- [ ] **Step 7: Commit** `feat: integrated terminal`.

---

### Task 6: Main screen — design system, layout and editor

**Files:**
- Create: `src/renderer/styles/global.css`, `src/renderer/fonts/fonts.ts`, `src/renderer/state/settings-context.tsx`, `src/renderer/components/{TopBar,Layout,MissionPanel,TutorPanel,EditorPane}.tsx`
- Modify: `src/renderer/App.tsx`, `src/renderer/main.tsx`
- Test: `tests/unit/settings-context.test.tsx`, `tests/e2e/editor.spec.ts`

**Interfaces:**
- Consumes: `FortyApi` (Task 2/4/5), `THEMES`, `themeCssVars`, `toMonacoTheme` (Task 3), `TerminalPane` (Task 5).
- Produces: `UI_FONTS` / `CODE_FONTS`: `{ id; label; family: string }[]` (labels: « Inter », « Lexend », « Atkinson Hyperlegible », « OpenDyslexic » / « JetBrains Mono », « Fira Code », « Atkinson Hyperlegible Mono »); `SettingsProvider` loads settings via `forty.settings.load()`, applies `themeCssVars` + `--ui-font`, `--code-font`, `--font-size`, `--letter-spacing`, `--line-height` on `document.documentElement`, sets `data-theme-kind`; `useSettings(): { settings: Settings; update(patch: Partial<Settings>): void }` (`update` applies immediately and saves, debounced 300 ms).
- CSS tokens in `global.css`: `--space-1..6` = 4, 8, 12, 16, 24, 32 px; `--radius-sm/md/lg` = 8, 10, 12 px; panels `background: var(--surface)`, `border-radius: var(--radius-lg)`, gap `var(--space-3)` between panels on `var(--bg)`; buttons `--radius-md`, padding `8px 14px`, primary = `accent`/`onAccent`.
- Layout (spec §5 sketch): top bar (logo « Forty », breadcrumb placeholder « Brouillon », settings button ⚙︎ with `aria-label="Réglages"`); left `MissionPanel` (placeholder text « Ta mission s'affichera ici. »), center column = `EditorPane` over `TerminalPane` (60/40), right `TutorPanel` (placeholder « Ton prof IA arrivera bientôt. »). Left/right panels 300 px.
- `EditorPane` opens `brouillon.sh` via `forty.fs.readText`, language `shell`, Cmd+S → `forty.fs.writeText`, shows « Enregistré ✓ » for 2 s. Monaco options: `fontFamily` from code font, `fontSize`, `lineHeight` (px = fontSize × lineHeight), `letterSpacing` (px), `minimap: { enabled: false }`, `renderLineHighlight: 'all'`, `padding: { top: 16 }`, `roundedSelection: true`.

- [ ] **Step 1: Write failing unit test** (`settings-context.test.tsx`, jsdom, `window.forty` stubbed): after provider mounts with stored `themeId: 'sable'`, `document.documentElement.style.getPropertyValue('--bg')` is `#f5efe3`; calling `update({ fontSize: 18 })` sets `--font-size` to `18px` and calls `forty.settings.save` once after 300 ms (fake timers).
- [ ] **Step 2:** run → FAIL. **Step 3:** implement provider + fonts. **Step 4:** run → PASS.
- [ ] **Step 5: Write failing e2e** `tests/e2e/editor.spec.ts`: editor shows `Bonjour Forty` on launch; type a new line `echo test-save`, press Meta+S → « Enregistré ✓ » visible and `<home>/brouillon.sh` on disk contains `echo test-save`.
- [ ] **Step 6:** implement the layout and `EditorPane`. Run `npm run test:e2e` → PASS. Run `npm run dev` and take a screenshot to check the look against spec §9 (airy, rounded, no divider lines).
- [ ] **Step 7: Commit** `feat: main screen with editor, terminal and panels`.

---

### Task 7: Réglages (theme, fonts, spacing) with live preview

**Files:**
- Create: `src/renderer/components/SettingsDialog.tsx`
- Modify: `src/renderer/components/TopBar.tsx`, `src/renderer/components/EditorPane.tsx`, `src/renderer/components/TerminalPane.tsx` (react to settings changes)
- Test: `tests/e2e/settings.spec.ts`

**Interfaces:**
- Consumes: `useSettings()`, `THEMES`, `UI_FONTS`, `CODE_FONTS`, `toMonacoTheme`, `toXtermTheme`.
- Dialog (opens from ⚙︎, closes with Échap or « Fermer »), sections:
  - « Thème » : two rows of 3 cards (« Sombres », « Clairs »), each card a mini-preview drawn with the theme's own colors (bg, a surface block, an accent pill, 2 lines of colored « code ») + name; selected card has a 2 px `accent` ring and `aria-pressed="true"`.
  - « Police du texte » and « Police du code » : option buttons, each label rendered in its own font.
  - « Taille du texte » (12–24, step 1), « Espace entre les lettres » (0–0.2 em, step 0.02), « Espace entre les lignes » (1.2–2.2, step 0.1) : sliders with the current value shown, plus a sample sentence « Un dossier, c'est comme un tiroir : tu ranges des fichiers dedans. » rendered live.
- Every change applies immediately to the whole app (UI, Monaco via `monaco.editor.setTheme` / `updateOptions`, xterm via `terminal.options.theme` / `fontFamily` / `fontSize` + `fit()`).

- [ ] **Step 1: Write failing e2e** `tests/e2e/settings.spec.ts`:
  - open Réglages, click card « Sable » → `getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()` is `#f5efe3`
  - choose « Lexend » for text → `--ui-font` contains `Lexend`
  - set « Taille du texte » to 18 → `--font-size` is `18px`
  - close app, relaunch with the same `FORTY_USER_DATA` → `--bg` still `#f5efe3`
- [ ] **Step 2:** run → FAIL. **Step 3:** implement dialog and live updates in editor/terminal. **Step 4:** run → PASS; also `npm test` and `npm run typecheck` all green.
- [ ] **Step 5:** `npm run dev`, screenshot each of the 6 themes (main screen) and show them to the user for color feedback.
- [ ] **Step 6: Commit** `feat: settings dialog with themes and fonts`.
