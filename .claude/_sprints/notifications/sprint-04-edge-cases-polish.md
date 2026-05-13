# Sprint 4: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Status:** 🟢 Complete
**Estimated:** 30 min · **Actual:** ~10 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden the notification flow against network failures, verify the optimistic mark-read revert, confirm dark mode, and do a final stub check.

---

## 📋 Tasks

- [ ] `fetchNotifications` network failure → toast "Failed to load notifications." + show empty state (not a crash)
- [ ] `markRead` failure → revert `readAt` to its original value + toast "Couldn't mark as read."
- [ ] `markAllRead` network failure → toast "Couldn't mark all as read." + no local state change
- [ ] `loaded` flag: verify opening notifications, going back, and re-opening does NOT trigger a second fetch (check Metro — only one `notifications.list` call)
- [ ] Dark mode: unread item background tint and bold title render correctly in dark mode
- [ ] Dark mode: DebugPanel renders correctly in dark mode (it always uses `surface2` — should be fine)
- [ ] Final grep: no `byAudience`, `NOTIFS_STUDENT`, `NOTIFS_ADMIN` in any touched file
- [ ] `npx tsc --noEmit` clean pass

---

## 📁 Files to Touch

**New:** none
**Modified:** any files from Sprints 2–3 that need error-handling fixes
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 2 + 3 complete
- **Blocks:** Sprint 5 (manual test)
- **External:** none — polish only

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during fetch → toast, empty state shown, no crash
- [ ] Optimistic mark-read reverts correctly on failure
- [ ] No mock references in touched files
- [ ] Unread/read styling correct in dark mode

---

## 🧪 Verification

```bash
npx tsc --noEmit

grep -rn "byAudience\|NOTIFS_STUDENT\|NOTIFS_ADMIN" \
  src/store/notificationsStore.ts \
  src/navigation/StudentTabs.tsx \
  src/navigation/AdminTabs.tsx \
  src/navigation/SuperAdminTabs.tsx 2>&1 || echo "CLEAN"
```

---

## 📝 Notes

- The `loaded` flag check: after navigating to notifications and back, open the Metro console and confirm only ONE `notifications.list` DebugPanel entry appears per session (not two).
- The optimistic revert: to test, temporarily make `markNotificationRead` always throw, tap a notification, and confirm the unread styling comes back.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-05-manual-test-on-device.md`](./sprint-05-manual-test-on-device.md)
