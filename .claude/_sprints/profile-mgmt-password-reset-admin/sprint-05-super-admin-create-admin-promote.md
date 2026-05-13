# Sprint 5: Super Admin — Create Admin + Promote to Admin

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 2–3 h · **Actual:** ~1 h
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Replace the two super admin "coming soon" stubs with real functionality: a form to create a new admin account (`POST /super-admin/admins`) and a button to promote an existing student to admin (`POST /super-admin/users/:uid/make-admin`).

---

## 📋 Tasks

**Create Admin form:**
- [ ] Create `src/screens/superadmin/CreateAdminScreen.tsx`:
  - Fields: First name, Last name, Email, Initial password (masked)
  - Per-field on-blur validation: all required; email format; password must meet API policy (10+ chars, upper, lower, number, special)
  - Submit → call `createAdmin({ firstName, lastName, email, initialPassword })`
  - Loading state: button shows "Creating…" and is disabled during request
  - `EMAIL_EXISTS` → inline error on the email field: "This email is already registered."
  - `VALIDATION_ERROR` → field-level errors from `err.details` rendered inline
  - On success: `toast.success('Admin account created.')` + `navigation.goBack()`
  - Screen uses `useThemedStyles` (dark mode compatible)
- [ ] Add `CreateAdminScreen` to the super admin navigator stack (accessible as a push screen from `AdminsScreen`)
- [ ] Update `src/screens/superadmin/AdminsScreen.tsx`:
  - Replace `toast.info('Invite flow coming soon…')` on the "Invite an admin" `Pressable`
  - New handler: `navigation.navigate('CreateAdmin')`

**Promote to admin:**
- [ ] Update `src/screens/superadmin/UserDetailScreen.tsx`:
  - Add a "Promote to admin" button — visible only when the viewed user's `role === 'student'` AND the current app role is `'super'`
  - On press: show `Alert.alert` confirmation:
    - Title: "Promote to admin?"
    - Message: "[firstName lastName] will gain full admin access while keeping their student enrollments and progress."
    - Buttons: "Cancel" (do nothing) and "Promote"
  - On confirm: call `promoteToAdmin(uid)` with loading state on the button
  - On success:
    - Update the user's record in `usersStore` — set `role` to `'admin'` for that uid
    - `toast.success('[name] promoted to admin.')`
    - Navigate back (the list will reflect the role change from the store update)
  - On error `INVALID_ROLE`: `toast.error('Only student accounts can be promoted to admin.')`
  - On error `USER_NOT_FOUND`: `toast.error('User not found.')`

---

## 📁 Files to Touch

**New:**
- `src/screens/superadmin/CreateAdminScreen.tsx`

**Modified:**
- Super admin navigator (whichever file defines the stack) — add `CreateAdminScreen`
- `src/screens/superadmin/AdminsScreen.tsx` — wire "Invite" button
- `src/screens/superadmin/UserDetailScreen.tsx` — add promote button

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`createAdmin`, `promoteToAdmin` service functions)
- **Blocks:** Sprint 6 (edge-case polish for these screens)
- **External:** none for code writing; backend needed for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `toast.info('… coming soon')` on "Invite an admin" or promote flows
- [ ] `CreateAdminScreen` validates email format and password complexity client-side before any API call
- [ ] `POST /super-admin/admins` request body contains exactly `firstName`, `lastName`, `email`, `initialPassword` — nothing else
- [ ] `initialPassword` is redacted in DebugPanel (via `redactFields` in Sprint 1 service)
- [ ] "Promote to admin" button is hidden for non-student users and non-super-admin viewers
- [ ] Confirmation dialog appears before `promoteToAdmin` is called
- [ ] After successful promote, user's role in `usersStore` reflects `'admin'`

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device (requires backend + super admin account):
- [ ] Navigate to AdminsScreen → tap "Invite an admin" → CreateAdminScreen opens
- [ ] Fill form with duplicate email → `EMAIL_EXISTS` inline error shown
- [ ] Fill form with valid data → success toast → back to AdminsScreen
- [ ] Navigate to a student's UserDetailScreen → "Promote to admin" button visible
- [ ] Confirm promote → success toast → role badge updates on the detail screen

---

## 📝 Notes

- **`POST /super-admin/admins` vs `POST /super-admin/users/:uid/make-admin`** — These are two distinct endpoints with different purposes:
  - `createAdmin` → creates a brand-new admin-only account (no student history)
  - `promoteToAdmin` → promotes an existing student (dual-role: retains student enrollments)
  - Both are needed; do not conflate them.
- **`usersStore` update after promote:** After `promoteToAdmin` succeeds, update the local mock record's `role` field to `'admin'`. This keeps the UI consistent until a full API list re-fetch is implemented.
- **Super admin navigator location:** Check `src/navigation/SuperAdminTabs.tsx` or wherever the super admin stack is defined to find the right place to add `CreateAdminScreen`.

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

**Next:** [`sprint-06-edge-cases-polish.md`](./sprint-06-edge-cases-polish.md)
