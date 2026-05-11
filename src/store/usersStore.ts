import { create } from 'zustand';
import { SAMPLE_USERS } from '../data/mock';
import type { AppRole, AppUser, AccountStatus } from '../data/types';

interface UsersState {
  users: AppUser[];
  changeRole: (uid: string, role: AppRole) => void;
  setStatus: (uid: string, status: AccountStatus) => void;
  approve: (uid: string) => void;   // pending → active
  suspend: (uid: string) => void;   // active → suspended
  reinstate: (uid: string) => void; // suspended → active
  reset: () => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: SAMPLE_USERS,
  changeRole: (uid, role) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, role } : u)) })),
  setStatus: (uid, status) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status } : u)) })),
  approve: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'active' } : u)) })),
  suspend: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'suspended' } : u)) })),
  reinstate: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'active' } : u)) })),
  reset: () => set({ users: SAMPLE_USERS }),
}));
