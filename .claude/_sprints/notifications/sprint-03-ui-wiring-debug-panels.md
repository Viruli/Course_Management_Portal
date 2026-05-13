# Sprint 3: UI Wiring + Debug Panels

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~20 min (done with Sprint 2)
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Update `NotificationsScreen` to accept `ApiNotification[]`, add category→icon mapping, add DebugPanel, and wire `fetchNotifications()` in all three navigator wrappers.

---

## 📋 Tasks

**`NotificationsScreen.tsx`:**
- [ ] Change `items` prop type from `Notification[]` → `ApiNotification[]`
- [ ] Remove `import type { Notification } from '../../data/types'`
- [ ] Add import for `ApiNotification` from `src/services/notifications.ts`
- [ ] Update unread detection: `item.readAt === null` instead of `!item.read`
- [ ] Add category → icon mapping table:
  ```
  registration_approved → UserCheck
  registration_rejected → UserX
  enrollment_approved   → CheckCircle
  enrollment_rejected   → XCircle
  enrollment_pending    → Clock
  course_published      → BookOpen
  system / default      → Bell
  ```
- [ ] Show visual unread styling when `item.readAt === null` (bold title, tinted card background)
- [ ] Show `item.title` (already exists — confirm field name matches API)
- [ ] Show `item.body` (already exists — confirm field name matches API)
- [ ] Add `DebugPanel` at the bottom of the screen (before closing ScrollView tag):
  ```tsx
  {/* DEBUG — remove before PR */}
  <DebugPanel
    tags={['notifications.list', 'notifications.markRead', 'notifications.markAll']}
    title="Notifications debug"
  />
  ```

**Navigator wrappers — call `fetchNotifications()` on open:**
- [ ] `StudentTabs.tsx` — `StudentNotifications` wrapper: add `useEffect(() => { fetchNotifications(); }, [])` (call once on mount)
- [ ] `AdminTabs.tsx` — find `AdminNotifications` wrapper (or wherever the admin bell navigates): add same `useEffect`
- [ ] `SuperAdminTabs.tsx` — find the super admin notifications wrapper: add same `useEffect`

**Navigator wrappers — update `items` prop:**
- [ ] Pass `items` from `useNotificationsStore(s => s.items)` instead of `s.byAudience.student` / `s.byAudience.admin`
- [ ] Pass `loading` state down if `NotificationsScreen` needs it for a spinner

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/student/NotificationsScreen.tsx` — accept `ApiNotification[]`, category icons, unread styling, DebugPanel
- `src/navigation/StudentTabs.tsx` — `StudentNotifications` wrapper: `fetchNotifications()` on mount
- `src/navigation/AdminTabs.tsx` — admin wrapper: same
- `src/navigation/SuperAdminTabs.tsx` — super admin wrapper: same

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 2 (store has `items: ApiNotification[]` and `fetchNotifications()`)
- **Blocks:** Sprint 4 (edge case polish)
- **External:** none for code writing; backend needed for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `NotificationsScreen` no longer imports `Notification` from `data/types`
- [ ] DebugPanel visible in the screen (tagged with all three notification tags)
- [ ] `fetchNotifications()` called on mount in all three navigator wrappers
- [ ] Unread items visually distinct from read items

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (requires Firebase + backend):
- [ ] Open notifications screen → DebugPanel shows `notifications.list` response
- [ ] Tap a notification → DebugPanel shows `notifications.markRead` with `readAt` timestamp

---

## 📝 Notes

- The `DebugPanel` import: `import { DebugPanel } from '../../components/DebugPanel'` (for screens in `src/screens/student/`). Adjust path for other screens.
- Icon imports for the category map: check which are already imported in `NotificationsScreen` and add any missing ones from `lucide-react-native`.
- The `onMarkAll` prop currently calls `markAllRead('student')` with an audience arg — after the store update, it should call `markAllRead()` with no args. Update all wrapper call sites.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-04-edge-cases-polish.md`](./sprint-04-edge-cases-polish.md)
