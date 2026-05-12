import { create } from 'zustand';

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface State {
  toasts: Toast[];
  show: (message: string, kind?: ToastKind) => void;
  dismiss: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useUiStore = create<State>((set) => ({
  toasts: [],
  show: (message, kind = 'info') => {
    const id = uid();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    // Auto-dismiss after 2.6s.
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience for non-hook code (callbacks, store actions chaining):
export const toast = {
  success: (message: string) => useUiStore.getState().show(message, 'success'),
  info:    (message: string) => useUiStore.getState().show(message, 'info'),
  error:   (message: string) => useUiStore.getState().show(message, 'error'),
};
