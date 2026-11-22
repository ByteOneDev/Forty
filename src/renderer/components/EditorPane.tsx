import { useEffect, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { monaco, monacoThemeName } from '../monaco';
import { useSettings } from '../state/settings-context';
import { codeFontFamily } from '../fonts/fonts';

const FILE = 'brouillon.sh';

export function EditorPane() {
  const { settings } = useSettings();
  const [text, setText] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    window.forty.fs.readText(FILE).then((t) => setText(t ?? ''));
  }, []);

  useEffect(() => {
    // Remeasure once the web fonts are ready so the cursor lines up.
    void document.fonts.ready.then(() => monaco.editor.remeasureFonts());
  }, [settings.codeFont]);

  const onMount: OnMount = (editor) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      clearTimeout(autoTimer.current);
      await window.forty.fs.writeText(FILE, editor.getValue());
      setSaved(true);
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    });
    // Beginners forget Cmd+S: also save quietly 800 ms after typing stops.
    editor.onDidChangeModelContent(() => {
      clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => void window.forty.fs.writeText(FILE, editor.getValue()), 800);
    });
    editor.focus();
  };

  return (
    <section className="panel editor-pane" data-testid="editor" aria-label="Éditeur">
      <div className="panel-header editor-file">
        <span className="editor-file-name">{FILE}</span>
        {saved && <span className="editor-saved" role="status">Enregistré ✓</span>}
      </div>
      <div className="editor-host">
        {text !== null && (
          <Editor
            defaultValue={text}
            defaultLanguage="shell"
            theme={monacoThemeName(settings.themeId)}
            onMount={onMount}
            options={{
              fontFamily: codeFontFamily(settings.codeFont),
              fontSize: settings.fontSize,
              lineHeight: Math.round(settings.fontSize * settings.lineHeight),
              letterSpacing: settings.letterSpacing * settings.fontSize,
              minimap: { enabled: false },
              renderLineHighlight: 'all',
              padding: { top: 16, bottom: 16 },
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
            }}
          />
        )}
      </div>
    </section>
  );
}
