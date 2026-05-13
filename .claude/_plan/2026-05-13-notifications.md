# Implementation Plan: Notifications API Integration

**Spec:** [`.claude/_specs/006-notifications.md`](../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 1–2 days (self-contained, no backend dependency for most phases)

---

## 📋 Context

The `notificationsStore` is seeded with mock data (`NOTIFS_STUDENT`, `NOTIFS_ADMIN`). The `NotificationsScreen` takes a mock `Notification[]` prop. This plan wires the screen to real API data from `GET /me/notifications` for all three roles (student, admin, super admin), and adds DebugPanels for testing.

- **Spec:** 006-notifications
- **API Reference:** §12.1 `GET /me/notifications`, §12.2 `POST /me/notifications/:id/read`, §12.3 `POST /me/notifications/read-all`
- **Replaces mock:** `NOTIFS_STUDENT` and `NOTIFS_ADMIN` seeding in `notificationsStore`

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | Single flat `items: ApiNotification[]` in store — no `byAudience` split | API returns notifications for the authenticated user only; the split was only needed because mock data mixed roles | `notificationsStore`, all navigator wrappers |
| 2 | **Optimistic mark-as-read** — set `readAt` locally before API call | Makes the UI feel instant; if the call fails, restore original state | `notificationsStore.markRead` |
| 3 | **Pessimistic mark-all-read** — call API then update local | Mark-all affects many items; better to confirm before clearing all badges | `notificationsStore.markAllRead` |
| 4 | `fetchNotifications()` called when the Notifications screen opens | Keeps data fresh; not called on every render — use a `loaded` flag to avoid duplicate fetches in the same session | `notificationsStore`, navigator wrappers |
| 5 | `readAt: null` = unread (not boolean `read`) | API uses `readAt` timestamp, not a boolean; the mock used `read: boolean` — must update all comparisons | `notificationsStore`, `NotificationsScreen` |
| 6 | DebugPanel added to `NotificationsScreen` (removed before final PR) | Explicitly requested in spec to verify API request/response during testing | `NotificationsScreen` |
| 7 | Same `NotificationsScreen` component serves all roles | The screen already accepts `items` as a prop — just change the prop type and data source | `StudentTabs`, `AdminTabs`, `SuperAdminTabs` |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/notifications.ts`:
  - `NotificationCategory` type: `'registration_approved' | 'registration_rejected' | 'enrollment_pending' | 'enrollment_approved' | 'enrollment_rejected' | 'course_published' | 'system'`
  - `ApiNotification` interface: `{ id, userUid, category: NotificationCategory, title, body, payload: Record<string, unknown>, readAt: string|null, createdAt }`
  - `listNotifications(params?: { read?: 'true'|'false'; cursor?: string })` → `GET /me/notifications?limit=50`, tag: `'notifications.list'`
  - `markNotificationRead(id: string)` → `POST /me/notifications/${id}/read` (no body), tag: `'notifications.markRead'`
  - `markAllNotificationsRead()` → `POST /me/notifications/read-all` (no body); returns `{ markedCount: number }`, tag: `'notifications.markAll'`

### Phase 2: Store Update

- [ ] Update `src/store/notificationsStore.ts`:
  - Remove `NOTIFS_STUDENT`, `NOTIFS_ADMIN` imports and `byAudience` state
  - New state: `items: ApiNotification[]`, `loading: boolean`, `loaded: boolean`
  - Add `fetchNotifications()` async action:
    - If `loaded === true`, skip (don't re-fetch on every navigation)
    - Set `loading = true`
    - Call `listNotifications()`
    - Set `items`, `loaded = true`, `loading = false`
    - On error: toast "Failed to load notifications." + set `loading = false`
  - Update `markRead(id: string)` → **optimistic**: set `readAt` to current ISO timestamp locally first → call `markNotificationRead(id)` → on error: revert `readAt` to original
  - Update `markAllRead()` → **pessimistic**: call `markAllNotificationsRead()` → on success: set all `readAt` to non-null → return `markedCount`; on error: toast
  - Update `unreadCount` getter: `items.filter(n => n.readAt === null).length`
  - Keep the `NotificationAudience` type and any existing exports that other files reference (to avoid cascade breaks) — just update the implementation

### Phase 3: UI Wiring + Debug Panels

- [ ] Update `src/screens/student/NotificationsScreen.tsx`:
  - Change `items` prop type from `Notification[]` → `ApiNotification[]`
  - Use `item.readAt === null` instead of `!item.read` for unread detection
  - Display `item.title` and `item.body` (already exists)
  - Map `item.category` to an icon using a lookup table:
    ```
    registration_approved → UserCheck
    registration_rejected → UserX
    enrollment_approved   → CheckCircle
    enrollment_rejected   → XCircle
    enrollment_pending    → Clock
    course_published      → BookOpen
    system                → Bell (default)
    ```
  - Show unread styling when `readAt === null` (bold title, light tinted background)
  - Add `<DebugPanel tags={['notifications.list', 'notifications.markRead', 'notifications.markAll']} title="Notifications debug" />` at the bottom of the screen
  - Remove `import type { Notification } from '../../data/types'`

- [ ] Update navigator wrappers to call `fetchNotifications()` on open:
  - `StudentTabs.tsx` — update `StudentNotifications` wrapper to call `fetchNotifications()` on mount
  - `AdminTabs.tsx` — update `AdminNotifications` wrapper the same way
  - `SuperAdminTabs.tsx` — find and update the notifications wrapper

- [ ] Update unread badge counts in navigators:
  - Replace `s.byAudience.student.filter(n => !n.read).length` → `s.items.filter(n => n.readAt === null).length`
  - Same for admin audience references

### Phase 4: Edge Cases & Polish

- [ ] `fetchNotifications()` network failure → toast "Failed to load notifications." + `loading = false`; show empty state
- [ ] `markRead` revert on failure: store original `readAt`, if API call fails restore it
- [ ] `markAllRead` network failure → toast "Couldn't mark all as read." + no local state change
- [ ] `loaded` flag prevents duplicate fetches when navigating away and back
- [ ] Dark mode: verify notification items (unread tinted background, icons) correct in both modes
- [ ] Grep check: no mock references (`NOTIFS_STUDENT`, `NOTIFS_ADMIN`, `byAudience`) remain in touched files

### Phase 5: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires Firebase + backend)
- [ ] Sign in as student → bell icon → Notifications screen opens → real notifications load
- [ ] Check DebugPanel `notifications.list` entry — verify `items[]` shape, `readAt: null` for unread
- [ ] Tap an unread notification → check DebugPanel `notifications.markRead` — `readAt` becomes a timestamp
- [ ] Notification visually changes to "read" styling
- [ ] Tap "Mark all read" → check DebugPanel `notifications.markAll` — `markedCount` in response
- [ ] Toast "X notifications marked as read." shown
- [ ] Unread badge on bell icon clears
- [ ] Sign in as admin → More → bell icon → admin notifications load from same API
- [ ] Network off → open notifications → toast shown, no crash

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/notifications.ts` | **new** | `listNotifications`, `markNotificationRead`, `markAllNotificationsRead` |
| `src/store/notificationsStore.ts` | modified | Replace mock seeding with API types + async actions |
| `src/screens/student/NotificationsScreen.tsx` | modified | Accept `ApiNotification[]`, add DebugPanel, update unread logic |
| `src/navigation/StudentTabs.tsx` | modified | `StudentNotifications` wrapper calls `fetchNotifications()` |
| `src/navigation/AdminTabs.tsx` | modified | Admin notifications wrapper + unread count |
| `src/navigation/SuperAdminTabs.tsx` | modified | Super admin notifications wrapper + unread count |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go
- [ ] Happy path: notifications load, DebugPanel shows API response, mark read works
- [ ] Error path: network off → toast shown, no crash
- [ ] Toggle dark mode on NotificationsScreen → items render correctly
- [ ] Badge count clears after mark-all-read

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` introduced
- [ ] No `NOTIFS_STUDENT`, `NOTIFS_ADMIN`, or `byAudience` references in touched files
- [ ] `readAt === null` used for unread detection (not `!item.read`)
- [ ] DebugPanel visible in `NotificationsScreen` during testing
- [ ] `POST /me/notifications/read-all` body: empty (no body sent)
- [ ] `POST /me/notifications/:id/read` body: empty
- [ ] Loading + error UI states present
- [ ] All phases completed
- [ ] Spec status → `shipped`
- [ ] PR references spec

---

## 📝 Progress Tracking

**Status legend:**
- 🟡 Draft — Planning stage
- 🔵 In Progress — Implementation started
- 🟢 Complete — All phases done
- 🔴 Blocked — Waiting on dependency

**Current Phase:** Phase 1
**Completion:** 0%

---

## 📌 Notes

- **`loaded` flag:** `fetchNotifications()` checks `loaded` before calling the API — this prevents a re-fetch every time the user opens and closes the bell screen in the same session. To force a refresh, reset `loaded = false` (e.g., after mark-all-read).
- **Badge count cascade:** Multiple navigators read unread count from the store. After replacing `byAudience`, search for all `byAudience` references across `AdminTabs`, `SuperAdminTabs`, and `AdminDashboardScreen` — they all need updating.
- **`NotificationsScreen` props breaking change:** Changing `items: Notification[]` to `items: ApiNotification[]` is a breaking change. All navigator wrappers that pass `items` must be updated in Phase 3. Check `StudentTabs`, `AdminTabs`, `SuperAdminTabs` wrappers.
- **DebugPanel removal:** The DebugPanel is added in Phase 3 as explicitly requested. It must be removed before the final PR is merged. Add a comment `// DEBUG — remove before PR` to make it obvious.
