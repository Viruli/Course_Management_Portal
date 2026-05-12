import { create } from 'zustand';

export type DebugOutcome = 'success' | 'error';

export interface DebugEntry {
  id: string;
  tag: string;
  outcome: DebugOutcome;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  durationMs: number;
  requestId?: string;
  requestBody?: unknown;
  responseBody?: unknown;
  errorCode?: string;
  errorMessage?: string;
}

interface State {
  entries: DebugEntry[];
  enabled: boolean;
  log: (entry: Omit<DebugEntry, 'id'>) => void;
  clear: () => void;
  clearTag: (tag: string) => void;
  setEnabled: (enabled: boolean) => void;
}

const MAX_ENTRIES = 50;
const uid = () => Math.random().toString(36).slice(2, 10);

export const useDebugStore = create<State>((set) => ({
  entries: [],
  enabled: true,
  log: (entry) =>
    set((s) => {
      const next = [{ id: uid(), ...entry }, ...s.entries];
      return { entries: next.slice(0, MAX_ENTRIES) };
    }),
  clear: () => set({ entries: [] }),
  clearTag: (tag) => set((s) => ({ entries: s.entries.filter((e) => e.tag !== tag) })),
  setEnabled: (enabled) => set({ enabled }),
}));

export const debug = {
  log: (entry: Omit<DebugEntry, 'id'>) => useDebugStore.getState().log(entry),
  clear: () => useDebugStore.getState().clear(),
  clearTag: (tag: string) => useDebugStore.getState().clearTag(tag),
};
