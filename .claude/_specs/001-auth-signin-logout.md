# Auth Sign-In, Logout and Token Management

**Spec ID:** 001-auth-signin-logout
**Branch:** `feat/auth-signin-logout`
**Status:** draft
**Created:** 2026-05-12

---

## Overview
Wire the full authentication loop: sign in via Firebase email/password, fetch the user's profile and role from `GET /me`, route to the correct tab stack, record failed login attempts via `POST /auth/track-failure`, handle account lockout, and sign out via `POST /auth/logout` + Firebase `signOut()`. Replaces the current mock email-lookup in `AuthFlow.tsx` with real auth. Registration (`POST /auth/register`) is already wired.

---

## User Stories
- As a **student**, I want to sign in with my email and password, so that I can access my approved courses and profile.
- As an **admin**, I want to sign in, so that I am routed to the admin dashboard instead of the student view.
- As a **super admin**, I want to sign in, so that I am routed to the super admin dashboard.
- As a **signed-in user**, I want to tap "Sign out", so that my session is fully revoked and I return to the auth flow.
- As a **user with a pending/rejected/suspended account**, I want to see a meaningful error when I try to sign in, so that I understand why I cannot access the app.

---

## API Contract

### 1. Firebase sign-in (client SDK — no REST call)
_Reference: API Reference §1.2 — Firebase Auth_

The Firebase **web JS SDK** (`firebase` package) handles sign-in entirely on the client. No REST endpoint.

```
signInWithEmailAndPassword(auth, email, password)
  → UserCredential → user.getIdToken() → idToken (string)
```

Firebase error codes to handle:

| Firebase code | User-facing message |
|---|---|
| `auth/user-not-found` | No account found for this email. |
| `auth/wrong-password` | Incorrect password. |
| `auth/user-disabled` | Your account is pending approval or has been suspended. |
| `auth/too-many-requests` | Too many attempts. Please try again later. |
| `auth/invalid-email` | Enter a valid email address. |
| `auth/invalid-credential` | Incorrect email or password. |

### 2. Track login failure
_Reference: API Reference §2.4 — `POST /auth/track-failure`_

- **Endpoint:** `POST /auth/track-failure`
- **Auth:** none (public)
- **Request body:**
  ```json
  { "email": "user@example.com" }
  ```
- **Success response:** `200`
  ```json
  { "locked": false, "attempts": 3 }
  ```
- **Error codes handled:**
  - `locked: true` → show "Account locked. Try again in 15 minutes." and disable the sign-in button temporarily

### 3. Get own profile
_Reference: API Reference §3.1 — `GET /me`_

- **Endpoint:** `GET /me`
- **Auth:** bearer (any authenticated role)
- **Success response:** `200`
  ```json
  {
    "uid": "...", "email": "...",
    "role": "student",
    "roles": ["student"],
    "status": "approved",
    "firstName": "Viruli", "lastName": "Weerasinghe",
    "profilePhotoUrl": null
  }
  ```
- **Error codes handled:**
  - `TOKEN_REVOKED` / `INVALID_TOKEN` → force sign-out, navigate to Splash
  - `FORBIDDEN` → sign-out, show generic error toast

### 4. Logout
_Reference: API Reference §2.2 — `POST /auth/logout`_

- **Endpoint:** `POST /auth/logout`
- **Auth:** bearer (authenticated user)
- **Request body:** none
- **Success response:** `200` `{ "message": "Logged out successfully." }`
- **Error codes handled:**
  - Any failure → still proceed with Firebase `signOut()` locally; don't block the user

---

## Screens / Navigation

- **New screens:** none
- **Modified screens:**
  - `src/screens/auth/SignInScreen.tsx` — replace mock `onSubmit(email)` prop flow with Firebase sign-in call; add loading state, inline error display, lockout feedback
  - `src/navigation/AuthFlow.tsx` — replace `resolveRole(email)` mock with real Firebase + `GET /me` flow; populate `profileStore` on successful sign-in
  - `src/screens/student/ProfileScreen.tsx` (and admin/super equivalents) — add sign-out button that calls the logout flow
  - `src/screens/shared/EditProfileScreen.tsx` — sign-out accessible from here too (?)
- **Navigation changes:**
  - On successful sign-in → `setRole(role)` derived from `GET /me` response; `RootNavigator` switches automatically
  - On sign-out → reset stores, `setRole('public')`, `RootNavigator` returns to `AuthFlow`
  - `super_admin` from API maps to `'super'` in `appStore` (existing discrepancy — map it here)

---

## State / Stores

- **Stores touched:** `appStore`, `profileStore`, `debugStore` (via apiFetch tags)
- **New state:**
  - Firebase `auth` instance — exported singleton from `src/services/firebase.ts` (new file)
  - `profileStore` — populated from `GET /me` response on sign-in; cleared on sign-out
  - `appStore.role` — set from API `role` field after sign-in; reset to `'public'` on sign-out
- **Token strategy:** Firebase JS SDK persists session in `AsyncStorage` automatically. `apiFetch` calls `auth.currentUser?.getIdToken()` before every authenticated request — auto-refreshes if within 5-min expiry window. No manual token storage needed.

