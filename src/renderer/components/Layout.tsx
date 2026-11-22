import { useState } from 'react';
import { TopBar } from './TopBar';
import { MissionPanel } from './MissionPanel';
import { EditorPane } from './EditorPane';
import { TerminalPane } from './TerminalPane';
import { useSettings } from '../state/settings-context';
import { getTheme } from '../theme/themes';
import { codeFontFamily } from '../fonts/fonts';

export function Layout() {
  const { settings } = useSettings();
  const [, setSettingsOpen] = useState(false);
  return (
    <div className="app" data-testid="app-root">
      <TopBar crumb="Brouillon" onOpenSettings={() => setSettingsOpen(true)} />
      <main className="workspace">
        <MissionPanel />
        <div className="code-column">
          <EditorPane />
          <section className="panel" aria-label="Terminal">
            <TerminalPane
              theme={getTheme(settings.themeId)}
              fontFamily={codeFontFamily(settings.codeFont)}
              fontSize={settings.fontSize - 1}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
