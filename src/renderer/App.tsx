import { DEFAULT_SETTINGS } from '@shared/settings';
import { TerminalPane } from './components/TerminalPane';
import { getTheme } from './theme/themes';
import { codeFontFamily } from './fonts/fonts';

export function App() {
  return (
    <div data-testid="app-root" style={{ position: 'fixed', inset: 0, display: 'flex' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <TerminalPane theme={getTheme(DEFAULT_SETTINGS.themeId)} fontFamily={codeFontFamily('jetbrains-mono')} fontSize={14} />
      </div>
    </div>
  );
}
