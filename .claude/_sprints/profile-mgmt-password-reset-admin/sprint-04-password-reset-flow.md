# Sprint 4: Password Reset Flow

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Replace the "Forgot?" coming-soon stub with a real `PasswordResetScreen` that calls `POST /auth/password-reset` and shows the API's generic confirmation message.

---

## 📋 Tasks

- [ ] Create `src/screens/auth/PasswordResetScreen.tsx`:
  - Props: `onBack: () => void`
  - Email `Input` field — pre-filled from `route.params.email` if provided
  - On-blur email validation: must match basic email format before submit is enabled
  - Submit button → call `resetPassword(email.trim())`
  - Loading state: button shows "Sending…" and is disabled during the request
  - On success (always 200): show confirmation text "If an account exists for this email, a reset link has been sent." — do NOT navigate away automatically; let user tap back
  - On network error: `toast.error("Couldn't reach the server. Check your connection.")`
  - Screen uses `useThemedStyles` (dark mode compatible)
- [ ] Add `PasswordResetScreen` to `src/navigation/AuthFlow.tsx`:
  - New `Stack.Screen name="PasswordReset"` — push screen, no special animation needed
  - Accepts `route.params: { email?: string }` to pre-fill the field
- [ ] Update `src/screens/auth/SignInScreen.tsx`:
  - Replace `toast.info('Password reset — coming soon.')` on the "Forgot?" `Pressable`
  - New handler: `navigation.navigate('PasswordReset', { email: email.trim() })`
  - Pass the current email field value so the user doesn't have to retype it

---

## 📁 Files to Touch

**New:**
- `src/screens/auth/PasswordResetScreen.tsx`

**Modified:**
- `src/navigation/AuthFlow.tsx` — add PasswordResetScreen to stack
- `src/screens/auth/SignInScreen.tsx` — wire "Forgot?" to navigate instead of toast

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`resetPassword` service function in `auth.ts`)
- **Blocks:** Sprint 6 (edge-case polish covers network failure on this screen)
- **External:** none for code writing — can be written with placeholder config; backend not strictly needed since `POST /auth/password-reset` is a public endpoint (no auth token required)

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] "Forgot?" on `SignInScreen` navigates to `PasswordResetScreen` with email pre-filled
- [ ] `PasswordResetScreen` shows a loading state while the request is in flight
- [ ] After submit, screen shows the confirmation message and stays visible (no auto-navigate)
- [ ] No `toast.info('… coming soon')` remains on the "Forgot?" button
- [ ] Screen is dark-mode compatible

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device:
- [ ] Tap "Forgot?" on SignInScreen → `PasswordResetScreen` opens with email pre-filled
- [ ] Submit with valid email → confirmation message shown, stays on screen
- [ ] Tap Back → returns to SignInScreen

---

## 📝 Notes

- `POST /auth/password-reset` always returns `200` regardless of whether the email exists — this is intentional (prevents account enumeration). Do not show different messages based on the response.
- The screen should NOT expose whether an account exists — the generic confirmation message is required by the API design.
- `PasswordResetScreen` is a public screen (no auth required), so it lives in `AuthFlow`, not behind a role-guarded navigator.

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

**Next:** [`sprint-05-super-admin-create-admin-promote.md`](./sprint-05-super-admin-create-admin-promote.md)
