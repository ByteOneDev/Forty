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
  make('graphite', 'Graphite', 'dark', '#1e1f22 #2b2d30 #34363b #43454a #dfe1e5 #a3a6ad #2a66d9 #ffffff #c77dbb #6fa8f0 #6aab73 #e0b44b #f75464'),
  make('foret', 'Forêt', 'dark', '#121c18 #18251f #203029 #2c4036 #d6e6dc #93ad9f #5fd4a8 #121c18 #e9b35f #6fb3d9 #7fd17f #e9b35f #f07b6e'),
  make('sable', 'Sable', 'light', '#f5efe3 #fbf7ef #ede4d3 #ddd0b8 #3a342b #5f574a #2a74b5 #ffffff #b0652c #2a74b5 #4f7f3a #8f6812 #b83f37'),
  make('nuage', 'Nuage', 'light', '#f7f8fa #ffffff #eef1f5 #dde2ea #1f2430 #565e6e #2f6fde #ffffff #8a5cd6 #2f6fde #3a7f4c #8a6a12 #c43a4a'),
  make('lavande', 'Lavande', 'light', '#f6f3fb #fdfbff #ece6f6 #dcd3ec #2e2840 #5c5372 #7a4fd0 #ffffff #b5603f #5a62c8 #3d7f55 #8a6a12 #bf3f5e'),
];

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
