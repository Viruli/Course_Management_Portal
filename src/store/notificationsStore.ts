import { create } from 'zustand';
import { NOTIFS_STUDENT, NOTIFS_ADMIN } from '../data/mock';
import type { Notification } from '../data/types';

export type NotificationAudience = 'student' | 'admin';

interface State {
  byAudience: Record<NotificationAudience, Notification[]>;

  markRead: (audience: NotificationAudience, id: string) => void;
  markAllRead: (audience: NotificationAudience) => number;
  unreadCount: (audience: NotificationAudience) => number;
}

export const useNotificationsStore = create<State>((set, get) => ({
  byAudience: {
    student: NOTIFS_STUDENT,
    admin:   NOTIFS_ADMIN,
  },

  markRead: (audience, id) =>
    set((s) => ({
      byAudience: {
        ...s.byAudience,
        [audience]: s.byAudience[audience].map((n) =>
          n.id === id ? { ...n, read: true } : n,
        ),
      },
    })),
  markAllRead: (audience) => {
    const before = get().byAudience[audience].filter((n) => !n.read).length;
    set((s) => ({
      byAudience: {
        ...s.byAudience,
        [audience]: s.byAudience[audience].map((n) => ({ ...n, read: true })),
      },
    }));
    return before;
  },
  unreadCount: (audience) => get().byAudience[audience].filter((n) => !n.read).length,
}));
