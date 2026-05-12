import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface State {
  mode: ThemeMode;        // user preference
  systemScheme: 'light' | 'dark'; // OS color scheme
  setMode: (mode: ThemeMode) => void;
  setSystemScheme: (scheme: 'light' | 'dark') => void;
}

export const useThemeStore = create<State>((set) => ({
  mode: 'system',
  systemScheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  setMode: (mode) => set({ mode }),
  setSystemScheme: (systemScheme) => set({ systemScheme }),
}));

// Resolve `mode` + `systemScheme` into the active color scheme.
export function useResolvedScheme(): 'light' | 'dark' {
  const mode         = useThemeStore((s) => s.mode);
  const systemScheme = useThemeStore((s) => s.systemScheme);
  return mode === 'system' ? systemScheme : mode;
}
