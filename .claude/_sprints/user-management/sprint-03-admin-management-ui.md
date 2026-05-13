# Sprint 3: Admin Management UI

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `AdminsScreen` to real API — replace `usersStore` mock list with live admins and wire suspend, reactivate, and delete actions.

---

## 📋 Tasks

**`AdminsScreen.tsx`:**
- [ ] Add component state: `admins: ApiUser[]`, `loading: boolean`, `actionId: string | null`
- [ ] Remove `usersStore` reads for the admin list
- [ ] On mount: call `listAdmins()` → set `admins`
- [ ] Show `ActivityIndicator` while `loading`
- [ ] Map `ApiUser` fields to card: name = `${firstName} ${lastName}`, email, status badge
- [ ] "Invite an admin" button: keep as-is (already wired to `CreateAdminScreen` from `feat/profile-mgmt`) — do NOT change it
- [ ] 3-dot menu per admin card — wire each action with per-item loading (`actionId === admin.uid`):
  - **Suspend** → open `RejectReasonModal` (or `Alert.alert` placeholder) for optional reason → `suspendAdmin(uid, reason?)` → update status badge in local list
  - **Reactivate** → `reactivateAdmin(uid)` → update status badge
  - **Delete** → `Alert.alert` confirmation "Delete [name]? This cannot be undone." → `deleteAdmin(uid)` → remove from local list; handle `USER_NOT_FOUND` (404) → toast + remove anyway

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/superadmin/AdminsScreen.tsx`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`listAdmins`, `suspendAdmin`, `reactivateAdmin`, `deleteAdmin` exist)
- **Blocks:** Sprint 5 (edge cases)
- **External:** Requires super admin session for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `usersStore` list reads remain in `AdminsScreen`
- [ ] Delete shows confirmation dialog before calling API
- [ ] `deleteAdmin` removes item from local list on success
- [ ] Per-item loading state disables the 3-dot menu while action is in flight

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (requires super admin session):
- [ ] Admins tab loads real admin list
- [ ] Suspend admin → status badge updates
- [ ] Delete admin → confirmation → admin removed from list

---

## 📝 Notes

- Only super admins see `AdminsScreen` — `AdminsScreen` is only rendered in `SuperAdminTabs`. No role check needed in the screen itself; the navigator handles access control.
- The "Invite an admin" button was wired to `CreateAdminScreen` in `feat/profile-mgmt-password-reset-admin`. On this branch (off main), that screen doesn't exist yet. Leave the button as-is (pointing to `navigation.navigate('CreateAdmin')`) — it will work once that branch merges.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-04-audit-log-ui.md`](./sprint-04-audit-log-ui.md)
