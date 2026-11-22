import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/atkinson-hyperlegible-mono/400.css';
import type { CodeFontId, UiFontId } from '@shared/types';

export interface FontOption<Id extends string> { id: Id; label: string; family: string }

const UI_FALLBACK = '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
const CODE_FALLBACK = 'Menlo, Monaco, monospace';

export const UI_FONTS: FontOption<UiFontId>[] = [
  { id: 'inter', label: 'Inter', family: `"Inter", ${UI_FALLBACK}` },
  { id: 'lexend', label: 'Lexend', family: `"Lexend", ${UI_FALLBACK}` },
  { id: 'atkinson', label: 'Atkinson Hyperlegible', family: `"Atkinson Hyperlegible", ${UI_FALLBACK}` },
  { id: 'opendyslexic', label: 'OpenDyslexic', family: `"OpenDyslexic", ${UI_FALLBACK}` },
];

export const CODE_FONTS: FontOption<CodeFontId>[] = [
  { id: 'jetbrains-mono', label: 'JetBrains Mono', family: `"JetBrains Mono", ${CODE_FALLBACK}` },
  { id: 'fira-code', label: 'Fira Code', family: `"Fira Code", ${CODE_FALLBACK}` },
  { id: 'atkinson-mono', label: 'Atkinson Hyperlegible Mono', family: `"Atkinson Hyperlegible Mono", ${CODE_FALLBACK}` },
];

export const uiFontFamily = (id: UiFontId) => (UI_FONTS.find((f) => f.id === id) ?? UI_FONTS[0]).family;
export const codeFontFamily = (id: CodeFontId) => (CODE_FONTS.find((f) => f.id === id) ?? CODE_FONTS[0]).family;
