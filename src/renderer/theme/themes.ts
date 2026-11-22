import type { ThemeId } from '@shared/types';

export interface ThemeColors {
  bg: string; surface: string; surfaceAlt: string; border: string;
  text: string; textMuted: string; accent: string; onAccent: string; accent2: string;
  info: string; success: string; warning: string; danger: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  kind: 'dark' | 'light';
  colors: ThemeColors;
}

const KEYS: (keyof ThemeColors)[] = [
  'bg', 'surface', 'surfaceAlt', 'border', 'text', 'textMuted', 'accent', 'onAccent',
  'accent2', 'info', 'success', 'warning', 'danger',
];

function make(id: ThemeId, name: string, kind: Theme['kind'], palette: string): Theme {
  const values = palette.trim().split(/\s+/);
  const colors = Object.fromEntries(KEYS.map((k, i) => [k, values[i]])) as unknown as ThemeColors;
  return { id, name, kind, colors };
}

export const THEMES: Theme[] = [
  make('minuit', 'Minuit', 'dark', '#15172a #1c1f36 #242844 #30355a #cdd3f5 #8f97c2 #a98bf5 #15172a #f2728f #78a6f5 #93d47a #e8b86d #f2728f'),
  make('graphite', 'Graphite', 'dark', '#1e1f22 #2b2d30 #34363b #43454a #dfe1e5 #a3a6ad #7ca1e8 #1e1f22 #cd8bc2 #6fa8f0 #71af79 #e0b44b #f97b87'),
  make('foret', 'Forêt', 'dark', '#121c18 #18251f #203029 #2c4036 #d6e6dc #93ad9f #5fd4a8 #121c18 #e9b35f #6fb3d9 #7fd17f #e9b35f #f07b6e'),
  make('sable', 'Sable', 'light', '#f5efe3 #fbf7ef #ede4d3 #ddd0b8 #3a342b #5f574a #2567a0 #ffffff #935525 #2567a0 #446d32 #815e10 #b03c35'),
  make('nuage', 'Nuage', 'light', '#f7f8fa #ffffff #eef1f5 #dde2ea #1f2430 #565e6e #2366db #ffffff #8150d3 #2366db #377848 #856711 #c03949'),
  make('lavande', 'Lavande', 'light', '#f6f3fb #fdfbff #ece6f6 #dcd3ec #2e2840 #5c5372 #774bcf #ffffff #9b5236 #525bc5 #36714c #816311 #b33b58'),
];

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
