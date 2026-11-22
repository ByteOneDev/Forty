import './styles/global.css';
import { SettingsProvider } from './state/settings-context';
import { Layout } from './components/Layout';

export function App() {
  return (
    <SettingsProvider>
      <Layout />
    </SettingsProvider>
  );
}
