# Profile Management, Password Reset and Admin Creation

**Spec ID:** 002-profile-mgmt-password-reset-admin
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Five connected improvements: (1) all three role profile screens show real data from `GET /me` instead of mock; (2) edit profile (`PATCH /me`) and change password (`POST /me/change-password`) are wired for real; (3) forgot password (`POST /auth/password-reset`) replaces the "coming soon" stub on the sign-in screen; (4) super admin can create a new admin account via a form (`POST /super-admin/admins`); (5) super admin can promote a student to admin (`POST /super-admin/users/:uid/make-admin`).

---

## User Stories
- As a **student**, I want my profile screen to show my real name, email and photo, so that I know my account details are accurate.
- As an **admin or super admin**, I want the More screen to show my real profile data, so that I see my actual account information.
- As any **signed-in user**, I want to edit my first and last name and save the changes, so that my profile stays up to date.
- As any **signed-in user**, I want to change my password from the edit profile screen, so that I can keep my account secure without signing out.
- As a **visitor on the sign-in screen**, I want to tap "Forgot password" and enter my email to receive a reset link, so that I can recover my account.
- As a **super admin**, I want to create a new admin account by filling in a form, so that I can onboard staff without them going through the student registration flow.
- As a **super admin**, I want to promote an existing approved student to admin, so that a student who also manages content can do both within the same account.

---

## API Contract

### 1. Get own profile
_Reference: API Reference §3.1 — `GET /me`_
- **Endpoint:** `GET /me`
- **Auth:** bearer (any role)
- **Success response:** `200` — `ApiUserProfile` (already defined in `src/services/auth.ts`)
- Called on sign-in (already done in Sprint 1). Can also be re-called to refresh profile data.

### 2. Update own profile
_Reference: API Reference §3.2 — `PATCH /me`_
- **Endpoint:** `PATCH /me`
- **Auth:** bearer (any role)
- **Request body:**
  ```json
  { "firstName": "Viruli", "lastName": "Weerasinghe", "profilePhotoUrl": "https://..." }
  ```
- **Success response:** `200` — updated `ApiUserProfile`
- **Notes:** All fields optional (partial update). `profilePhotoUrl` must be a valid HTTPS URL — local `file://` URIs are not accepted. Photo upload requires uploading to cloud storage first (deferred — see Out of Scope). For this sprint: wire firstName / lastName only; photo save stays local only.

### 3. Change password
_Reference: API Reference §3.3 — `POST /me/change-password`_
- **Endpoint:** `POST /me/change-password`
- **Auth:** bearer (any role)
- **Request body:**
  ```json
  { "newPassword": "NewSecurePass@2026" }
  ```
- **Success response:** `200` `{ "message": "Password updated successfully." }`
- **Error codes handled:**
  - `VALIDATION_ERROR` → show field error on new password field

### 4. Password reset
_Reference: API Reference §2.3 — `POST /auth/password-reset`_
- **Endpoint:** `POST /auth/password-reset`
- **Auth:** none (public)
- **Request body:**
  ```json
  { "email": "viruli@example.com" }
  ```
- **Success response:** `200` `{ "message": "If an account exists for this email, a reset link has been sent." }`
- **Notes:** Always returns `200` — no way to know if email exists. Show a generic confirmation.

### 5. Create admin
_Reference: API Reference §14.2 — `POST /super-admin/admins`_
- **Endpoint:** `POST /super-admin/admins`
- **Auth:** bearer (`super_admin`)
- **Request body:**
  ```json
  { "firstName": "Sapna", "lastName": "Nethmini", "email": "sapna@example.com", "initialPassword": "TempPass@2026" }
  ```
- **Success response:** `201` — full user object
- **Error codes handled:**
  - `EMAIL_EXISTS` → "This email is already registered."
  - `VALIDATION_ERROR` → field errors inline

