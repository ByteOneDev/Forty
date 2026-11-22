import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type FortyApi } from '@shared/types';

function listen<T>(channel: string, cb: (value: T) => void): () => void {
  const listener = (_e: unknown, value: T) => cb(value);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: FortyApi = {
  settings: {
    load: () => ipcRenderer.invoke(IPC.settingsLoad),
    save: (s) => ipcRenderer.invoke(IPC.settingsSave, s),
  },
  fs: {
    readText: (rel) => ipcRenderer.invoke(IPC.fsReadText, rel),
    writeText: (rel, content) => ipcRenderer.invoke(IPC.fsWriteText, rel, content),
  },
  pty: {
    spawn: () => ipcRenderer.invoke(IPC.ptySpawn),
    write: (id, d) => ipcRenderer.send(IPC.ptyWrite, id, d),
    resize: (id, c, r) => ipcRenderer.send(IPC.ptyResize, id, c, r),
    kill: (id) => ipcRenderer.send(IPC.ptyKill, id),
    onData: (id, cb) => listen(IPC.ptyData(id), cb),
    onExit: (id, cb) => listen(IPC.ptyExit(id), cb),
  },
};

contextBridge.exposeInMainWorld('forty', api);
