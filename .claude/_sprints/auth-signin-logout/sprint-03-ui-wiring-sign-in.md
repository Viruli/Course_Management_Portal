# Sprint 3: UI Wiring — Sign-In

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 2–3 h · **Actual:** ~45 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `SignInScreen` to real Firebase authentication and remove all mock sign-in code from `AuthFlow.tsx`.

---

## 📋 Tasks

- [ ] Update `SignInScreen.tsx` — change `onSubmit` prop type from `(email: string) => void` to `() => void`
- [ ] Add `submitting` state — button shows "Signing in…" and is disabled during the Firebase + `GET /me` sequence
- [ ] Add `authError` state (`string | null`) — inline error displayed below the form
- [ ] Add `locked` state (`boolean`) — disables sign-in button and shows lockout message when backend returns `locked: true`
- [ ] Implement sign-in sequence in `handleSubmit`:
  1. Set `submitting = true`, clear `authError`
  2. Call `loginUser(email, password)`
  3. On success → call `profileStore.setProfile(profile)` → `appStore.setRole(role)` → call `onSubmit()`
  4. On Firebase error → call `trackLoginFailure(email)` → if `locked` response set `locked = true` → set `authError` with mapped message
  5. Always set `submitting = false` in finally
- [ ] Map Firebase error codes to user-facing messages (see spec table: `auth/user-not-found`, `auth/wrong-password`, `auth/user-disabled`, `auth/too-many-requests`, `auth/invalid-credential`)
- [ ] Render `authError` inline below the password field (using existing `errorRow` style)
- [ ] Render lockout message when `locked === true`
- [ ] Update `AuthFlow.tsx` — remove `resolveRole()` function, remove `SAMPLE_USERS` import, change `onSubmit` handler for `SignInScreen` to `() => void` (role is now set inside the screen)

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/auth/SignInScreen.tsx` — real Firebase auth wiring, all error/loading states
- `src/navigation/AuthFlow.tsx` — remove mock `resolveRole` + `SAMPLE_USERS`, update `onSubmit` prop

**Deleted:** none (mock code removed from existing files, not separate files)

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`loginUser`, `trackLoginFailure` exist) + Sprint 2 (`profileStore.setProfile` typed)
- **Blocks:** Sprint 5 (edge-case polish for sign-in)

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `SAMPLE_USERS` or `resolveRole` references remain in `AuthFlow.tsx`
- [ ] Sign-in button shows "Signing in…" and is disabled while the request is in flight
- [ ] Wrong password shows inline error below the form
- [ ] `auth/user-disabled` shows "Your account is pending approval or has been suspended"
- [ ] Correct role tab stack is reached on success (testable with real Firebase once config is available)

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device (requires real Firebase config):
- [ ] Happy path — valid credentials → correct tab stack, profile name shown
- [ ] Error path — wrong password → inline error, stays on SignInScreen

---

## 📝 Notes

- The `onSubmit` prop change (`(email) => void` → `() => void`) will cause a TypeScript error in `AuthFlow.tsx` until that file is updated in the same task.
- Until real Firebase config is in `.env`, this screen will throw `CONFIG_ERROR` from Firebase on submit — expected. The UI states (loading, error display) can be verified by temporarily hardcoding a bad credential flow.
- Do not remove the mock `SAMPLE_USERS` from `src/data/mock.ts` itself — other screens (usersStore etc.) may still reference it. Only remove the import from `AuthFlow.tsx`.

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

**Next:** [`sprint-04-ui-wiring-logout.md`](./sprint-04-ui-wiring-logout.md)
