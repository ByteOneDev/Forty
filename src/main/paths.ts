import { homedir } from 'node:os';
import { join } from 'node:path';
import { app } from 'electron';

/** Folder where the student's work lives: FORTY_HOME (tests) or ~/Forty. */
export function workspaceRoot(): string {
  return process.env.FORTY_HOME ?? join(homedir(), 'Forty');
}

/** Folder for app data (settings…): FORTY_USER_DATA (tests) or Electron's userData. */
export function userDataDir(): string {
  return process.env.FORTY_USER_DATA ?? app.getPath('userData');
}
