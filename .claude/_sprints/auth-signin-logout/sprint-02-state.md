# Sprint 2: State

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Update `profileStore` with API-aligned types and proper `setProfile` / `clearProfile` actions so the sign-in and logout flows can store and clear real user data.

---

## 📋 Tasks

- [x] Update `src/store/profileStore.ts` — add `setProfile(p: ApiUserProfile)` + `clearProfile()` actions _(2026-05-13)_
- [x] Add `clearProfile()` action to `profileStore` — resets `apiProfile` to null _(2026-05-13)_
- [x] Import `ApiUserProfile` from `src/services/auth.ts` for the `setProfile` type _(2026-05-13)_
- [x] Verify existing profile-display screens still compile — `npx tsc --noEmit` passes clean _(2026-05-13)_

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/store/profileStore.ts` — `setProfile(ApiUserProfile)`, `clearProfile()`

**Potentially modified** (compile check only — no logic change):
- `src/screens/student/ProfileScreen.tsx` — reads from profileStore; verify field names still match
- `src/screens/shared/EditProfileScreen.tsx` — same check

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 complete (`ApiUserProfile` type must exist in `src/services/auth.ts`)
- **Blocks:** Sprint 3 (sign-in calls `profileStore.setProfile`) and Sprint 4 (logout calls `profileStore.clearProfile`)

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `profileStore.setProfile` accepts an `ApiUserProfile` object without type errors
- [ ] `profileStore.clearProfile` resets all fields
- [ ] No existing profile screens broken — all field reads resolve without TypeScript errors

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (no device needed — state change only):
- [ ] TypeScript compiles cleanly with no errors on modified files

---

## 📝 Notes

- Do NOT import anything from `src/data/types.ts` — `StudentInfo`, `AdminInfo`, `AppUser` are mock types that don't match the API. Use `ApiUserProfile` from `src/services/auth.ts` exclusively.
- `profileStore` initial state should have sensible empty values (`''` for strings, `null` for `profilePhotoUrl`, `[]` for `roles`).

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

**Next:** [`sprint-03-ui-wiring-sign-in.md`](./sprint-03-ui-wiring-sign-in.md)
