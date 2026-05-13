# Sprint 5: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Status:** 🟡 Not Started
**Estimated:** 1 h · **Actual:** ___
**Started:** ___ · **Completed:** ___

---

## 🎯 Sprint Goal
Verify the full notification flow end-to-end on a real device using DebugPanels to confirm every API call and response.

> ⚠️ Requires Firebase config + backend at `https://cms.api.bethelnet.au/api/v1`.

---

## 📋 Tasks

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go

**Student notifications:**
- [ ] Sign in as student → tap the bell icon → Notifications screen opens
- [ ] DebugPanel shows `notifications.list` entry with real notification items
- [ ] Verify item shape: `id`, `category`, `title`, `body`, `readAt: null` for unread
- [ ] Unread items visually distinct (bold title, tinted background)
- [ ] Tap an unread notification → DebugPanel shows `notifications.markRead` with `readAt` timestamp in response
- [ ] Item immediately shows "read" styling (optimistic update confirmed)
- [ ] Tap "Mark all read" → DebugPanel shows `notifications.markAll` with `markedCount`
- [ ] Toast "X notifications marked as read." shown
- [ ] Unread badge on bell icon clears (navigate away and back to verify)

**Admin notifications:**
- [ ] Sign in as admin → bell icon → notifications load
- [ ] Same verification as student path

**Error path:**
- [ ] Turn off Wi-Fi → open notifications → toast shown, no crash, empty/stale list shown

**Badge count:**
- [ ] Sign in, note unread badge count on bell icon
- [ ] Open notifications, mark all read → badge count goes to 0
- [ ] Navigate away and back to notifications → no duplicate fetch (verify only one `notifications.list` in DebugPanel)

**Dark mode:**
- [ ] Toggle dark mode on NotificationsScreen → items, DebugPanel all themed correctly

**Final:**
- [ ] `npx tsc --noEmit` — clean
- [ ] No `console.error` in Metro

---

## 📁 Files to Touch

**New / Modified / Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–4 all 🟢 Complete
- **External:** Firebase config + backend (`https://cms.api.bethelnet.au/api/v1`)

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro
- [ ] DebugPanel `notifications.list` body verified: items have `readAt: null` for unread
- [ ] `notifications.markRead` response shows `readAt` as a non-null timestamp
- [ ] `notifications.markAll` response shows `markedCount`

---

## 📝 Notes

- **Remove DebugPanel before final PR.** It was added for testing. The spec says to remove it before merging. Check `NotificationsScreen.tsx` for the `// DEBUG — remove before PR` comment.
- The backend generates notifications as side effects of events (registration approved, enrollment approved, etc.). To generate test notifications, have an admin approve a registration or enrollment for the test student account.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

## ✅ Closing the Loop
When this sprint is 🟢:
1. **Remove DebugPanel from `NotificationsScreen.tsx`** before opening the PR
2. Update `.claude/_plan/2026-05-13-notifications.md` → **Status: 🟢 Complete**
3. Update `.claude/_specs/006-notifications.md` → **Status: shipped**
4. Push `feat/notifications` and open PR into `main`
5. Reference spec + sprint folder in the PR description
