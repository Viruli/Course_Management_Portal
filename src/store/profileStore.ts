import { create } from 'zustand';

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
  profiles: Record<ProfileRole, ProfileData>;
  update: (role: ProfileRole, patch: Partial<ProfileData>) => void;
  setPhoto: (role: ProfileRole, uri: string | undefined) => void;
  // Demo-only password change — no real auth backend.
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
  profiles: initial,
  update: (role, patch) =>
    set((s) => ({ profiles: { ...s.profiles, [role]: { ...s.profiles[role], ...patch } } })),
  setPhoto: (role, uri) =>
    set((s) => ({ profiles: { ...s.profiles, [role]: { ...s.profiles[role], photoUri: uri } } })),
  changePassword: () => {
    // No-op in design build. In production this would call the auth API.
  },
}));

// Convenience: read a derived display name.
export function fullName(p: ProfileData) {
  return `${p.firstName} ${p.lastName}`.trim();
}
