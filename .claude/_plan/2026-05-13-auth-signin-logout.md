# Implementation Plan: Auth Sign-In, Logout and Token Management

**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Created:** 2026-05-13
**Status:** 🟢 Complete
**Estimated effort:** 2–3 days (Phase 1 partially blocked on Firebase config from backend team)

---

## 📋 Context

The sign-in flow currently resolves role by looking up the entered email in `SAMPLE_USERS` (mock). This plan wires real Firebase Authentication, fetches the authenticated user's profile and role from `GET /me`, and replaces all mock sign-in code. Logout is also implemented end-to-end (backend token revocation + Firebase `signOut()`).

- **Spec:** 001-auth-signin-logout
- **API Reference:** §1.2 (Firebase Auth), §2.2 `POST /auth/logout`, §2.4 `POST /auth/track-failure`, §3.1 `GET /me`
- **Replaces mock:** `resolveRole()` + `SAMPLE_USERS` import in `src/navigation/AuthFlow.tsx`
- **Blocker for Phase 1 testing:** Firebase project config (`apiKey`, `authDomain`, `projectId`, etc.) must be received from the backend team before real sign-in can be tested end-to-end. Phase 1 code can be written with placeholder env vars.

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | Use `firebase` web JS SDK, not `@react-native-firebase` | Web SDK is Expo Go compatible — no custom dev client needed yet | `src/services/firebase.ts`, `package.json` |
| 2 | `apiFetch` auto-attaches token via `getAuthToken()` helper | Callers never pass `token` manually — reduces boilerplate and risk of forgetting | `src/services/api.ts`, all future service calls |
| 3 | `TOKEN_REVOKED` handled globally inside `apiFetch` | Any screen that makes an API call gets automatic sign-out on session revocation | `src/services/api.ts` |
| 4 | Sign-in logic lives in `SignInScreen`, not `AuthFlow` | `AuthFlow` becomes a thin navigator; `SignInScreen` owns the async auth sequence | `src/screens/auth/SignInScreen.tsx`, `src/navigation/AuthFlow.tsx` |
| 5 | `super_admin` → `'super'` mapped in `loginUser()` | Single mapping point; rest of app continues using existing `'super'` role string | `src/services/auth.ts` |
| 6 | Logout is best-effort on backend | `signOut()` always runs even if `POST /auth/logout` fails — user is never stuck | `src/services/auth.ts` |
| 7 | Lockout state is component-local, not persisted | Resets on app restart; acceptable for a 15-min window on a mobile client | `src/screens/auth/SignInScreen.tsx` |
| 8 | `profileStore` typed to API `GET /me` response | Replaces mock `StudentInfo`/`AdminInfo` types with API-aligned shape | `src/store/profileStore.ts` |

---

## 🚀 Implementation Steps

### Phase 1: Foundation — Firebase SDK + Service Layer

- [ ] Run `npx expo install firebase` and verify `npx expo install --check` still passes
- [ ] Add `EXPO_PUBLIC_FIREBASE_*` keys to `.env.example`; add placeholder values to `.env`
- [ ] Create `src/services/firebase.ts` — call `initializeApp(config)` from env vars; export `auth = getAuth(app)`
- [ ] Create `src/services/getAuthToken.ts` — `export async function getAuthToken(): Promise<string | undefined>` that calls `auth.currentUser?.getIdToken()`
- [ ] Update `src/services/api.ts` — remove manual `token` option; call `getAuthToken()` internally before every request and attach as `Authorization: Bearer`
- [ ] Add `TOKEN_REVOKED` global handler in `apiFetch` — on 401 with code `TOKEN_REVOKED` or `INVALID_TOKEN`, call `signOut(auth)` then `useAppStore.getState().setRole('public')`
- [ ] Add to `src/services/auth.ts`:
  - `trackLoginFailure(email)` → `POST /auth/track-failure`; return `{ locked, attempts }`
  - `loginUser(email, password)` → Firebase `signInWithEmailAndPassword` → `getIdToken()` → `GET /me`; map `super_admin` → `'super'`; return `{ role, profile }`
  - `logoutUser()` → `POST /auth/logout` (best-effort) → Firebase `signOut(auth)`

### Phase 2: State

- [ ] Update `src/store/profileStore.ts` — add `setProfile(p: ApiUserProfile)` and `clearProfile()` actions typed to the `GET /me` response shape (`uid`, `email`, `role`, `roles`, `status`, `firstName`, `lastName`, `profilePhotoUrl`)
- [ ] Define `ApiUserProfile` interface in `src/services/auth.ts` (or a new `src/services/types.ts`) — do NOT reuse mock types from `src/data/types.ts`

### Phase 3: UI Wiring — Sign-In

- [ ] Update `SignInScreen.tsx` — change `onSubmit` prop from `(email: string) => void` to `() => void` (screen owns the async logic internally)
- [ ] Add `submitting` state — button shows "Signing in…" and is disabled during the full sequence
- [ ] Add `authError` state — inline error string shown below the form
- [ ] Add `locked` state — disables the button and shows lockout message when `trackLoginFailure` returns `locked: true`
- [ ] Sign-in sequence inside `handleSubmit`:
  1. Call `loginUser(email, password)`
  2. On Firebase error → call `trackLoginFailure(email)` → check `locked` → set `authError`
  3. On success → call `profileStore.setProfile(profile)` → call `appStore.setRole(role)` → call `onSubmit()`
