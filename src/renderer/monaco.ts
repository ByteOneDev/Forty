import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { loader } from '@monaco-editor/react';
import { THEMES } from './theme/themes';
import { toMonacoTheme } from './theme/adapters';
import type { ThemeId } from '@shared/types';

self.MonacoEnvironment = { getWorker: () => new EditorWorker() };
loader.config({ monaco });

for (const t of THEMES) monaco.editor.defineTheme(`forty-${t.id}`, toMonacoTheme(t));

export const monacoThemeName = (id: ThemeId) => `forty-${id}`;
export { monaco };
