export interface IPtyLike {
  onData(cb: (d: string) => void): void;
  onExit(cb: (e: { exitCode: number }) => void): void;
  write(d: string): void;
  resize(cols: number, rows: number): void;
  kill(): void;
}

export type SpawnFn = (
  shell: string,
  args: string[],
  opts: { cwd: string; cols: number; rows: number; env: Record<string, string> },
) => IPtyLike;

export class PtyManager {
  private ptys = new Map<string, IPtyLike>();
  private next = 1;

  constructor(private spawnFn: SpawnFn, private opts: { shell: string; cwd: string }) {}

  spawn(onData: (id: string, d: string) => void, onExit: (id: string, code: number) => void): string {
    const id = `pty-${this.next++}`;
    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      TERM: 'xterm-256color',
      FORTY: '1',
      // Apps opened from Finder get no locale: without it zsh mangles accents.
      LANG: process.env.LANG || 'fr_FR.UTF-8',
    };
    // Login shell, like Terminal.app, so ~/.zprofile (Homebrew paths…) is read.
    const pty = this.spawnFn(this.opts.shell, ['-l'], { cwd: this.opts.cwd, cols: 80, rows: 24, env });
    this.ptys.set(id, pty);
    pty.onData((d) => onData(id, d));
    pty.onExit(({ exitCode }) => {
      this.ptys.delete(id);
      onExit(id, exitCode);
    });
    return id;
  }

  has(id: string): boolean {
    return this.ptys.has(id);
  }

  write(id: string, d: string): void {
    this.ptys.get(id)?.write(d);
  }

  resize(id: string, cols: number, rows: number): void {
    if (cols > 0 && rows > 0) this.ptys.get(id)?.resize(cols, rows);
  }

  kill(id: string): void {
    const pty = this.ptys.get(id);
    this.ptys.delete(id);
    pty?.kill();
  }

  killAll(): void {
    for (const id of [...this.ptys.keys()]) this.kill(id);
  }
}
