# Notifications API Integration

**Spec ID:** 006-notifications
**Branch:** `feat/notifications`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Replace the mock `notificationsStore` (seeded from `NOTIFS_STUDENT` and `NOTIFS_ADMIN`) with live data from `GET /me/notifications`, and wire mark-as-read and mark-all-read to the real API. Notifications are shown to all three roles (student, admin, super admin). Debug panels are added to `NotificationsScreen` to verify the API responses during testing.

---

## User Stories
- As a **student/admin/super admin**, I want to see my real in-app notifications when I open the notification screen, so I am informed of account and course events.
- As a user, I want to tap a notification to mark it as read, so the unread badge clears.
- As a user, I want to tap "Mark all read" to clear all unread notifications at once.

---

## API Contract

### §12.1 — List my notifications
**Endpoint:** `GET /me/notifications`
**Auth:** bearer (student, admin, super_admin)
**Query params:** `read=false` (only unread), `limit` (default 20), `cursor`
**Success:** `200` paginated
```json
{
  "items": [
    {
      "id":        "notif-001",
      "userUid":   "...",
      "category":  "enrollment_approved",
      "title":     "Enrollment Approved",
      "body":      "Your enrollment in 'TypeScript' has been approved.",
      "payload":   { "courseId": "course-abc", "enrollmentId": "enr-abc" },
      "readAt":    null,
      "createdAt": "2026-05-06T09:05:00.000Z"
    }
  ],
  "nextCursor": null,
  "total": 3
}
```
**Note:** `readAt: null` = unread. `readAt: <ISO string>` = read.

### §12.2 — Mark single notification read
**Endpoint:** `POST /me/notifications/:id/read`
**Auth:** bearer (any role)
**Request body:** none
**Success:** `200`
```json
{ "id": "notif-001", "readAt": "2026-05-07T10:00:00.000Z" }
```

### §12.3 — Mark all notifications read
**Endpoint:** `POST /me/notifications/read-all`
**Auth:** bearer (any role)
**Request body:** none
**Success:** `200`
```json
{ "markedCount": 3 }
```

---

## Screens / Navigation

- **Modified screens:**
  - `src/screens/student/NotificationsScreen.tsx` — wire `GET /me/notifications`; update `Props` interface to accept API types; add `DebugPanel` for `notifications.list`, `notifications.markRead`, `notifications.markAll`
  - Notification screens are shared by all roles via their respective navigators (`StudentTabs`, `AdminTabs`, `SuperAdminTabs`) — the same screen component handles all three roles

- **Modified stores:**
  - `src/store/notificationsStore.ts` — replace mock-seeded data with real API fetch; add `fetchNotifications()` async action; update `markRead` and `markAllRead` to call the API

- **Navigation changes:** none

---

## State / Stores

- **New API type** (define in service file, do NOT use mock `Notification` from `data/types.ts`):
  - `ApiNotification`: `{ id, userUid, category, title, body, payload, readAt: string|null, createdAt }`
  - `NotificationCategory`: `'registration_approved' | 'registration_rejected' | 'enrollment_pending' | 'enrollment_approved' | 'enrollment_rejected' | 'course_published' | 'system'`

- **Store approach:**
  - `notificationsStore` replaces `byAudience: Record<audience, Notification[]>` with `items: ApiNotification[]` + `loading: boolean` + `unreadCount: number`
  - `fetchNotifications()` calls `GET /me/notifications?limit=50` and updates `items`
  - `markRead(id)` calls `POST /me/notifications/:id/read` then marks item in local state
  - `markAllRead()` calls `POST /me/notifications/read-all` then marks all items locally
  - `unreadCount` derived from `items.filter(n => n.readAt === null).length`

- **Badge counts** on nav tabs derive from `unreadCount` — will update automatically when store is refreshed

---

## UI States

- **Loading (initial fetch):** show `ActivityIndicator` while `loading` is true
- **Empty:** existing `EmptyState` component with "No notifications" message
- **Unread badge:** notification item styled differently when `readAt === null` (bold title, tinted background)
- **Mark single read:** tap notification row → `markRead(id)` → item visually updates immediately (optimistic — mark local state before API call confirms)
- **Mark all read:** "Mark all read" button → `markAllRead()` → toast "X notifications marked as read."
- **Network failure:** toast error; existing data remains visible

