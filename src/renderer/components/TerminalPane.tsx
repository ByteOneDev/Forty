import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import '../terminal.css';
import type { Theme } from '../theme/themes';
import { toXtermTheme } from '../theme/adapters';

interface Props {
  theme: Theme;
  fontFamily: string;
  fontSize: number;
}

export function TerminalPane({ theme, fontFamily, fontSize }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fit = useRef<FitAddon | null>(null);
  const ptyId = useRef<string | null>(null);
  const [closed, setClosed] = useState(false);
  const [session, setSession] = useState(0);

  // One xterm instance per session (a restart creates a fresh one).
  useEffect(() => {
    const t = new Terminal({ cursorBlink: true, fontFamily, fontSize, theme: toXtermTheme(theme), allowProposedApi: false });
    const f = new FitAddon();
    t.loadAddon(f);
    t.open(host.current!);
    term.current = t;
    fit.current = f;
    let alive = true;
    const cleanups: (() => void)[] = [];

    const sendSize = () => {
      try { f.fit(); } catch { return; }
      if (ptyId.current) window.forty.pty.resize(ptyId.current, t.cols, t.rows);
    };

    window.forty.pty.spawn().then((id) => {
      if (!alive) { window.forty.pty.kill(id); return; }
      ptyId.current = id;
      cleanups.push(window.forty.pty.onData(id, (d) => t.write(d)));
      cleanups.push(window.forty.pty.onExit(id, () => { ptyId.current = null; setClosed(true); }));
      const sub = t.onData((d) => window.forty.pty.write(id, d));
      cleanups.push(() => sub.dispose());
      sendSize();
      t.focus();
    });

    const ro = new ResizeObserver(() => sendSize());
    ro.observe(host.current!);

    return () => {
      alive = false;
      ro.disconnect();
      cleanups.forEach((c) => c());
      if (ptyId.current) window.forty.pty.kill(ptyId.current);
      ptyId.current = null;
      t.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Live theme / font changes without restarting the shell.
  useEffect(() => {
    const t = term.current;
    if (!t) return;
    t.options.theme = toXtermTheme(theme);
    t.options.fontFamily = fontFamily;
    t.options.fontSize = fontSize;
    try { fit.current?.fit(); } catch { /* not visible yet */ }
    if (ptyId.current) window.forty.pty.resize(ptyId.current, t.cols, t.rows);
  }, [theme, fontFamily, fontSize]);

  const restart = useCallback(() => {
    setClosed(false);
    setSession((s) => s + 1);
  }, []);

  return (
    <div className="terminal-pane" data-testid="terminal">
      <div className="terminal-host" ref={host} />
      {closed && (
        <div className="terminal-closed" role="status">
          <p>Le terminal s'est fermé.</p>
          <button type="button" className="btn btn-primary" onClick={restart}>Relancer</button>
        </div>
      )}
    </div>
  );
}
