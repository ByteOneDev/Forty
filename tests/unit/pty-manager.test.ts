import { describe, expect, it, vi } from 'vitest';
import { PtyManager, type IPtyLike, type SpawnFn } from '../../src/main/pty-manager';

class FakePty implements IPtyLike {
  dataCb?: (d: string) => void;
  exitCb?: (e: { exitCode: number }) => void;
  written: string[] = [];
  size: [number, number] = [0, 0];
  killed = false;
  onData(cb: (d: string) => void) { this.dataCb = cb; }
  onExit(cb: (e: { exitCode: number }) => void) { this.exitCb = cb; }
  write(d: string) { this.written.push(d); }
  resize(c: number, r: number) { this.size = [c, r]; }
  kill() { this.killed = true; }
}

function setup() {
  const fakes: FakePty[] = [];
  const spawn: SpawnFn = vi.fn((_shell, _args, _opts) => {
    const f = new FakePty();
    fakes.push(f);
    return f;
  });
  const mgr = new PtyManager(spawn, { shell: '/bin/zsh', cwd: '/tmp/forty' });
  return { mgr, fakes, spawn };
}

describe('PtyManager', () => {
  it('gives unique ids and forwards data', () => {
    const { mgr, fakes } = setup();
    const onData = vi.fn();
    const a = mgr.spawn(onData, vi.fn());
    const b = mgr.spawn(onData, vi.fn());
    expect(a).not.toBe(b);
    fakes[0].dataCb!('x');
    expect(onData).toHaveBeenCalledWith(a, 'x');
  });

  it('spawns the shell in the workspace with an xterm environment', () => {
    const { mgr, spawn } = setup();
    mgr.spawn(vi.fn(), vi.fn());
    const [shell, args, opts] = (spawn as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(shell).toBe('/bin/zsh');
    expect(args).toEqual([]);
    expect(opts).toMatchObject({ cwd: '/tmp/forty', cols: 80, rows: 24 });
    expect(opts.env).toMatchObject({ TERM: 'xterm-256color', FORTY: '1' });
  });

  it('forwards writes and resizes', () => {
    const { mgr, fakes } = setup();
    const id = mgr.spawn(vi.fn(), vi.fn());
    mgr.write(id, 'ls\r');
    mgr.resize(id, 100, 30);
    expect(fakes[0].written).toEqual(['ls\r']);
    expect(fakes[0].size).toEqual([100, 30]);
  });

  it('reports exit and forgets the pty', () => {
    const { mgr, fakes } = setup();
    const onExit = vi.fn();
    const id = mgr.spawn(vi.fn(), onExit);
    fakes[0].exitCb!({ exitCode: 0 });
    expect(onExit).toHaveBeenCalledWith(id, 0);
    expect(mgr.has(id)).toBe(false);
  });

  it('ignores unknown ids', () => {
    const { mgr } = setup();
    expect(() => { mgr.write('nope', 'x'); mgr.resize('nope', 1, 1); mgr.kill('nope'); }).not.toThrow();
  });

  it('kills every live pty', () => {
    const { mgr, fakes } = setup();
    mgr.spawn(vi.fn(), vi.fn());
    mgr.spawn(vi.fn(), vi.fn());
    mgr.killAll();
    expect(fakes.every((f) => f.killed)).toBe(true);
  });
});
