# Sprint 4: UI Wiring — Logout

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire sign-out in all three role tab stacks (student, admin, super admin) so tapping "Sign out" ends the session and returns the user to the auth flow.

---

## 📋 Tasks

- [ ] Create a `performLogout()` async function (in `src/services/auth.ts` or a `useLogout` hook) that: calls `logoutUser()`, calls `profileStore.clearProfile()`, calls `appStore.setRole('public')`
- [ ] Wire sign-out in `src/screens/student/ProfileScreen.tsx` — find the existing sign-out button / menu item and call `performLogout()`
- [ ] Wire sign-out in `src/screens/admin/MoreScreen.tsx` — same pattern
- [ ] Wire sign-out in `src/screens/superadmin/MoreScreen.tsx` (or whichever super admin screen has the sign-out option) — same pattern
- [ ] Show a loading indicator on the sign-out button while `performLogout()` runs (disable button, show spinner or "Signing out…")
- [ ] Confirm `RootNavigator` returns to `AuthFlow` automatically when `appStore.role` resets to `'public'` — no manual `navigation.navigate` needed

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/services/auth.ts` — add `performLogout()` helper (or export as hook)
- `src/screens/student/ProfileScreen.tsx` — wire sign-out button
- `src/screens/admin/MoreScreen.tsx` — wire sign-out button
- `src/screens/superadmin/MoreScreen.tsx` — wire sign-out button

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`logoutUser` exists) + Sprint 2 (`profileStore.clearProfile` exists)
- **Blocks:** Sprint 5 (edge cases cover sign-out failure scenarios)

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Tapping sign-out from `StudentTabs` → returns to `AuthFlow` (Splash screen)
- [ ] Tapping sign-out from `AdminTabs` → returns to `AuthFlow`
- [ ] Tapping sign-out from `SuperAdminTabs` → returns to `AuthFlow`
- [ ] After sign-out, pressing device back button does NOT navigate back into the protected tab stack
- [ ] Sign-out button is disabled and shows loading state while `performLogout()` runs

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device:
- [ ] Sign in as student → tap sign-out → lands on Splash
- [ ] Sign in as admin → tap sign-out → lands on Splash
- [ ] Press Android back after sign-out → stays on auth flow, does not re-enter app

---

## 📝 Notes

- `RootNavigator` switches tabs based on `appStore.role`. When `setRole('public')` is called, the navigator automatically unmounts the tab stacks and mounts `AuthFlow`. No explicit `navigation.navigate` call is needed from the sign-out handler.
- The sign-out button in student `ProfileScreen` currently calls `toast.info('… coming soon.')` or similar — replace that call entirely.
- Look for the sign-out option in admin/super screens; it may be in a "More" tab, a profile menu, or a list item.

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

**Next:** [`sprint-05-edge-cases-polish.md`](./sprint-05-edge-cases-polish.md)
