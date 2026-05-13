# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Status:** 🟢 Complete
**Estimated:** 30 min · **Actual:** ~10 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create `src/services/notifications.ts` with API-aligned types and all three notification service functions.

---

## 📋 Tasks

- [ ] Define `NotificationCategory` type: `'registration_approved' | 'registration_rejected' | 'enrollment_pending' | 'enrollment_approved' | 'enrollment_rejected' | 'course_published' | 'system'`
- [ ] Define `ApiNotification` interface: `{ id, userUid, category: NotificationCategory, title, body, payload: Record<string, unknown>, readAt: string|null, createdAt }`
- [ ] `listNotifications(params?: { read?: 'true'|'false'; cursor?: string })` → `GET /me/notifications?limit=50`, tag: `'notifications.list'`
- [ ] `markNotificationRead(id: string)` → `POST /me/notifications/${id}/read` (no body), tag: `'notifications.markRead'`
- [ ] `markAllNotificationsRead()` → `POST /me/notifications/read-all` (no body), returns `{ markedCount: number }`, tag: `'notifications.markAll'`

---

## 📁 Files to Touch

**New:**
- `src/services/notifications.ts`

**Modified:** none
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2, 3
- **External:** none — pure TypeScript

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `markNotificationRead` sends **no body** — `body` option must not be passed
- [ ] `markAllNotificationsRead` sends **no body**
- [ ] No mock types from `src/data/types.ts` used

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

No device needed.

---

## 📝 Notes

- `listNotifications` builds a query string from params — use `URLSearchParams` or manual string building.
- Both mark-read endpoints require **no body** — omit the `body` option entirely (not even `{}`).

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-02-store-update.md`](./sprint-02-store-update.md)
