# Sprint 4: Audit Log UI

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `AuditScreen` to real API — replace `AUDIT` mock with live audit log entries, and map UI filter pills to `category` API param.

---

## 📋 Tasks

**`AuditScreen.tsx`:**
- [ ] Add component state: `entries: ApiAuditEntry[]`, `loading: boolean`
- [ ] Remove `AUDIT` mock import; remove `AuditTone` type usage
- [ ] On mount: call `getAuditLog()` → set `entries`
- [ ] Show `ActivityIndicator` while `loading`
- [ ] On filter pill change: re-call `getAuditLog({ category: mappedCategory })` where:
  - "All" → no category param (undefined)
  - "Approvals" → `category: 'enrollment'`
  - "Changes" → `category: 'user'`
  - "Warnings" → no category (show all — `undefined`)
- [ ] Display each entry:
  - Actor: `entry.actor?.email ?? 'System'`
  - Action: `entry.action` (e.g. `registration.approved`)
  - Target: `entry.targetType` + optional `entry.targetId`
  - Time: formatted `entry.when` (relative date helper — same pattern as `NotificationsScreen`)
- [ ] Map `entry.category` to icon/colour:
  - `enrollment` → green ✓ (`CheckCircle`)
  - `user` → blue info (`User`)
  - `auth` → orange (`Key`)
  - `course` → purple (`BookOpen`)
  - `system` / default → grey (`Activity`)
- [ ] Remove the "Export" icon button stub OR keep as toast "Export coming soon." (acceptable stub — not in scope)

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/admin/AuditScreen.tsx`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`getAuditLog`, `ApiAuditEntry` exist)
- **Blocks:** Sprint 5 (edge cases)
- **External:** Requires authenticated admin session for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `AUDIT` mock import remains in `AuditScreen`
- [ ] `actor?.email ?? 'System'` pattern used (handles null actor for system events)
- [ ] Filter pills trigger API re-fetch with `category` param
- [ ] Loading indicator shown while fetching

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (requires admin session + backend):
- [ ] Audit screen loads real entries
- [ ] Tap "Approvals" filter → only enrollment-category entries shown
- [ ] Actor email displayed (or "System" for system events)

---

## 📝 Notes

- `entry.when` is an ISO 8601 timestamp (same as `ApiNotification.createdAt`). Reuse the `formatDate` helper from `NotificationsScreen` or create a shared utility.
- The mock `AuditTone` type (`success`|`info`|`warning`) maps to UI colours — replace this logic with a `category → colour` mapping based on `entry.category`.
- The filter pill values in the existing UI are `'all' | 'success' | 'info' | 'warning'` — keep these for the UI state but map them to API `category` values in the fetch call.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-05-edge-cases-polish.md`](./sprint-05-edge-cases-polish.md)
