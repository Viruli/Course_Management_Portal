import { create } from 'zustand';
import {
  ApiNotification,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications';
import { toast } from './uiStore';

// Kept for backward compat — no longer used in store logic
export type NotificationAudience = 'student' | 'admin';

interface State {
  items:   ApiNotification[];
  loading: boolean;
  loaded:  boolean;

  fetchNotifications:  () => Promise<void>;
  markRead:            (id: string) => Promise<void>;
  markAllRead:         () => Promise<number>; // returns markedCount
  unreadCount:         () => number;
}

export const useNotificationsStore = create<State>((set, get) => ({
  items:   [],
  loading: false,
  loaded:  false,

  fetchNotifications: async () => {
    if (get().loaded) return; // prevent duplicate fetches in same session
    set({ loading: true });
    try {
      const result = await listNotifications();
      set({ items: result.data.items, loaded: true });
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    // Optimistic update — mark locally first, revert on failure
    const original = get().items.find((n) => n.id === id)?.readAt ?? null;
    set((s) => ({
      items: s.items.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    }));
    try {
      await markNotificationRead(id);
    } catch {
      // Revert on failure
      set((s) => ({
        items: s.items.map((n) =>
          n.id === id ? { ...n, readAt: original } : n,
        ),
      }));
      toast.error("Couldn't mark as read. Try again.");
    }
  },

  markAllRead: async () => {
    // Pessimistic — only update local state after API confirms
    try {
      const result = await markAllNotificationsRead();
      const now = new Date().toISOString();
      set((s) => ({
        items:  s.items.map((n) => ({ ...n, readAt: n.readAt ?? now })),
        loaded: false, // force re-fetch next time the screen opens
      }));
      return result.data.markedCount;
    } catch {
      toast.error("Couldn't mark all as read. Try again.");
      return 0;
    }
  },

  unreadCount: () => get().items.filter((n) => n.readAt === null).length,
}));
