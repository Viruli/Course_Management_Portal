# Sprint 6: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🔴 Blocked
**Estimated:** 1–2 h · **Actual:** ___
**Started:** 2026-05-13 · **Completed:** ___

---

## 🎯 Sprint Goal
Confirm the full auth loop works end-to-end on a real Android device via Expo Go, covering all three roles, key error paths, and the logout flow.

> ⚠️ This sprint requires real Firebase project config in `.env` and the backend running at `http://192.168.1.136:3000/api/v1`.

---

## 📋 Tasks

- [ ] Confirm `.env` has real `EXPO_PUBLIC_FIREBASE_*` values and `EXPO_PUBLIC_API_BASE_URL` points to the running backend
  > 🔴 **BLOCKED** — Firebase project config not yet received from backend team (2026-05-13). Resume this sprint once config is available.
- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android device via Expo Go (same Wi-Fi as the dev machine)
- [ ] **Happy path — student:** sign in with an approved student account → lands on `StudentTabs` → profile screen shows correct first/last name
- [ ] **Happy path — admin:** sign in with an admin account → lands on `AdminTabs`
- [ ] **Happy path — super admin:** sign in with a super admin account → lands on `SuperAdminTabs`
- [ ] **Error path — wrong password:** enter wrong password → inline error shows, stays on `SignInScreen`, no navigation
- [ ] **Error path — pending account:** sign in with a pending-approval account → "pending or suspended" message shown
- [ ] **Error path — network off:** disable Wi-Fi mid sign-in → toast shown, no crash
- [ ] **Logout — student:** sign in as student → tap sign-out from `ProfileScreen` → returns to Splash
- [ ] **Logout — admin:** sign in as admin → tap sign-out from `MoreScreen` → returns to Splash
- [ ] **Logout — super admin:** sign in as super admin → tap sign-out → returns to Splash
- [ ] **Back button after logout:** after sign-out, press Android back → does NOT navigate back into the app
- [ ] **Dark mode:** toggle dark mode during sign-in flow → all screens themed correctly
- [ ] **Background → foreground:** sign in, background the app, bring it back → still signed in, state intact
- [ ] Run `npx tsc --noEmit` one final time — must pass clean

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
