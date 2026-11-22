import { useEffect, useRef } from 'react';
import type { Settings } from '@shared/types';
import { THEMES, type Theme } from '../theme/themes';
import { CODE_FONTS, UI_FONTS } from '../fonts/fonts';
import { useSettings } from '../state/settings-context';

interface Props { onClose(): void }

const SAMPLE = "Un dossier, c'est comme un tiroir : tu ranges des fichiers dedans.";

function ThemeCard({ theme, selected, onPick }: { theme: Theme; selected: boolean; onPick(): void }) {
  const c = theme.colors;
  return (
    <button type="button" className="theme-card" aria-pressed={selected} onClick={onPick}>
      <span className="theme-preview" style={{ background: c.bg }} aria-hidden="true">
        <span className="theme-preview-panel" style={{ background: c.surface }}>
          <span className="theme-preview-line" style={{ background: c.accent, width: '38%' }} />
          <span className="theme-preview-line" style={{ background: c.success, width: '62%' }} />
          <span className="theme-preview-line" style={{ background: c.textMuted, width: '48%' }} />
        </span>
        <span className="theme-preview-pill" style={{ background: c.accent }} />
      </span>
      <span className="theme-name">{theme.name}</span>
    </button>
  );
}

function Slider(props: {
  label: string; value: number; min: number; max: number; step: number;
  format(v: number): string; onChange(v: number): void;
}) {
  const id = `slider-${props.label.replace(/\W+/g, '-')}`;
  return (
    <div className="slider">
      <label htmlFor={id}>{props.label}</label>
      <input
        id={id} type="range" min={props.min} max={props.max} step={props.step} value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <output htmlFor={id}>{props.format(props.value)}</output>
    </div>
  );
}

export function SettingsDialog({ onClose }: Props) {
  const { settings, update } = useSettings();
  const closeBtn = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Focus the dialog once when it opens, then listen for Escape.
  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => update({ [k]: v } as Partial<Settings>);

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="dialog-header">
          <h2 id="settings-title">Réglages</h2>
          <button ref={closeBtn} type="button" className="btn" onClick={onClose}>Fermer</button>
        </header>

        <div className="dialog-body">
          <section className="settings-section">
            <h3>Thème</h3>
            {(['dark', 'light'] as const).map((kind) => (
              <div key={kind} className="theme-row">
                <p className="settings-hint">{kind === 'dark' ? 'Sombres' : 'Clairs'}</p>
                <div className="theme-grid">
                  {THEMES.filter((t) => t.kind === kind).map((t) => (
                    <ThemeCard key={t.id} theme={t} selected={settings.themeId === t.id} onPick={() => update({ themeId: t.id })} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="settings-section">
            <h3>Police du texte</h3>
            <div className="option-row">
              {UI_FONTS.map((f) => (
                <button key={f.id} type="button" className="option" aria-pressed={settings.uiFont === f.id}
                  style={{ fontFamily: f.family }} onClick={() => update({ uiFont: f.id })}>
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Police du code</h3>
            <div className="option-row">
              {CODE_FONTS.map((f) => (
                <button key={f.id} type="button" className="option" aria-pressed={settings.codeFont === f.id}
                  style={{ fontFamily: f.family }} onClick={() => update({ codeFont: f.id })}>
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="settings-section">
            <h3>Lecture</h3>
            <Slider label="Taille du texte" value={settings.fontSize} min={12} max={24} step={1}
              format={(v) => `${v} px`} onChange={set('fontSize')} />
            <Slider label="Espace entre les lettres" value={settings.letterSpacing} min={0} max={0.2} step={0.02}
              format={(v) => `${Math.round(v * 100)} %`} onChange={set('letterSpacing')} />
            <Slider label="Espace entre les lignes" value={settings.lineHeight} min={1.2} max={2.2} step={0.1}
              format={(v) => v.toFixed(1)} onChange={set('lineHeight')} />
            <p className="sample">{SAMPLE}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
