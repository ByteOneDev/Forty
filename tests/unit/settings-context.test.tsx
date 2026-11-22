// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '@shared/settings';
import type { FortyApi, Settings } from '@shared/types';
import { SettingsProvider, useSettings } from '../../src/renderer/state/settings-context';

function stubForty(stored: Settings) {
  const save = vi.fn(async () => {});
  window.forty = { settings: { load: async () => stored, save } } as unknown as FortyApi;
  return save;
}

let api: ReturnType<typeof useSettings> | undefined;
function Probe() {
  api = useSettings();
  return null;
}

const cssVar = (name: string) => document.documentElement.style.getPropertyValue(name);

afterEach(() => {
  vi.useRealTimers();
  api = undefined;
});

describe('SettingsProvider', () => {
  it('applies the stored theme as CSS variables', async () => {
    stubForty({ ...DEFAULT_SETTINGS, themeId: 'sable' });
    render(<SettingsProvider><Probe /></SettingsProvider>);
    await waitFor(() => expect(cssVar('--bg')).toBe('#f5efe3'));
    expect(document.documentElement.dataset.themeKind).toBe('light');
  });

  it('applies updates at once and saves them once after 300 ms', async () => {
    const save = stubForty(DEFAULT_SETTINGS);
    render(<SettingsProvider><Probe /></SettingsProvider>);
    await waitFor(() => expect(cssVar('--bg')).toBe('#15172a'));
    vi.useFakeTimers();
    act(() => api!.update({ fontSize: 18 }));
    act(() => api!.update({ fontSize: 19 }));
    expect(cssVar('--font-size')).toBe('19px');
    expect(save).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(300); });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, fontSize: 19 });
  });
});
