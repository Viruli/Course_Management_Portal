# Sprint 2: Profile Display — Real Data

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Update `ProfileScreen` (student) and `MoreScreen` (admin/super) to display data from `profileStore.apiProfile` when available, falling back to mock data when it is null.

---

## 📋 Tasks

- [ ] Update `src/screens/student/ProfileScreen.tsx`:
  - Read `apiProfile` from `useProfileStore`
  - When `apiProfile` is non-null, use `apiProfile.firstName`, `apiProfile.lastName`, `apiProfile.email`, `apiProfile.profilePhotoUrl` for display
  - Fall back to `profiles.student` when `apiProfile` is null (design build safety net)
  - Pass `apiProfile.profilePhotoUrl` (string or null) to `Avatar` as `photoUri` when available
- [ ] Update `src/screens/admin/MoreScreen.tsx`:
  - Read `apiProfile` from `useProfileStore`
  - When non-null: use `apiProfile.firstName`, `apiProfile.lastName`, `apiProfile.email` in the user card
  - Fall back to `profiles.admin` / `profiles.super` when `apiProfile` is null

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/student/ProfileScreen.tsx`
- `src/screens/admin/MoreScreen.tsx`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 complete (`ApiUserProfile` type needed for `apiProfile` reads)
- **Blocks:** Sprint 3 (`EditProfileScreen` initialises fields from `apiProfile`)
- **External:** none — UI fallback keeps mock working without backend

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] When `apiProfile` is null (mock/dev mode): screens render exactly as before — no regression
- [ ] When `apiProfile` is non-null (after real sign-in): correct real name and email displayed
- [ ] No hard-coded mock strings left in the display paths that use `apiProfile`

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test on device (requires Firebase config + backend):
- [ ] Sign in as student → ProfileScreen shows real first name from `GET /me` response
- [ ] Sign in as admin → MoreScreen user card shows real name/email

---

## 📝 Notes

- The null-fallback pattern ensures the design build still works for demos when `apiProfile` hasn't been populated (e.g. when Firebase config is still placeholder). Do not remove the fallback.
- `profilePhotoUrl` from the API is an HTTPS URL or `null`. Pass it to `Avatar` as `photoUri`. The Avatar component should already handle null gracefully (falls back to initials).

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

## 📊 Retrospective
- **What went well:**
- **What could improve:**
- **Action items for next sprint:**

---

**Next:** [`sprint-03-edit-profile-change-password.md`](./sprint-03-edit-profile-change-password.md)