### 6. Promote student to admin
_Reference: API Reference §14.7 — `POST /super-admin/users/:uid/make-admin`_
- **Endpoint:** `POST /super-admin/users/:uid/make-admin`
- **Auth:** bearer (`super_admin`)
- **Request body:** none
- **Success response:** `200` — updated user object with `role: "admin"`, `roles: ["student", "admin"]`
- **Error codes handled:**
  - `INVALID_ROLE` → "Only student accounts can be promoted to admin."
  - `USER_NOT_FOUND` → "User not found."

---

## Screens / Navigation

- **New screens:**
  - `src/screens/auth/PasswordResetScreen.tsx` — standalone screen for the forgot password flow (email input + submit + confirmation)

- **Modified screens:**
  - `src/screens/student/ProfileScreen.tsx` — show `apiProfile` (firstName, lastName, email, profilePhotoUrl) instead of mock `profiles.student`
  - `src/screens/admin/MoreScreen.tsx` — show `apiProfile` instead of mock `profiles.admin` / `profiles.super`
  - `src/screens/shared/EditProfileScreen.tsx` — wire `PATCH /me` for name save; wire `POST /me/change-password`; update password validation to API rules (10+ chars, complexity)
  - `src/screens/auth/SignInScreen.tsx` — replace `toast.info('Password reset — coming soon.')` with navigation to `PasswordResetScreen`
  - `src/screens/superadmin/AdminsScreen.tsx` — replace "Invite an admin" `toast.info` stub with navigation to a new `CreateAdminScreen`
  - `src/screens/superadmin/UserDetailScreen.tsx` — add "Promote to admin" button visible only when the viewed user has `role: 'student'` and the viewer is super admin

- **New screen:**
  - `src/screens/superadmin/CreateAdminScreen.tsx` — form with firstName, lastName, email, initialPassword fields; calls `POST /super-admin/admins`

- **Navigation changes:**
  - `AuthFlow` — add `PasswordResetScreen` to the stack (accessible from `SignInScreen`)
  - `SuperAdminTabs` navigator — add `CreateAdminScreen` as a modal or push screen accessible from `AdminsScreen`

---

## State / Stores

- **Stores touched:** `profileStore`, `debugStore` (via apiFetch tags)
- **New state:**
  - `profileStore.setProfile` already exists — re-call after successful `PATCH /me` to keep `apiProfile` in sync
- **Server data caching strategy:** Zustand local — re-fetch `GET /me` after successful PATCH; no TanStack Query yet

---

## UI States

- **Edit profile save:**
  - Loading: "Saving…" on Save button, disabled during request
  - Success: toast "Profile updated." + `profileStore.setProfile` updated
  - Error: inline error below the affected field

- **Change password:**
  - Loading: "Saving…" on Save button
  - Success: toast "Password updated." + clear password fields
  - Error: inline error if `VALIDATION_ERROR`

- **Password reset:**
  - Loading: "Sending…" on submit button
  - Success: show confirmation message "If an account exists for this email, a reset link has been sent." (do not navigate away — let user tap back)
  - Error (network): toast

- **Create admin form:**
  - Loading: "Creating…" on submit
  - Success: toast "Admin account created." + navigate back to `AdminsScreen`
  - Error `EMAIL_EXISTS`: inline error on email field
  - Error `VALIDATION_ERROR`: field-level errors

- **Promote to admin:**
  - Confirmation dialog before calling API ("Promote [name] to admin? They will gain full admin access while keeping their student enrollment history.")
  - Loading: button disabled
  - Success: toast "[name] promoted to admin." + update local display
  - Error: toast with error message

---

## Functional Requirements

