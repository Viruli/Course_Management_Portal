# Sprint 5: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden the auth flow against network failures, partial sign-in states, account lockout, and ensure all modified screens look correct in dark mode.

---

## 📋 Tasks

- [ ] Network failure during sign-in (Firebase call) → `NETWORK_ERROR` toast: "Couldn't reach the server. Check your connection."
- [ ] Network failure during `GET /me` after successful Firebase sign-in → call Firebase `signOut(auth)` to clean up partial auth state → show error toast → stay on `SignInScreen`
- [ ] `auth/user-disabled` Firebase error → show inline: "Your account is pending approval or has been suspended"
- [ ] `auth/too-many-requests` Firebase error → show inline: "Too many attempts. Please try again later."
- [ ] Lockout from backend (`POST /auth/track-failure` returns `locked: true`) → disable sign-in button + show: "Account locked. Try again in 15 minutes."
- [ ] Network failure during logout → proceed with local Firebase `signOut()` regardless; show `toast.error` if backend call fails but do not block the user
- [ ] Verify `TOKEN_REVOKED` global handler in `apiFetch`: simulate a revoked token scenario and confirm sign-out + role reset fires correctly
- [ ] Dark mode check — open `SignInScreen` in dark mode and verify all new error states, loading state, and lockout message render correctly with themed colours
- [ ] Dark mode check — open modified profile/more screens in dark mode, verify sign-out button styling is correct

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/auth/SignInScreen.tsx` — polish error handling for all edge cases
- `src/services/auth.ts` — `logoutUser` must catch backend failure gracefully
- `src/services/api.ts` — verify `TOKEN_REVOKED` handler (may already be done in Sprint 1; confirm it works)

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 3 (sign-in wired) + Sprint 4 (logout wired)
- **Blocks:** Sprint 6 (manual test covers these scenarios)

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during sign-in → toast shown, stays on `SignInScreen`, no crash
- [ ] `GET /me` failure after Firebase success → Firebase session cleaned up, error shown, no navigation into app
- [ ] Locked account → button disabled, lockout message visible
- [ ] Network off during logout → user still signed out locally, toast shown
- [ ] All new UI states render correctly in dark mode
- [ ] No `console.error` introduced

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device:
- [ ] Turn off Wi-Fi mid sign-in → toast appears, no crash
- [ ] Toggle dark mode on `SignInScreen` with error state visible → colours correct
- [ ] Toggle dark mode on profile/more screen with sign-out button → colours correct

---

## 📝 Notes

- To test the `GET /me` failure path, you can temporarily make `apiFetch` throw for the `/me` path in dev, or stop the backend server after Firebase sign-in succeeds.
- The `TOKEN_REVOKED` global handler test requires a revoked Firebase token — can be simulated in a dev environment by calling `revokeRefreshTokens` on the Firebase Admin SDK from the backend.

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

**Next:** [`sprint-06-manual-test-on-device.md`](./sprint-06-manual-test-on-device.md)
