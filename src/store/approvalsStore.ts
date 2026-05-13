import { create } from 'zustand';
import {
  ApiRegistration,
  BulkApproveResult,
  listRegistrations,
  approveRegistration as apiApproveReg,
  rejectRegistration as apiRejectReg,
  bulkApproveRegistrations as apiBulkApprove,
} from '../services/registrations';
import {
  ApiAdminEnrollment,
  listAdminEnrollments,
  approveEnrollment as apiApproveEnr,
  rejectEnrollment as apiRejectEnr,
} from '../services/enrollments';
import { toast } from './uiStore';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';

interface State {
  // ─── Registrations ──────────────────────────────────────────────────────────
  // Stored per-status so switching tabs doesn't overwrite other tabs' counts
  registrationsByStatus: Record<RegistrationStatus, ApiRegistration[]>;
  loadingRegistrations:  boolean;

  // Convenience getter for the current status slice
  registrations:         ApiRegistration[];   // kept for backward compat — same as registrationsByStatus.pending by default

  fetchRegistrations:         (status: RegistrationStatus, q?: string) => Promise<void>;
  approveRegistration:        (id: string) => Promise<void>;
  rejectRegistration:         (id: string, reason?: string) => Promise<void>;
  bulkApproveAllRegistrations: () => Promise<{ approved: number; failed: number }>;

  // ─── Enrollments ────────────────────────────────────────────────────────────
  enrolments:        ApiAdminEnrollment[];
  loadingEnrolments: boolean;

  fetchEnrollments:    (status?: string) => Promise<void>;
  approveEnrolment:    (id: string) => Promise<void>;
  rejectEnrolment:     (id: string, reason?: string) => Promise<void>;
  approveAllEnrolments: () => Promise<{ approved: number; failed: number }>;
}

export const useApprovalsStore = create<State>((set, get) => ({
  // ─── Registrations ────────────────────────────────────────────────────────

  registrationsByStatus: { pending: [], approved: [], rejected: [] },
  registrations:         [],   // alias to pending slice for backward compat
  loadingRegistrations:  false,

  fetchRegistrations: async (status, q) => {
    set({ loadingRegistrations: true });
    try {
      const result = await listRegistrations({ status, q, limit: 50 });
      set((s) => ({
        registrationsByStatus: {
          ...s.registrationsByStatus,
          [status]: result.data.items,
        },
        // Keep registrations alias pointing to the currently active status
        registrations: status === 'pending' ? result.data.items : s.registrations,
      }));
    } catch {
      toast.error('Failed to load registrations. Please try again.');
    } finally {
      set({ loadingRegistrations: false });
    }
  },

  approveRegistration: async (id) => {
    try {
      await apiApproveReg(id);
      // Remove from pending bucket
      set((s) => ({
        registrationsByStatus: {
          ...s.registrationsByStatus,
          pending: s.registrationsByStatus.pending.filter((r) => r.id !== id),
        },
        registrations: s.registrations.filter((r) => r.id !== id),
      }));
    } catch (err: any) {
      if (err?.code === 'INVALID_STATE') {
        toast.error('This registration has already been processed.');
        get().fetchRegistrations('pending');
      } else {
        throw err;
      }
    }
  },

  rejectRegistration: async (id, reason) => {
    try {
      await apiRejectReg(id, reason);
      set((s) => ({
        registrationsByStatus: {
          ...s.registrationsByStatus,
          pending: s.registrationsByStatus.pending.filter((r) => r.id !== id),
        },
        registrations: s.registrations.filter((r) => r.id !== id),
      }));
    } catch (err: any) {
      if (err?.code === 'INVALID_STATE') {
        toast.error('This registration has already been processed.');
        get().fetchRegistrations('pending');
      } else {
        throw err;
      }
    }
  },

  bulkApproveAllRegistrations: async () => {
    const ids = get().registrationsByStatus.pending.map((r) => r.id);

    if (ids.length === 0) return { approved: 0, failed: 0 };

    let totalApproved = 0;
    let totalFailed   = 0;

    // API allows max 50 per call — chunk if needed
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      try {
        const result = await apiBulkApprove(chunk);
        totalApproved += result.data.approved.length;
        totalFailed   += result.data.failed.length;
        // Remove approved items from pending bucket
        const approvedSet = new Set(result.data.approved);
        set((s) => ({
          registrationsByStatus: {
            ...s.registrationsByStatus,
            pending: s.registrationsByStatus.pending.filter((r) => !approvedSet.has(r.id)),
          },
          registrations: s.registrations.filter((r) => !approvedSet.has(r.id)),
        }));
      } catch {
        totalFailed += chunk.length;
      }
    }

    return { approved: totalApproved, failed: totalFailed };
  },

  // ─── Enrollments ──────────────────────────────────────────────────────────

  enrolments:        [],
  loadingEnrolments: false,

  fetchEnrollments: async (status) => {
    set({ loadingEnrolments: true });
    try {
      const result = await listAdminEnrollments({ status: status ?? 'pending', limit: 50 });
      set({ enrolments: result.data.items });
    } catch {
      toast.error('Failed to load enrolments. Please try again.');
    } finally {
      set({ loadingEnrolments: false });
    }
  },

  approveEnrolment: async (id) => {
    try {
      await apiApproveEnr(id);
      set((s) => ({ enrolments: s.enrolments.filter((e) => e.id !== id) }));
    } catch (err: any) {
      if (err?.code === 'INVALID_STATE') {
        toast.error('This enrolment has already been processed.');
        get().fetchEnrollments('pending');
      } else {
        throw err;
      }
    }
  },

  rejectEnrolment: async (id, reason) => {
    try {
      await apiRejectEnr(id, reason);
      set((s) => ({ enrolments: s.enrolments.filter((e) => e.id !== id) }));
    } catch (err: any) {
      if (err?.code === 'INVALID_STATE') {
        toast.error('This enrolment has already been processed.');
        get().fetchEnrollments('pending');
      } else {
        throw err;
      }
    }
  },

  approveAllEnrolments: async () => {
    const pending = get().enrolments.filter((e) => e.state === 'pending');
    let approved = 0;
    let failed   = 0;

    for (const e of pending) {
      try {
        await apiApproveEnr(e.id);
        set((s) => ({ enrolments: s.enrolments.filter((x) => x.id !== e.id) }));
        approved++;
      } catch {
        failed++;
      }
    }

    return { approved, failed };
  },
}));