- [ ] Create `src/services/profile.ts` — `updateMyProfile(patch)` → `PATCH /me`; `changePassword(newPassword)` → `POST /me/change-password`
- [ ] Create `src/services/admins.ts` — `createAdmin(payload)` → `POST /super-admin/admins`; `promoteToAdmin(uid)` → `POST /super-admin/users/:uid/make-admin`
- [ ] Add `resetPassword(email)` to `src/services/auth.ts` → `POST /auth/password-reset`
- [ ] Update `ProfileScreen` to display `apiProfile.firstName`, `apiProfile.lastName`, `apiProfile.email`, `apiProfile.profilePhotoUrl` (fall back to mock values when `apiProfile` is null — design build safety net)
- [ ] Update `MoreScreen` to display `apiProfile` data for admin / super admin
- [ ] Wire `EditProfileScreen` save button to call `updateMyProfile` and `setProfile` on success
- [ ] Wire `EditProfileScreen` change-password section to call `changePassword`; update password min length to 10 + complexity rule (matching API policy)
- [ ] Create `PasswordResetScreen` with email input, submit → `resetPassword`, confirmation message
- [ ] Replace "Forgot?" stub in `SignInScreen` with navigation to `PasswordResetScreen`
- [ ] Create `CreateAdminScreen` with firstName, lastName, email, initialPassword fields and `createAdmin` call
- [ ] Replace "Invite an admin" stub in `AdminsScreen` with navigation to `CreateAdminScreen`
- [ ] Add "Promote to admin" button to `UserDetailScreen` for super admin viewing a student; call `promoteToAdmin(uid)` after confirmation

---

## Non-Functional Requirements

- [ ] **Performance** — PATCH /me should complete within 3 s on a normal connection; no jank on navigation
- [ ] **Accessibility** — all new form fields have labels; touch targets ≥ 44pt; works in dark mode
- [ ] **Security** — `newPassword` and `initialPassword` passed with `redactFields` in `apiFetch`; never logged
- [ ] **Offline behaviour** — show toast on network failure; do not navigate away from the form

---

## Acceptance Criteria

- [ ] Signed-in student's ProfileScreen shows their real first name, last name and email from `GET /me`
- [ ] Admin and super admin MoreScreen shows their real profile data
- [ ] Editing first/last name and saving calls `PATCH /me`; profile screen updates immediately after
- [ ] Change password with a weak password shows inline validation error before calling the API
- [ ] Successful password change shows toast and clears the password fields
- [ ] Tapping "Forgot?" on SignInScreen navigates to PasswordResetScreen; submitting shows the confirmation message
- [ ] Super admin can open the Create Admin form, fill it in, and the new admin appears in the list
- [ ] Super admin can promote a student to admin after confirming the dialog; the user's role badge updates
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `profiles.student / profiles.admin / profiles.super` display in ProfileScreen and MoreScreen; `handleSave` mock in EditProfileScreen; "coming soon" stubs for forgot password, invite admin, promote to admin
- **Still mocked after this feature:** photo upload (deferred), student stats (enrolled/hours/streak), admin course counts in MoreScreen

---

## Out of Scope

- Profile photo upload to cloud storage (requires Firebase Storage — needs custom dev client)
- Email change (API does not support it through `PATCH /me`)
- Admin suspend / reactivate (separate admin management spec)
- Password reset deep-link handling (handled by Firebase email link natively)

---

## Definition of Done

- [ ] Spec status updated to `shipped`
- [ ] `src/services/profile.ts` and `src/services/admins.ts` created
- [ ] All four service functions wired (`updateMyProfile`, `changePassword`, `createAdmin`, `promoteToAdmin`, `resetPassword`)
- [ ] ProfileScreen + MoreScreen show real `apiProfile` data
- [ ] EditProfileScreen wired to real API (name + password)
- [ ] PasswordResetScreen created and accessible from SignInScreen
- [ ] CreateAdminScreen created and accessible from AdminsScreen
- [ ] Promote-to-admin wired in UserDetailScreen
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on phone via Expo Go (happy path per role + 1 error path each)
- [ ] No `console.error`, no leftover `toast.info('… coming soon')` on the touched flows
- [ ] PR description references this spec

---

## References Used

- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §3.1 (GET /me), §3.2 (PATCH /me), §3.3 (change-password), §2.3 (password-reset), §14.2 (create admin), §14.7 (make-admin)
- `src/screens/shared/EditProfileScreen.tsx` — existing edit profile implementation
- `src/screens/superadmin/AdminsScreen.tsx` — existing admins list with "Invite" stub
- `src/store/profileStore.ts` — `apiProfile` + `setProfile` added in Sprint 2