- [ ] Map all Firebase error codes to user-facing strings (per spec table)
- [ ] Update `AuthFlow.tsx` — remove `resolveRole()`, remove `SAMPLE_USERS` import; `onSubmit` on SignIn screen is now `() => void` (role switch is handled inside the screen)

### Phase 4: UI Wiring — Logout

- [ ] Create a shared `useLogout()` hook (or plain async function) in `src/services/auth.ts` that: calls `logoutUser()`, clears `profileStore`, resets `appStore.setRole('public')`
- [ ] Wire sign-out button in `src/screens/student/ProfileScreen.tsx`
- [ ] Wire sign-out button in `src/screens/admin/MoreScreen.tsx`
- [ ] Wire sign-out button in `src/screens/superadmin/MoreScreen.tsx` (or equivalent super admin screen)
- [ ] Show a loading indicator on the sign-out button while the sequence runs
- [ ] Confirm `RootNavigator` returns to `AuthFlow` automatically when `role` resets to `'public'`

### Phase 5: Edge Cases & Polish

- [ ] Network failure during sign-in → `ApiError` with `NETWORK_ERROR` → toast "Couldn't reach the server"
- [ ] Network failure during `GET /me` after successful Firebase sign-in → do **not** advance; show error, call Firebase `signOut()` to clean up partial auth state
- [ ] `auth/user-disabled` → "Your account is pending approval or has been suspended" (covers pending + suspended)
- [ ] `auth/too-many-requests` → "Too many attempts. Please try again later." (Firebase-level rate limit before our backend lockout kicks in)
- [ ] Verify dark mode on `SignInScreen` and all screens with new sign-out buttons
- [ ] Verify `TOKEN_REVOKED` global handler fires correctly when session is revoked mid-session

### Phase 6: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go
- [ ] Happy path — student: sign in → lands on StudentTabs → profile shows real name
- [ ] Happy path — admin: sign in → lands on AdminTabs
- [ ] Happy path — super admin: sign in → lands on SuperAdminTabs
- [ ] Error path — wrong password: inline error, no navigation
- [ ] Error path — pending/suspended account: correct message shown
- [ ] Error path — network off: toast shown, no crash
- [ ] Logout from student ProfileScreen → returns to Splash
- [ ] Logout from admin MoreScreen → returns to Splash
- [ ] Toggle dark mode mid sign-in flow
- [ ] Background → foreground the app: still signed in, state intact

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/firebase.ts` | **new** | Firebase app init + `auth` export |
| `src/services/getAuthToken.ts` | **new** | Token helper used by `apiFetch` |
| `src/services/api.ts` | modified | Auto-attach token; global `TOKEN_REVOKED` handler |
| `src/services/auth.ts` | modified | Add `loginUser`, `logoutUser`, `trackLoginFailure`, `ApiUserProfile` type |
| `src/store/profileStore.ts` | modified | `setProfile` / `clearProfile` typed to API shape |
| `src/screens/auth/SignInScreen.tsx` | modified | Real Firebase auth; all error + loading states |
| `src/navigation/AuthFlow.tsx` | modified | Remove mock `resolveRole` + `SAMPLE_USERS` |
| `src/screens/student/ProfileScreen.tsx` | modified | Sign-out button wired |
| `src/screens/admin/MoreScreen.tsx` | modified | Sign-out button wired |
| `src/screens/superadmin/MoreScreen.tsx` (?) | modified | Sign-out button wired |
| `.env.example` | modified | Add `EXPO_PUBLIC_FIREBASE_*` placeholder keys |
| `package.json` / `package-lock.json` | modified | `firebase` package added |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (same Wi-Fi)
- [ ] Happy path: sign in as student → `StudentTabs` → profile shows real firstName/lastName
- [ ] Happy path: sign in as admin → `AdminTabs`
- [ ] Happy path: sign in as super admin → `SuperAdminTabs`
- [ ] Error: wrong password → inline error, stays on `SignInScreen`
- [ ] Error: pending account → "pending or suspended" message
- [ ] Error: disable network → toast, no crash, no navigation
- [ ] Logout: student `ProfileScreen` → Splash
- [ ] Logout: admin `MoreScreen` → Splash
- [ ] Toggle dark mode during sign-in flow
- [ ] Background → foreground: signed-in state persists

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] No `console.error` introduced
- [ ] No leftover `toast.info('… coming soon')` on any touched flow
- [ ] No mock `SAMPLE_USERS` or `resolveRole` references remaining in `AuthFlow.tsx`
- [ ] Loading + error UI states present on `SignInScreen`
- [ ] All design decisions implemented
- [ ] All 6 phases completed
- [ ] Spec status updated to `shipped`
- [ ] PR description references `.claude/_specs/001-auth-signin-logout.md`

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

- **Firebase config blocker** — Phase 1 can be written with placeholder env vars, but end-to-end testing requires the real Firebase project config from the backend team. Do not block code writing on this — write everything and test once config arrives.
- **`src/data/types.ts` warning** — Do not reuse `StudentInfo`, `AdminInfo`, or `AppUser` from this file for API responses. Define `ApiUserProfile` in the service layer instead.
- **Dual-role users** — `GET /me` returns `roles: ['student', 'admin']` for promoted admins. This plan routes by primary `role` only. Dual-role routing is out of scope for this sprint.
- **Password reset** — `POST /auth/password-reset` is out of scope; separate spec required.
