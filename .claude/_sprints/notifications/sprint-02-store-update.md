# Sprint 2: Store Update

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Replace mock-seeded `notificationsStore` with API-driven state — flat `items[]`, async fetch, optimistic mark-read, pessimistic mark-all.

---

## 📋 Tasks

- [ ] Update `src/store/notificationsStore.ts`:
  - Remove `NOTIFS_STUDENT`, `NOTIFS_ADMIN` imports
  - Replace `byAudience: Record<NotificationAudience, Notification[]>` with `items: ApiNotification[]`, `loading: boolean`, `loaded: boolean`
  - Add `fetchNotifications()` async action:
    - Guard: if `loaded === true`, return early (no duplicate fetches)
    - Set `loading = true`
    - Call `listNotifications()`
    - On success: set `items`, `loaded = true`, `loading = false`
    - On error: `toast.error('Failed to load notifications.')`, set `loading = false`
  - Update `markRead(id: string)` → **optimistic**:
    - Store original `readAt` from the item
    - Immediately set `items[item].readAt` to current ISO timestamp (`new Date().toISOString()`)
    - Call `markNotificationRead(id)`
    - On error: revert `readAt` to original value + toast error
  - Update `markAllRead()` → **pessimistic**:
    - Call `markAllNotificationsRead()`
    - On success: set all `items[*].readAt` to non-null + reset `loaded = false` (forces re-fetch next open) + return `markedCount`
    - On error: toast error + return 0
  - Update `unreadCount` getter: `items.filter(n => n.readAt === null).length`
  - Keep the `NotificationAudience` type export if other files reference it — but it is no longer used in the store logic

- [ ] Search for all `byAudience` usages across the codebase and update them:
  - `src/navigation/AdminTabs.tsx` — unread count for admin bell badge
  - `src/navigation/SuperAdminTabs.tsx` — unread count
  - `src/screens/admin/AdminDashboardScreen.tsx` — unread count

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/store/notificationsStore.ts` — full rewrite of state + actions
- `src/navigation/AdminTabs.tsx` — update `byAudience.admin` → `items`
- `src/navigation/SuperAdminTabs.tsx` — same
- `src/screens/admin/AdminDashboardScreen.tsx` — same

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`listNotifications`, `markNotificationRead`, `markAllNotificationsRead` exist)
- **Blocks:** Sprint 3 (screen needs updated store types)
- **External:** none — no backend needed for this sprint

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `NOTIFS_STUDENT`, `NOTIFS_ADMIN`, or `byAudience` references remain in `notificationsStore.ts`
- [ ] `unreadCount` uses `readAt === null` (not boolean `!item.read`)
- [ ] `markRead` is optimistic (local state updates before API call)
- [ ] `markAllRead` is pessimistic (local state updates only after API success)
- [ ] All navigator badge count references compile cleanly

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Check for leftover byAudience references
grep -rn "byAudience\|NOTIFS_STUDENT\|NOTIFS_ADMIN" src/store/notificationsStore.ts 2>&1 || echo "CLEAN"
```

---

## 📝 Notes

- The `NotificationAudience` type (`'student' | 'admin'`) may still be exported for backward compat — keep it but remove its use from the store logic.
- After `markAllRead`, set `loaded = false` so the next time the screen opens it re-fetches fresh data.
- `AdminDashboardScreen` likely has `s.byAudience.admin.filter(n => !n.read).length` — change to `s.items.filter(n => n.readAt === null).length`.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-03-ui-wiring-debug-panels.md`](./sprint-03-ui-wiring-debug-panels.md)
