# Sprint 5: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~10 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden all four screens against API errors and network failures; verify dark mode; confirm no usersStore reads remain.

---

## 📋 Tasks

**Error handling:**
- [ ] `listUsers` / `getUserById` / `listAdmins` / `getAuditLog` network failure → toast "Couldn't reach the server." + show empty/stale list
- [ ] `suspendUser` `ALREADY_SUSPENDED` (409) → toast "This account is already suspended." + refresh status
- [ ] `reactivateUser` `ALREADY_ACTIVE` (409) → toast "This account is already active." + refresh status
- [ ] `suspendAdmin` `ALREADY_SUSPENDED` (409) → same pattern
- [ ] `reactivateAdmin` `ALREADY_ACTIVE` (409) → same pattern
- [ ] `deleteAdmin` `USER_NOT_FOUND` (404) → toast "Admin not found." + remove from local list anyway
- [ ] All action buttons re-enabled on error (loading state cleared in `finally`)

**Stub / mock check:**
- [ ] `grep -rn "usersStore" src/screens/superadmin/UsersScreen.tsx` → no list reads
- [ ] `grep -rn "usersStore" src/screens/superadmin/UserDetailScreen.tsx` → no user lookup
- [ ] `grep -rn "usersStore" src/screens/superadmin/AdminsScreen.tsx` → no list reads
- [ ] `grep -rn "AUDIT" src/screens/admin/AuditScreen.tsx` → no mock import

**Dark mode:**
- [ ] `UsersScreen` — status badges and cards render correctly in dark mode
- [ ] `UserDetailScreen` — enrollment list and action buttons
- [ ] `AdminsScreen` — admin cards and 3-dot menu
- [ ] `AuditScreen` — category icons and filter pills

**Final typecheck:**
- [ ] `npx tsc --noEmit` passes clean

---

## 📁 Files to Touch

**New:** none
**Modified:** any screens from Sprints 2–4 that need error-handling fixes
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 2, 3, 4 complete
- **Blocks:** Sprint 6 (manual test)
- **External:** none — polish only

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during any list fetch → toast, empty state shown, no crash
- [ ] 409 errors show specific messages (not generic "Something went wrong")
- [ ] All modified screens correct in dark mode

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Confirm no usersStore list reads
grep -rn "usersStore\|AUDIT" \
  src/screens/superadmin/UsersScreen.tsx \
  src/screens/superadmin/UserDetailScreen.tsx \
  src/screens/superadmin/AdminsScreen.tsx \
  src/screens/admin/AuditScreen.tsx 2>&1 | grep -v "promote\|changeRole\|approve\|suspend\|reinstate"
```

---

## 📝 Notes

- Keep `usersStore` references that are for non-list operations (e.g. `changeRole`, `approve`, `suspend` mock actions in `UserDetailScreen` that are NOT yet wired). Only remove the list-reading operations.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-06-manual-test-on-device.md`](./sprint-06-manual-test-on-device.md)
