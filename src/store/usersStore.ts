import { create } from 'zustand';
import { SAMPLE_USERS } from '../data/mock';
import type { AppRole, AppUser, AccountStatus } from '../data/types';

interface UsersState {
  users: AppUser[];
  /**
   * Change a user's role. The platform invariant is "at most one Super Admin".
   * Promoting a user to `super` while another super admin exists atomically
   * demotes the current one to `admin` — i.e. ownership transfer.
   */
  changeRole: (uid: string, role: AppRole) => void;
  setStatus: (uid: string, status: AccountStatus) => void;
  approve: (uid: string) => void;   // pending → active
  suspend: (uid: string) => void;   // active → suspended
  reinstate: (uid: string) => void; // suspended → active
  reset: () => void;

  // Derived helpers
  currentSuper: () => AppUser | undefined;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: SAMPLE_USERS,

  changeRole: (uid, role) =>
    set((s) => {
      const target = s.users.find((u) => u.uid === uid);
      if (!target || target.role === role) return { users: s.users };

      // Promoting to Super Admin: any existing Super Admin (other than the
      // target) is demoted to Admin in the same update so the invariant
      // "≤ 1 super admin" holds.
      if (role === 'super') {
        return {
          users: s.users.map((u) => {
            if (u.uid === uid) return { ...u, role: 'super' as const };
            if (u.role === 'super') return { ...u, role: 'admin' as const };
            return u;
          }),
        };
      }

      return { users: s.users.map((u) => (u.uid === uid ? { ...u, role } : u)) };
    }),

  setStatus: (uid, status) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status } : u)) })),
  approve: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'active' } : u)) })),
  suspend: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'suspended' } : u)) })),
  reinstate: (uid) =>
    set((s) => ({ users: s.users.map((u) => (u.uid === uid ? { ...u, status: 'active' } : u)) })),
  reset: () => set({ users: SAMPLE_USERS }),

  currentSuper: () => get().users.find((u) => u.role === 'super'),
}));
