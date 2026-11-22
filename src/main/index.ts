import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain, shell, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron';
import * as nodePty from 'node-pty';
import { IPC, type Settings } from '@shared/types';
import { userDataDir, workspaceRoot } from './paths';
import { loadSettings, saveSettings } from './settings-store';
import { ensureWorkspace, readText, writeText } from './workspace';
import { PtyManager, type SpawnFn } from './pty-manager';

const here = fileURLToPath(new URL('.', import.meta.url));

if (process.env.FORTY_USER_DATA) app.setPath('userData', process.env.FORTY_USER_DATA);
app.setName('Forty');

const settingsFile = () => join(userDataDir(), 'settings.json');

const spawnPty: SpawnFn = (shell, args, opts) =>
  nodePty.spawn(shell, args, { name: 'xterm-256color', ...opts });

// No page may navigate away from Forty or open its own Electron window.
// http(s) links (e.g. Cmd+click in the editor) open in the default browser instead.
app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (event) => event.preventDefault());
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
});

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Forty',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    backgroundColor: '#15172a',
    show: false,
    webPreferences: {
      preload: join(here, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.once('ready-to-show', () => win.show());
  if (process.env.ELECTRON_RENDERER_URL) void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  else void win.loadFile(join(here, '../renderer/index.html'));
  return win;
}

function registerIpc(win: BrowserWindow): void {
  const root = workspaceRoot();
  const ptys = new PtyManager(spawnPty, { shell: process.env.SHELL || '/bin/zsh', cwd: root });

  // Only the main frame of our own window may talk to the main process.
  const trusted = (e: IpcMainEvent | IpcMainInvokeEvent) =>
    !win.isDestroyed() && e.sender === win.webContents && e.senderFrame === win.webContents.mainFrame;
  const handle = (channel: string, fn: (...args: any[]) => unknown) =>
    ipcMain.handle(channel, (e, ...args) => {
      if (!trusted(e)) throw new Error('Refusé');
      return fn(...args);
    });
  const on = (channel: string, fn: (...args: any[]) => void) =>
    ipcMain.on(channel, (e, ...args) => { if (trusted(e)) fn(...args); });

  handle(IPC.settingsLoad, () => loadSettings(settingsFile()));
  handle(IPC.settingsSave, (s: Settings) => saveSettings(settingsFile(), s));
  handle(IPC.fsReadText, (rel: string) => readText(root, rel));
  handle(IPC.fsWriteText, (rel: string, content: string) => writeText(root, rel, content));

  const send = (channel: string, ...args: unknown[]) => {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args);
  };
  handle(IPC.ptySpawn, () =>
    ptys.spawn((id, d) => send(IPC.ptyData(id), d), (id, code) => send(IPC.ptyExit(id), code)),
  );
  on(IPC.ptyWrite, (id: string, d: string) => ptys.write(id, d));
  on(IPC.ptyResize, (id: string, c: number, r: number) => ptys.resize(id, c, r));
  on(IPC.ptyKill, (id: string) => ptys.kill(id));

  // A reload or a renderer crash skips React cleanup: kill the shells it owned.
  win.webContents.on('did-start-navigation', (details) => {
    if (details.isMainFrame && !details.isSameDocument) ptys.killAll();
  });
  win.webContents.on('render-process-gone', () => ptys.killAll());
  win.on('closed', () => ptys.killAll());
}

app.whenReady().then(async () => {
  await ensureWorkspace(workspaceRoot());
  const win = createWindow();
  registerIpc(win);
});

app.on('window-all-closed', () => app.quit());
