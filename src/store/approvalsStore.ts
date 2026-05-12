import { create } from 'zustand';
import { REGISTRATIONS, ENROLMENTS } from '../data/mock';
import type { Registration, Enrolment } from '../data/types';

interface State {
  registrations: Registration[];
  enrolments: Enrolment[];

  approveRegistration: (id: string) => void;
  rejectRegistration:  (id: string) => void;

  approveEnrolment: (id: string) => void;
  rejectEnrolment:  (id: string) => void;
  approveAllEnrolments: () => number; // returns count of items approved
}

export const useApprovalsStore = create<State>((set, get) => ({
  registrations: REGISTRATIONS,
  enrolments: ENROLMENTS,

  approveRegistration: (id) =>
    set((s) => ({
      registrations: s.registrations.map((r) =>
        r.id === id ? { ...r, status: 'approved' } : r,
      ),
    })),
  rejectRegistration: (id) =>
    set((s) => ({
      registrations: s.registrations.map((r) =>
        r.id === id ? { ...r, status: 'rejected' } : r,
      ),
    })),

  approveEnrolment: (id) =>
    set((s) => ({
      enrolments: s.enrolments.map((e) =>
        e.id === id ? { ...e, status: 'approved' } : e,
      ),
    })),
  rejectEnrolment: (id) =>
    set((s) => ({
      enrolments: s.enrolments.map((e) =>
        e.id === id ? { ...e, status: 'rejected' } : e,
      ),
    })),
  approveAllEnrolments: () => {
    const pendingCount = get().enrolments.filter((e) => e.status === 'pending').length;
    set((s) => ({
      enrolments: s.enrolments.map((e) =>
        e.status === 'pending' ? { ...e, status: 'approved' } : e,
      ),
    }));
    return pendingCount;
  },
}));
