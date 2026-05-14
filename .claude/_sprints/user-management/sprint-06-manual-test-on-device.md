# Sprint 6: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🔵 In Progress
**Estimated:** 1–2 h · **Actual:** ___
**Started:** 2026-05-14 · **Completed:** ___

---

## 🎯 Sprint Goal
Verify the full user/admin management and audit log flows on a real device against the production backend.

> ⚠️ Requires Firebase config + backend at `https://cms.api.bethelnet.au/api/v1`. Admin and super admin sessions needed.

---

## 📋 Tasks

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go

**User management (admin or super admin role):**
- [ ] Users tab → real user list loads (check `users.list` tag in DebugPanel if available)
- [ ] Tap a user → `getUserById` loads real profile + enrollment history
- [ ] Tap Suspend on an approved user → reason modal → confirm → status badge changes to "Suspended"
- [ ] Navigate back and re-open user → status still "Suspended" (fetched fresh from API)
- [ ] Tap Reactivate → status changes back to "Approved"
- [ ] `ALREADY_SUSPENDED` test: try suspending an already-suspended user → toast shown

**Admin management (super admin role):**
- [ ] Admins screen loads real admin list
- [ ] Suspend an admin → status badge updates
- [ ] Reactivate the same admin → status badge updates
- [ ] Delete an admin → confirmation dialog → admin removed from list

**Audit log (admin or super admin):**
- [ ] Audit screen loads real entries with actor emails + actions
- [ ] Tap "Approvals" filter → re-fetches with `category=enrollment`
- [ ] Tap "All" → all entries shown again
- [ ] Entries show formatted relative dates (e.g. "3h ago")

**Error path:**
- [ ] Turn off Wi-Fi → open Users tab → toast shown, no crash

**Dark mode:**
- [ ] Toggle dark mode on each screen → all render correctly

**Final:**
- [ ] `npx tsc --noEmit` — passes clean
- [ ] No `console.error` in Metro

---

## 📁 Files to Touch

**New / Modified / Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–5 all 🟢 Complete
- **External:** Firebase + backend; admin and super admin test accounts

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro

---

## 📌 Notes

- To test suspend/reactivate safely, use a test account that is NOT the account you're currently logged into.
- The audit log will only show entries if real platform events have occurred (registrations approved, enrollments processed, etc.). If the audit log is empty, that's correct behaviour — it's not a bug.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

## ✅ Closing the Loop
When this sprint is 🟢:
1. Update `.claude/_plan/2026-05-13-user-management.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/007-user-management.md` → **Status: shipped**
3. Push `feat/user-management` and open PR into `main`
4. Reference spec + sprint folder in the PR description