---

## Debug messages required

Add a `DebugPanel` to `NotificationsScreen` showing:
- `notifications.list` — the raw `GET /me/notifications` response (items, total, unread count)
- `notifications.markRead` — individual mark-read response
- `notifications.markAll` — mark-all-read response

This debug panel should be visible at the bottom of the screen during development and removed before final PR.

---

## Functional Requirements

- [ ] Create `src/services/notifications.ts`:
  - `ApiNotification` and `NotificationCategory` types
  - `listNotifications(params?: { read?: 'true'|'false'; cursor?: string })` → `GET /me/notifications?limit=50`
  - `markNotificationRead(id: string)` → `POST /me/notifications/${id}/read`
  - `markAllNotificationsRead()` → `POST /me/notifications/read-all`

- [ ] Update `src/store/notificationsStore.ts`:
  - Replace mock-seeded `byAudience` with `items: ApiNotification[]`, `loading: boolean`
  - Add `fetchNotifications()` async action
  - Update `markRead(id)` → call `markNotificationRead(id)` then optimistically update local item's `readAt`
  - Update `markAllRead()` → call `markAllNotificationsRead()` then set all items' `readAt` locally; return `markedCount`
  - Keep `unreadCount` as a derived getter: `items.filter(n => n.readAt === null).length`

- [ ] Update `NotificationsScreen.tsx`:
  - Accept `ApiNotification[]` instead of mock `Notification[]` in props
  - On mount: call `fetchNotifications()` from store (or accept as prop)
  - Render `title` and `body` from `ApiNotification`
  - Show unread indicator when `readAt === null`
  - Map `category` to an icon (use existing icon mapping or a category→icon table)
  - Add `DebugPanel tags={['notifications.list', 'notifications.markRead', 'notifications.markAll']}`

- [ ] Update `StudentTabs.tsx`, `AdminTabs.tsx`, `SuperAdminTabs.tsx`:
  - Call `fetchNotifications()` when the Notifications screen is opened (or on mount inside `StudentNotifications`/`AdminNotifications` wrapper)

---

## Non-Functional Requirements

- [ ] **Performance** — notification list loads within 3 s
- [ ] **Accessibility** — unread items clearly distinguished from read items; touch targets ≥ 44pt
- [ ] **Security** — `payload` field (contains `courseId`, `enrollmentId` etc.) is displayed as context but never used for navigation without validation
- [ ] **Offline** — network failure on fetch → toast + show existing (possibly stale) items

---

## Acceptance Criteria

- [ ] `GET /me/notifications` called on screen open; real notifications appear (verify in DebugPanel)
- [ ] Tapping a notification calls `POST /me/notifications/:id/read`; `readAt` becomes non-null in DebugPanel response
- [ ] "Mark all read" calls `POST /me/notifications/read-all`; `markedCount` shown in toast
- [ ] Unread badge on nav tab clears after mark-all
- [ ] `npx tsc --noEmit` passes

---

## Mock vs Real

- **Replaces mock:** `NOTIFS_STUDENT`, `NOTIFS_ADMIN` seeding in `notificationsStore`; mock `Notification` type in store
- **Still mocked after this feature:** push notifications (requires FCM/custom dev client)

---

## Out of Scope

- Push notifications (requires Firebase Cloud Messaging — needs custom dev client)
- `unreadOnly` filter toggle in UI (API supports `read=false` param — add to future sprint)
- Notification deep-linking (tapping `enrollment_approved` → navigate to that course)

---

## Definition of Done

- [ ] Spec status → `shipped`
- [ ] `src/services/notifications.ts` created
- [ ] `notificationsStore` uses real API data
- [ ] `NotificationsScreen` renders real notifications with DebugPanel
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test: notifications load, mark read, mark all read verified via DebugPanel
- [ ] PR references this spec

---

## References Used

- `CLAUDE.md`
- API Reference §12.1–12.3 (Notifications)
- `src/screens/student/NotificationsScreen.tsx` — current mock-driven implementation
- `src/store/notificationsStore.ts` — mock-seeded store
- `src/navigation/StudentTabs.tsx` — `StudentNotifications` wrapper pattern