---

## UI States

- **Loading:** Sign-in button shows "Signing in…" and is disabled during the Firebase + `GET /me` sequence
- **Error — wrong credentials:** Inline error below the password field
- **Error — account disabled/pending/suspended:** Inline error below the form explaining account status
- **Error — locked (10 failures):** Error message + sign-in button disabled for the remainder of the 15-min window (lockout state held in component state, not persisted)
- **Error — network failure:** Toast: "Couldn't reach the server. Check your connection."
- **Sign-out loading:** Logout button shows brief spinner; on completion navigates away
- **Offline / network failure on sign-out:** Proceed with local Firebase `signOut()` regardless; show toast if backend call fails

---

## Functional Requirements

- [ ] Install `firebase` (web JS SDK) — must remain Expo Go compatible
- [ ] Create `src/services/firebase.ts` — initialise app from `EXPO_PUBLIC_FIREBASE_*` env vars; export `auth`
- [ ] Create `src/services/getAuthToken.ts` — helper: `auth.currentUser?.getIdToken()` used by `apiFetch`
- [ ] Wire `getAuthToken` into `apiFetch` so all authenticated calls auto-attach a fresh token
- [ ] Handle `TOKEN_REVOKED` globally in `apiFetch` — call `signOut()` + `setRole('public')`
- [ ] Wire Firebase `signInWithEmailAndPassword` in `SignInScreen`
- [ ] Call `POST /auth/track-failure` on every Firebase sign-in failure
- [ ] Disable sign-in form when `locked: true` is returned
- [ ] Call `GET /me` after successful Firebase sign-in to get real role + profile
- [ ] Map API `role: 'super_admin'` → app `'super'` at the `GET /me` call site
- [ ] Populate `profileStore` (firstName, lastName, email, photoUri) from `GET /me`
- [ ] Call `POST /auth/logout` + Firebase `signOut()` on logout; reset stores; `setRole('public')`
- [ ] Remove `resolveRole()` mock and `SAMPLE_USERS` import from `AuthFlow.tsx`

---

## Non-Functional Requirements

- [ ] **Performance** — sign-in sequence (Firebase + GET /me) completes within 3 s on a normal mobile connection; no jank on navigation transition after sign-in
- [ ] **Accessibility** — error messages are adjacent to the relevant field; touch targets ≥ 44pt
- [ ] **Security** — Firebase ID token is never logged or stored in plaintext; `redactFields` used for any sensitive request bodies; `signOut()` always called even if backend logout fails
- [ ] **Offline behaviour** — if `GET /me` fails with a network error after successful Firebase sign-in, show error and do not advance the user into the app

---

## Acceptance Criteria

- [ ] A registered + approved student can sign in and lands on `StudentTabs`
- [ ] An admin can sign in and lands on `AdminTabs`
- [ ] A super admin can sign in and lands on `SuperAdminTabs`
- [ ] A pending-approval student sees "pending or suspended" error on sign-in attempt
- [ ] Wrong password shows inline error; does not navigate
- [ ] After 10 failed attempts the form shows the lockout message and disables the button
- [ ] Tapping sign-out from any role's profile/more screen ends the session and returns to Splash
- [ ] After sign-out the user cannot press Back to reach a protected screen
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `resolveRole(email)` in `AuthFlow.tsx` + `SAMPLE_USERS` email lookup for sign-in
- **Still mocked after this feature:** all other data (courses, enrollments, notifications, approvals) — those are separate integration sprints

---

## Out of Scope

- Password reset flow (`POST /auth/password-reset`) — separate spec
- Firebase push notification setup (requires custom dev client)
- Biometric / social login
- Token refresh UI (handled transparently by Firebase SDK)
- Dual-role promoted-admin routing — `GET /me` returns `roles: ['student', 'admin']`; for now route by primary `role` field only

---

## Definition of Done

- [ ] Spec doc updated (Status → shipped)
- [ ] `src/services/firebase.ts` created and initialised from env vars
- [ ] `src/services/auth.ts` extended with `loginUser`, `logoutUser`, `trackLoginFailure`
- [ ] `apiFetch` auto-attaches Firebase token + handles `TOKEN_REVOKED` globally
- [ ] `SignInScreen` wired to real Firebase auth with all error states
- [ ] `AuthFlow.tsx` uses real `GET /me` for role resolution, no mock imports
- [ ] `profileStore` populated on sign-in, cleared on sign-out
- [ ] Logout wired in all role tab stacks (student ProfileScreen, admin MoreScreen, super MoreScreen)
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on phone via Expo Go — happy path (each role) + wrong password + pending account
- [ ] No `console.error`, no leftover mock sign-in code
- [ ] PR description references this spec

---

## References Used

- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §1.2 (Firebase Auth), §2.2 (Logout), §2.4 (Track Failure), §3.1 (GET /me)
- `src/navigation/AuthFlow.tsx` — current mock sign-in implementation
- `src/services/api.ts` — apiFetch pattern to extend
