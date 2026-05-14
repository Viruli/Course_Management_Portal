# Implementation Plan: Profile Management, Password Reset and Admin Creation

**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 2–3 days (device testing blocked on backend + Firebase config)

---

## 📋 Context

Profile screens currently show mock data seeded from `profileStore.profiles.*`. The `apiProfile` field now exists in `profileStore` (from Sprint 2) but nothing reads it yet. This plan wires the real profile data end-to-end, adds real save/password-change flows, creates a password reset screen, and implements the two super admin admin-management actions.

All service calls follow the API Reference v1.1.0 contract exactly. Code can be written and TypeScript-verified without the backend running; end-to-end testing waits for the backend.

- **Spec:** 002-profile-mgmt-password-reset-admin
- **API Reference:** §2.3, §3.1–3.3, §14.2, §14.7
- **Replaces mock:** profile display in all 3 role screens; EditProfileScreen mock save; "coming soon" stubs for forgot password, invite admin, promote to admin

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | `apiProfile` null-safe fallback to mock `profiles.*` | Design build stays usable when not signed in with real auth | `ProfileScreen`, `MoreScreen` |
| 2 | Wire firstName/lastName only in PATCH /me — no photo upload yet | `PATCH /me` requires an HTTPS `profilePhotoUrl`; local `file://` URIs are rejected. Cloud storage upload needs Firebase Storage (custom dev client — deferred). | `EditProfileScreen`, `src/services/profile.ts` |
| 3 | Remove "current password" field from change-password UI | `POST /me/change-password` takes only `newPassword` — no current password param in the API. Firebase already validates identity via the Bearer token. | `EditProfileScreen` |
| 4 | Password validation updated to API policy: 10+ chars + upper + lower + number + special | Currently the UI validates 6+ chars. Mismatch would cause `VALIDATION_ERROR` on the server every time. | `EditProfileScreen` |
| 5 | `updateMyProfile` calls `profileStore.setProfile` on success | Keeps `apiProfile` in sync without a full re-fetch of `GET /me`. | `src/services/profile.ts`, `EditProfileScreen` |
| 6 | `PasswordResetScreen` is a push screen in `AuthFlow` stack | Simplest navigation — no modal needed; back button returns to SignIn. | `AuthFlow.tsx` |
| 7 | `CreateAdminScreen` is a push screen in the super admin navigator | Consistent with other detail/create screens. | Super admin navigator |
| 8 | Promote-to-admin shows a confirmation alert before calling API | Destructive-ish action — user should confirm before promoting | `UserDetailScreen` |
| 9 | After successful promote, update `usersStore` local record and navigate back | Avoids a full list re-fetch; keeps UI snappy. Real-time accuracy comes when backend integration is complete. | `UserDetailScreen`, `usersStore` |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/profile.ts`:
  - `updateMyProfile(patch: { firstName?: string; lastName?: string })` → `PATCH /me`; returns `ApiUserProfile`
  - `changePassword(newPassword: string)` → `POST /me/change-password`; returns `{ message: string }`
  - Use `redactFields: ['newPassword']` on the change-password call
- [ ] Add `resetPassword(email: string)` to `src/services/auth.ts` → `POST /auth/password-reset`; returns `{ message: string }`; always returns 200
- [ ] Create `src/services/admins.ts`:
  - `CreateAdminPayload` interface: `{ firstName, lastName, email, initialPassword }`
  - `createAdmin(payload: CreateAdminPayload)` → `POST /super-admin/admins`; returns `ApiUserProfile`
  - `promoteToAdmin(uid: string)` → `POST /super-admin/users/:uid/make-admin`; returns updated `ApiUserProfile`
  - Use `redactFields: ['initialPassword']` on create-admin call

### Phase 2: Profile Display — Real Data

- [ ] Update `src/screens/student/ProfileScreen.tsx`:
  - Read `apiProfile` from `profileStore`; when non-null use `apiProfile.firstName`, `apiProfile.lastName`, `apiProfile.email`, `apiProfile.profilePhotoUrl`
  - Fall back to `profiles.student` when `apiProfile` is null (design build safety net)
- [ ] Update `src/screens/admin/MoreScreen.tsx`:
  - Same pattern: read `apiProfile` when available, fall back to `profiles.admin / profiles.super`
  - Update name display, email, photo URI

### Phase 3: Edit Profile + Change Password

- [ ] Update `src/screens/shared/EditProfileScreen.tsx`:
  - Initialise `firstName`/`lastName` state from `apiProfile` when non-null (current code reads from mock `profiles[role]`)
  - Wire Save button → call `updateMyProfile({ firstName, lastName })` → on success: `profileStore.setProfile(result)` + `toast.success('Profile updated.')` + `onBack()`
  - Add `saving` state — button shows "Saving…" and is disabled during the request
  - **Remove** the "Current password" input field — the API does not accept it
  - Update password validation: 10+ chars, uppercase, lowercase, number, special character (use same `PASSWORD_RULE` regex from `SignUpScreen`)
  - Wire change-password section → call `changePassword(newPwd)` on Save when the password section is expanded and `newPwd` is valid
  - On successful password change: toast "Password updated." + clear the password fields
  - Show inline `VALIDATION_ERROR` details below the affected field

### Phase 4: Password Reset Flow

- [ ] Create `src/screens/auth/PasswordResetScreen.tsx`:
  - Email input field (pre-filled if `route.params.email` is provided)
  - Submit button → `resetPassword(email)` → show confirmation message on success
  - Show loading state "Sending…" during request
  - After success show static confirmation: "If an account exists for this email, a reset link has been sent." — do not auto-navigate away
  - Network failure → toast error
- [ ] Add `PasswordResetScreen` to `src/navigation/AuthFlow.tsx` stack (push screen, accessible from SignIn)
- [ ] Update `src/screens/auth/SignInScreen.tsx`:
  - Replace `toast.info('Password reset — coming soon.')` with `navigation.navigate('PasswordReset', { email })` passing the current email field value

### Phase 5: Super Admin — Create Admin + Promote

- [ ] Create `src/screens/superadmin/CreateAdminScreen.tsx`:
  - Fields: First name, Last name, Email, Initial password (password input, masked)
  - Per-field on-blur validation (same pattern as SignUpScreen): all required, email format, password 10+ chars + complexity
  - Submit → `createAdmin(payload)` → toast "Admin account created." + `navigation.goBack()`
  - Loading state "Creating…" on submit button
  - `EMAIL_EXISTS` → inline error on email field
  - `VALIDATION_ERROR` → field-level errors
- [ ] Add `CreateAdminScreen` to the super admin navigator (stack screen accessible from `AdminsScreen`)
- [ ] Update `src/screens/superadmin/AdminsScreen.tsx`:
  - Replace `toast.info('Invite flow coming soon…')` with `navigation.navigate('CreateAdmin')`
- [ ] Update `src/screens/superadmin/UserDetailScreen.tsx`:
  - Add "Promote to admin" button — visible only when viewed user has `role === 'student'` and current user is super admin
  - On press: show `Alert.alert` confirmation: "Promote [name] to admin? They will gain full admin access while keeping their student enrollments."
  - On confirm: call `promoteToAdmin(uid)` → on success: update `usersStore` local record to reflect new role → toast "[name] promoted to admin." → navigate back

### Phase 6: Edge Cases & Polish

- [ ] All new service calls: network failure → `ApiError` with `NETWORK_ERROR` → toast "Couldn't reach the server."
- [ ] `PasswordResetScreen`: network failure shows toast, does not clear the email field
- [ ] `CreateAdminScreen`: network failure on submit shows toast, form data preserved
- [ ] Dark mode verification on all new/modified screens: `PasswordResetScreen`, `CreateAdminScreen`, `EditProfileScreen` (password section), `UserDetailScreen` (promote button)
- [ ] Verify no `console.error` introduced

### Phase 7: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires backend + Firebase config)
- [ ] Student ProfileScreen shows real name/email after sign-in
- [ ] Admin MoreScreen shows real name/email after sign-in
- [ ] Edit name → save → profile screen updates immediately
- [ ] Change password with weak password → inline error, no API call
- [ ] Change password with valid password → toast success
- [ ] Forgot password → PasswordResetScreen → enter email → confirmation shown
- [ ] Create admin form → fill → submit → appears in admin list
- [ ] Promote student → confirmation → promoted → role badge updates
- [ ] Dark mode toggle mid-flow on each new screen

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/profile.ts` | **new** | `updateMyProfile`, `changePassword` |
| `src/services/admins.ts` | **new** | `createAdmin`, `promoteToAdmin` |
| `src/services/auth.ts` | modified | add `resetPassword` |
| `src/screens/student/ProfileScreen.tsx` | modified | show `apiProfile` data |
| `src/screens/admin/MoreScreen.tsx` | modified | show `apiProfile` data |
| `src/screens/shared/EditProfileScreen.tsx` | modified | wire PATCH /me + change-password; remove currentPwd field |
| `src/screens/auth/PasswordResetScreen.tsx` | **new** | forgot password flow |
| `src/screens/auth/SignInScreen.tsx` | modified | "Forgot?" navigates to PasswordResetScreen |
| `src/navigation/AuthFlow.tsx` | modified | add PasswordResetScreen to stack |
| `src/screens/superadmin/CreateAdminScreen.tsx` | **new** | create admin form |
| `src/screens/superadmin/AdminsScreen.tsx` | modified | wire "Invite" to CreateAdminScreen |
| `src/screens/superadmin/UserDetailScreen.tsx` | modified | add promote-to-admin button |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (same Wi-Fi, backend running)
- [ ] Happy path: sign in as student → ProfileScreen shows real name + email
- [ ] Happy path: edit name → save → ProfileScreen immediately shows new name
- [ ] Happy path: change password to valid → toast success, fields cleared
- [ ] Error: change password to weak (< 10 chars) → inline error, no API call made
- [ ] Happy path: forgot password → email entered → confirmation message shown
- [ ] Happy path: super admin creates a new admin → appears in admin list
- [ ] Happy path: super admin promotes student → confirmation → role badge updates
- [ ] Error: create admin with duplicate email → inline error on email field
- [ ] Toggle dark mode on PasswordResetScreen and CreateAdminScreen
- [ ] Background → foreground app: form data preserved

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] No `console.error` introduced
- [ ] No leftover `toast.info('… coming soon')` on touched flows (forgot password, invite admin, promote to admin)
- [ ] `PATCH /me` request body contains only `firstName`/`lastName` (no photo URL unless explicitly wired later)
- [ ] `POST /me/change-password` request body contains only `newPassword` (no current password field)
- [ ] `initialPassword` redacted in debug logs
- [ ] Loading + error UI states present on all new/modified screens
- [ ] All 7 phases completed
- [ ] Spec status updated to `shipped`
- [ ] PR description references spec

