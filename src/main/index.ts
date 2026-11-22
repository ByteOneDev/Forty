import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain } from 'electron';
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

  ipcMain.handle(IPC.settingsLoad, () => loadSettings(settingsFile()));
  ipcMain.handle(IPC.settingsSave, (_e, s: Settings) => saveSettings(settingsFile(), s));
  ipcMain.handle(IPC.fsReadText, (_e, rel: string) => readText(root, rel));
  ipcMain.handle(IPC.fsWriteText, (_e, rel: string, content: string) => writeText(root, rel, content));

  const send = (channel: string, ...args: unknown[]) => {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args);
  };
  ipcMain.handle(IPC.ptySpawn, () =>
    ptys.spawn((id, d) => send(IPC.ptyData(id), d), (id, code) => send(IPC.ptyExit(id), code)),
  );
  ipcMain.on(IPC.ptyWrite, (_e, id: string, d: string) => ptys.write(id, d));
  ipcMain.on(IPC.ptyResize, (_e, id: string, c: number, r: number) => ptys.resize(id, c, r));
  ipcMain.on(IPC.ptyKill, (_e, id: string) => ptys.kill(id));
  win.on('closed', () => ptys.killAll());
}

app.whenReady().then(async () => {
  await ensureWorkspace(workspaceRoot());
  const win = createWindow();
  registerIpc(win);
});

app.on('window-all-closed', () => app.quit());
