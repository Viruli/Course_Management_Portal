import { create } from 'zustand';
import type { Role } from '../data/types';

interface AppState {
  role: Role;
  publicStep: 'splash' | 'onboarding' | 'signin' | 'signup' | 'pending';
  setRole: (r: Role) => void;
  setPublicStep: (s: AppState['publicStep']) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'public',
  publicStep: 'splash',
  setRole: (role) => set({ role }),
  setPublicStep: (publicStep) => set({ publicStep }),
}));
