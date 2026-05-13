# Sprint 6: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~2 h
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Confirm the full auth loop works end-to-end on a real Android device via Expo Go, covering all three roles, key error paths, and the logout flow.

> ⚠️ This sprint requires real Firebase project config in `.env` and the backend running at `http://192.168.1.136:3000/api/v1`.

---

## 📋 Tasks

- [x] Confirm `.env` has real `EXPO_PUBLIC_FIREBASE_*` values and `EXPO_PUBLIC_API_BASE_URL` points to the running backend _(2026-05-13 — project: e-learning-f4209, backend: 192.168.1.105:3000)_
- [x] Start Metro: `npx expo start --lan --clear` _(2026-05-13)_
- [x] Run on Android device via Expo Go _(2026-05-13)_
- [x] **Happy path — student:** sign in → `StudentTabs` → profile shows real name from `GET /me` ✅ _(2026-05-13)_
- [x] **Happy path — admin:** sign in → `AdminTabs` ✅ _(2026-05-13)_
- [x] **Happy path — super admin:** sign in → `SuperAdminTabs` ✅ _(2026-05-13)_
- [x] **Error path — wrong/non-existent email:** `auth/invalid-credential` → "Incorrect email or password." ✅ _(note: Firebase v9+ merges user-not-found + wrong-password into invalid-credential — correct secure behaviour)_
- [x] **Error path — pending account:** "pending or suspended" message shown ✅ _(2026-05-13)_
- [x] **Error path — network off:** toast shown, no crash ✅ _(2026-05-13)_
- [x] **Logout — student:** sign-out → Splash ✅ _(2026-05-13)_
- [x] **Logout — admin:** sign-out → Splash ✅ _(2026-05-13)_
- [x] **Logout — super admin:** sign-out → Splash ✅ _(2026-05-13)_
- [x] **Back button after logout:** Android back does NOT re-enter app ✅ _(2026-05-13)_
- [x] **Dark mode:** all screens themed correctly ✅ _(2026-05-13)_
- [x] **Background → foreground:** signed-in state persists ✅ _(2026-05-13)_
- [x] `npx tsc --noEmit` passes ✅ _(2026-05-13)_
- [ ] **Account lockout (deferred):** test full 10-attempt lockout using a throwaway test account; verify `attempts` count increments in Metro terminal; confirm "Account locked" UI at attempt 10 — defer to final integration test round

---

## 📁 Files to Touch

**New:** none
**Modified:** none (this is a test-only sprint)
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 1–5 all 🟢 Complete
- **External:** Real Firebase project config from backend team + backend server running locally

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro during any test scenario
- [ ] No leftover `toast.info('… coming soon')` triggered by any touched flow
- [ ] No mock `SAMPLE_USERS` / `resolveRole` references in `AuthFlow.tsx` (grep check)

---

## 🧪 Verification

```bash
# Final typecheck
npx tsc --noEmit

# Confirm no mock sign-in remnants
grep -r "resolveRole\|SAMPLE_USERS" src/navigation/AuthFlow.tsx
# Expected: no output
```

```bash
npx expo start --lan --clear
```

---

## 📝 Notes

- If Firebase config is still not available from the backend team at this point, skip the happy-path device tests and mark this sprint 🔴 Blocked. Document the blocker and proceed to open the PR with Sprints 1–5 merged — the PR description should note that device testing is pending Firebase config.
- Once all tests pass, update the spec status to `shipped` and update the plan status to 🟢 Complete before opening the PR.

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

## ✅ Closing the Loop
When this sprint is 🟢:
1. Update `.claude/_plan/2026-05-13-auth-signin-logout.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/001-auth-signin-logout.md` → **Status: shipped**
3. Push `feat/auth-signin-logout` and open PR into `main`
4. Reference `.claude/_specs/001-auth-signin-logout.md` and `.claude/_sprints/auth-signin-logout/` in the PR description
