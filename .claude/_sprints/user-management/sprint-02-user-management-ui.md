# Sprint 2: User Management UI

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~45 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `UsersScreen` and `UserDetailScreen` to real API — replace `usersStore` reads with live data, and wire suspend/reactivate actions.

---

## 📋 Tasks

**`UsersScreen.tsx`:**
- [ ] Add component state: `users: ApiUser[]`, `loading: boolean`
- [ ] Remove `usersStore` reads (keep `usersStore` import/store itself — just stop reading list from it)
- [ ] `useEffect`: call `listUsers({ role: activeRoleFilter })` on mount and on filter change
- [ ] Show `ActivityIndicator` while `loading`
- [ ] Map `ApiUser` fields to card display: name = `${firstName} ${lastName}`, email, status badge (`status` field), enrolled count = `enrolledCourses`
- [ ] Tap user card → `navigation.navigate('UserDetail', { uid: user.uid })` — pass `uid` string, NOT a full user object

**`UserDetailScreen.tsx`:**
- [ ] Accept `uid: string` from `route.params` (instead of looking up from `usersStore`)
- [ ] Add component state: `user: ApiUserDetail | null`, `loading: boolean`, `actionId: string | null`
- [ ] On mount: call `getUserById(uid)` → set `user`
- [ ] Show loading spinner while `loading`
- [ ] Display real data: `firstName + lastName`, `email`, `role`, `status`, `enrollments[]` list (each shows `courseTitle` + `completionPercent`)
- [ ] **Suspend button** (visible when `user.status === 'approved'`):
  - Open `RejectReasonModal` (or `Alert.alert` placeholder if modal not available on this branch)
  - On confirm: `suspendUser(uid, reason?)` → update local `user.status = 'suspended'`
  - Handle `ALREADY_SUSPENDED` (409) → toast "This account is already suspended."
  - Per-button loading state
- [ ] **Reactivate button** (visible when `user.status === 'suspended'`):
  - `reactivateUser(uid)` → update local `user.status = 'approved'`
  - Handle `ALREADY_ACTIVE` (409) → toast "This account is already active."

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/superadmin/UsersScreen.tsx` — API-driven list
- `src/screens/superadmin/UserDetailScreen.tsx` — getUserById + suspend/reactivate

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`listUsers`, `getUserById`, `suspendUser`, `reactivateUser` exist)
- **Blocks:** Sprint 5 (edge cases for these screens)
- **External:** Requires authenticated admin/super-admin session for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `usersStore` list reads remain in `UsersScreen` or `UserDetailScreen`
- [ ] `navigation.navigate('UserDetail', { uid })` passes a string UID — not a full user object
- [ ] Suspend/reactivate per-button loading state works
- [ ] Real `enrollments[]` list rendered in `UserDetailScreen`

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (requires Firebase + backend):
- [ ] Users tab loads real user list
- [ ] Tap a user → real profile + enrollments shown
- [ ] Tap Suspend → loading → status badge updates

---

## 📝 Notes

- `RejectReasonModal` may not be on `main` yet (it's in `feat/admin-queues`). Use `Alert.alert` as a placeholder for the reason input — the modal can be swapped in when admin-queues merges.
- `UserDetailScreen` currently receives a full `AppUser` object from `usersStore`. Change the route params to accept just `uid: string` and fetch the full detail on mount.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-03-admin-management-ui.md`](./sprint-03-admin-management-ui.md)
