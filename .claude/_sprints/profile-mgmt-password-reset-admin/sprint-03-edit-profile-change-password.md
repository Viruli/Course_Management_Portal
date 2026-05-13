# Sprint 3: Edit Profile + Change Password

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~40 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `EditProfileScreen` to real API calls: `PATCH /me` for name changes and `POST /me/change-password` for password updates. Remove the misaligned "Current password" field and update password validation to match the API policy.

---

## 📋 Tasks

- [ ] Update `EditProfileScreen` initial state: when `apiProfile` is non-null, seed `firstName`/`lastName` state from `apiProfile` instead of mock `profiles[role]`
- [ ] Add `saving` state (`boolean`) — Save button shows "Saving…" and is disabled during the request
- [ ] Wire Save button for name change → call `updateMyProfile({ firstName: firstName.trim(), lastName: lastName.trim() })`
  - On success: `profileStore.setProfile(result.data)` + `toast.success('Profile updated.')` + `onBack()`
  - On error: `toast.error(err.message)`; stay on screen
- [ ] **Remove** the "Current password" input field and its state (`currentPwd`) — `POST /me/change-password` does not accept it
- [ ] Update password validation regex to API policy: min 10 chars + uppercase + lowercase + number + special character
  - Use the same `PASSWORD_RULE` regex already defined in `SignUpScreen.tsx`
  - Update the password placeholder to "At least 10 characters" and hint text accordingly
- [ ] Wire change-password section → when Save is pressed and the password section is open with a valid `newPwd`:
  - Call `changePassword(newPwd)`
  - On success: toast "Password updated." + clear `newPwd` + `confirmPwd`
  - On error `VALIDATION_ERROR`: show inline error below the new-password field
  - On other error: `toast.error(err.message)`
- [ ] Handle the case where both name and password are changed in a single Save: call `updateMyProfile` first, then `changePassword` if the password section is open and valid. If the name call succeeds but password call fails, report the partial success clearly.

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/shared/EditProfileScreen.tsx`

**Deleted:** none (the currentPwd field is removed from this file)

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`updateMyProfile`, `changePassword` service functions) + Sprint 2 (`apiProfile` in store)
- **Blocks:** Sprint 6 (edge-case polish for this screen)
- **External:** none for code writing; backend needed for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] "Current password" input field no longer appears in the UI
- [ ] Password validation requires 10+ chars + complexity — a 6-char password is rejected client-side before any API call
- [ ] Save button disabled and shows "Saving…" during the request
- [ ] Successful name save updates `profileStore.apiProfile` and navigates back
- [ ] Successful password change clears the password fields and shows toast
- [ ] `PATCH /me` request body contains only `firstName` and `lastName` — no `profilePhotoUrl` or other fields

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test on device (requires backend):
- [ ] Edit name → save → ProfileScreen immediately shows new name
- [ ] Change password to "short" → inline validation error, no API call
- [ ] Change password to valid → toast "Password updated.", fields cleared

---

## 📝 Notes

- The `PASSWORD_RULE` regex is already defined in `SignUpScreen.tsx` as a module-level constant. Extract it to a shared location (e.g. `src/utils/validation.ts`) or just copy it to avoid duplication — your call.
- Photo upload (the camera/gallery buttons) stays as local-only `profileStore.setPhoto` for now. Do not touch photo logic in this sprint.
- If both name and password are changed, run them as two sequential API calls (not parallel), since a failure in either needs to be reported independently.

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

**Next:** [`sprint-04-password-reset-flow.md`](./sprint-04-password-reset-flow.md)
