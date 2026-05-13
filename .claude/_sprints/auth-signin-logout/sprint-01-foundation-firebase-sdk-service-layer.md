# Sprint 1: Foundation — Firebase SDK + Service Layer

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 3–4 h · **Actual:** ~1 h
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Install the Firebase web JS SDK and build the complete service layer foundation: Firebase initialisation, token helper, updated `apiFetch`, and the three new auth service functions (`loginUser`, `logoutUser`, `trackLoginFailure`).

---

## 📋 Tasks

- [x] Run `npx expo install firebase` and verify `npx expo install --check` still passes _(2026-05-13)_
- [x] Add `EXPO_PUBLIC_FIREBASE_*` keys to `.env.example`; add placeholder values to `.env` _(2026-05-13)_
- [x] Create `src/services/firebase.ts` — call `initializeApp(config)` from env vars; export `auth = getAuth(app)` _(2026-05-13)_
- [x] Create `src/services/getAuthToken.ts` — `export async function getAuthToken(): Promise<string | undefined>` that calls `auth.currentUser?.getIdToken()` _(2026-05-13)_
- [x] Update `src/services/api.ts` — remove manual `token` option from `RequestOptions`; call `getAuthToken()` internally before every request and attach as `Authorization: Bearer` _(2026-05-13)_
- [x] Add `TOKEN_REVOKED` global handler in `apiFetch` — on 401 with code `TOKEN_REVOKED` or `INVALID_TOKEN`, call `signOut(auth)` then `useAppStore.getState().setRole('public')` _(2026-05-13)_
- [x] Add `trackLoginFailure(email)` to `src/services/auth.ts` → `POST /auth/track-failure`; return `{ locked, attempts }` _(2026-05-13)_
- [x] Add `loginUser(email, password)` to `src/services/auth.ts` → Firebase `signInWithEmailAndPassword` → `getIdToken()` → `GET /me`; map `super_admin` → `'super'`; return `{ role, profile }` _(2026-05-13)_
- [x] Add `logoutUser()` to `src/services/auth.ts` → `POST /auth/logout` (best-effort, never throws) → Firebase `signOut(auth)` _(2026-05-13)_
- [x] Define `ApiUserProfile` interface in `src/services/auth.ts` — matches `GET /me` response shape exactly _(2026-05-13)_

---

## 📁 Files to Touch

**New:**
- `src/services/firebase.ts` — Firebase app init + `auth` export
- `src/services/getAuthToken.ts` — token helper

**Modified:**
- `src/services/api.ts` — auto-attach token via `getAuthToken()`; `TOKEN_REVOKED` global handler
- `src/services/auth.ts` — add `loginUser`, `logoutUser`, `trackLoginFailure`, `ApiUserProfile`
- `.env.example` — add `EXPO_PUBLIC_FIREBASE_*` keys
- `.env` — add placeholder Firebase values
- `package.json` / `package-lock.json` — `firebase` package added

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — this is Sprint 1
- **Blocks:** Sprint 2 (profileStore types depend on `ApiUserProfile`), Sprint 3 (SignInScreen calls `loginUser`)
- **External:** Firebase project config from backend team needed for real testing; placeholder values allow code to compile and be written

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No new `console.error` introduced
- [ ] `npx expo install --check` reports no version mismatches after adding `firebase`
- [ ] `apiFetch` no longer accepts a `token` option — callers pass nothing for auth header
- [ ] `loginUser` returns typed `{ role, profile }` with `super_admin` already mapped to `'super'`
- [ ] `logoutUser` never throws regardless of backend failure

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo install --check
```

Manual verification (no device needed for this sprint — it's pure service layer):
- [ ] TypeScript compiles cleanly
- [ ] No circular import warnings in Metro console on next start

---

## 📝 Notes

- `firebase` web JS SDK is Expo Go compatible — do NOT install `@react-native-firebase` here.
- The `TOKEN_REVOKED` handler in `apiFetch` imports `useAppStore.getState()` (non-hook call) to set role from outside React — this is the approved Zustand pattern for non-component code.
- `logoutUser` calls `POST /auth/logout` first (to revoke server-side tokens), then calls Firebase `signOut()`. Even if the backend call throws, `signOut()` always runs — wrap the backend call in try/catch inside `logoutUser`.
- Keep `redactFields: ['password']` on any call that sends credentials.

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

**Next:** [`sprint-02-state.md`](./sprint-02-state.md)
