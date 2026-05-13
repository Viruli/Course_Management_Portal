import { create } from 'zustand';
import type { ApiUserProfile } from '../services/auth';

export type ProfileRole = 'student' | 'admin' | 'super';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  photoUri?: string;     // local file:// URI selected by user
  joined: string;        // human-readable join date
  // Student-only stats
  enrolled?: number;
  hours?: number;
  streak?: number;
  // Admin/Super title
  title?: string;
}

interface State {
  // Real API profile — populated after sign-in, cleared on sign-out.
  apiProfile: ApiUserProfile | null;
  setProfile: (p: ApiUserProfile) => void;
  clearProfile: () => void;

  // Mock per-role profiles — still used by screens not yet wired to real API.
  profiles: Record<ProfileRole, ProfileData>;
  update: (role: ProfileRole, patch: Partial<ProfileData>) => void;
  setPhoto: (role: ProfileRole, uri: string | undefined) => void;
  changePassword: (role: ProfileRole) => void;
}

const initial: Record<ProfileRole, ProfileData> = {
  student: {
    firstName: 'Anjali',
    lastName: 'Silva',
    email: 'anjali.silva@edupath.lk',
    joined: 'Joined March 2026',
    enrolled: 4,
    hours: 23,
    streak: 7,
  },
  admin: {
    firstName: 'Sahan',
    lastName: 'Wijeratne',
    email: 'sahan.w@edupath.lk',
    joined: 'Joined January 2026',
    title: 'Admin',
  },
  super: {
    firstName: 'Dilani',
    lastName: 'Rajapakse',
    email: 'dilani.r@edupath.lk',
    joined: 'Joined January 2026',
    title: 'Super Admin',
  },
};

export const useProfileStore = create<State>((set) => ({
  apiProfile: null,
  setProfile: (p) => set({ apiProfile: p }),
  clearProfile: () => set({ apiProfile: null }),

  profiles: initial,
  update: (role, patch) =>
    set((s) => ({ profiles: { ...s.profiles, [role]: { ...s.profiles[role], ...patch } } })),
  setPhoto: (role, uri) =>
    set((s) => ({ profiles: { ...s.profiles, [role]: { ...s.profiles[role], photoUri: uri } } })),
  changePassword: () => {
    // No-op in design build. Real implementation calls POST /me/change-password.
  },
}));

// Convenience: read a derived display name.
export function fullName(p: ProfileData) {
  return `${p.firstName} ${p.lastName}`.trim();
}
