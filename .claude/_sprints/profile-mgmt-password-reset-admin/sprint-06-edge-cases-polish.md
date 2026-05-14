# Sprint 6: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~15 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden all new/modified screens against network failures and verify dark mode rendering across all changes.

---

## 📋 Tasks

- [ ] `EditProfileScreen` — network failure on PATCH /me: show `toast.error`; stay on screen with form data intact
- [ ] `EditProfileScreen` — network failure on `POST /me/change-password`: show `toast.error`; clear state preserved
- [ ] `PasswordResetScreen` — network failure: show `toast.error`; email field not cleared
- [ ] `CreateAdminScreen` — network failure on submit: show `toast.error`; all form fields preserved
- [ ] `UserDetailScreen` promote — network failure after confirm: show `toast.error`; button re-enabled
- [ ] Verify all `ApiError` cases in the touched flows are handled (no unhandled `UNKNOWN_ERROR` surfaces to the user as a raw code)
- [ ] Dark mode check — `PasswordResetScreen`: all text, inputs and buttons themed correctly
- [ ] Dark mode check — `CreateAdminScreen`: all fields, errors and buttons themed correctly
- [ ] Dark mode check — `EditProfileScreen` password section: updated validation messages themed correctly
- [ ] Dark mode check — `UserDetailScreen` promote button: correct colours in both modes
- [ ] Final grep: confirm no `toast.info('… coming soon')` remains on any of the touched flows

---

## 📁 Files to Touch

**New:** none
**Modified:** any screens from Sprints 3–5 that need error-handling or styling fixes
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 3, 4, 5 complete
- **Blocks:** Sprint 7 (manual test)
- **External:** none — polish only

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during any save/submit → toast shown, form not cleared, no crash
- [ ] All new screens render correctly in dark mode
- [ ] `grep` for coming-soon stubs on touched flows returns clean

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Check for leftover stubs
grep -r "coming soon" src/screens/auth/PasswordResetScreen.tsx \
  src/screens/superadmin/CreateAdminScreen.tsx \
  src/screens/superadmin/AdminsScreen.tsx \
  src/screens/superadmin/UserDetailScreen.tsx 2>&1 || echo "CLEAN"
```

Manual test (dark mode — can do on device without backend):
- [ ] Switch device to dark mode → open each new/modified screen → visually confirm

---

## 📝 Notes

- Form-data preservation on network failure is important for UX — a user who typed a long form should not lose their work because of a dropped connection.
- The `ApiError` `UNKNOWN_ERROR` case should always surface as a generic toast ("Something went wrong. Please try again.") — never expose the raw error code to the user.

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

**Next:** [`sprint-07-manual-test-on-device.md`](./sprint-07-manual-test-on-device.md)