---

## 📝 Progress Tracking

**Status legend:**
- 🟡 Draft — Planning stage
- 🔵 In Progress — Implementation started
- 🟢 Complete — All phases done
- 🔴 Blocked — Waiting on dependency

**Current Phase:** Phase 1
**Completion:** 0%

---

## 📌 Notes

- **Backend blocker:** Phases 1–6 can be fully coded and TypeScript-verified without the backend. Phase 7 (device testing) needs backend + Firebase config. Do not block coding on this.
- **Photo upload deferred:** When Firebase Storage is available, add `uploadProfilePhoto(uri)` to `profile.ts` that uploads and returns the HTTPS URL, then passes it to `updateMyProfile({ profilePhotoUrl: url })`.
- **`currentPassword` removal:** The existing `EditProfileScreen` has a "Current password" field. This should be removed — the `POST /me/change-password` API only takes `newPassword`. Firebase's Bearer token already proves identity.
- **Promote vs create admin:** `POST /super-admin/users/:uid/make-admin` promotes an existing student (dual-role). `POST /super-admin/admins` creates a brand new admin-only account. Both are needed and distinct.
- **`usersStore` after promote:** After a successful `promoteToAdmin`, update the local `usersStore` record's `role` to `'admin'` so the list reflects the change without a full re-fetch.
