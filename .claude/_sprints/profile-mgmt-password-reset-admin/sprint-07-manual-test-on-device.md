# Sprint 7: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟡 Not Started
**Estimated:** 1–2 h · **Actual:** ___
**Started:** ___ · **Completed:** ___

---

## 🎯 Sprint Goal
Confirm every flow works end-to-end on a real Android device with the live backend.

> ⚠️ Requires Firebase project config in `.env` + backend running at `http://192.168.1.136:3000/api/v1`.

---

## 📋 Tasks

- [ ] Confirm `.env` has real `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_API_BASE_URL`
- [ ] `npx expo start --lan --clear` → scan QR on device
- [ ] **Profile display — student:** sign in as student → ProfileScreen shows real name/email
- [ ] **Profile display — admin:** sign in as admin → MoreScreen user card shows real name/email
- [ ] **Edit name — student:** edit first name → save → ProfileScreen shows updated name immediately
- [ ] **Edit name — admin:** same test from MoreScreen edit profile path
- [ ] **Change password — valid:** expand password section → enter valid 10+ char password → save → toast "Password updated."
- [ ] **Change password — weak:** enter 6-char password → inline error shown, no API call made
- [ ] **Forgot password:** on SignInScreen tap "Forgot?" → `PasswordResetScreen` opens with email pre-filled → submit → confirmation message shown
- [ ] **Create admin:** super admin → AdminsScreen → tap "Invite an admin" → form opens → fill valid data → submit → toast success
- [ ] **Create admin — duplicate email:** use an already-registered email → inline `EMAIL_EXISTS` error on email field
- [ ] **Promote to admin:** super admin → UsersScreen → tap a student → UserDetailScreen → "Promote to admin" button visible → confirm → toast success → role badge updates
- [ ] **Promote non-student:** tap on an admin account → "Promote to admin" button should NOT appear
- [ ] **Dark mode:** toggle during each flow → all screens themed correctly
- [ ] `npx tsc --noEmit` — final clean pass

---

## 📁 Files to Touch

**New:** none · **Modified:** none · **Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–6 all 🟢 Complete
- **External:** Firebase config + backend running at `http://192.168.1.136:3000`

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro during any test
- [ ] No `toast.info('… coming soon')` triggered on any touched flow
- [ ] `PATCH /me` request sends only `firstName` and `lastName` (verify in DebugPanel)
- [ ] `POST /me/change-password` sends only `newPassword` (verify in DebugPanel — `newPassword` shows as `••••••••`)
- [ ] `POST /super-admin/admins` sends `initialPassword` as `••••••••` in DebugPanel

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

---

## 📝 Notes

- Use the `DebugPanel` (already on the SignUp screen) to verify request/response shapes match the API doc. You can temporarily add `<DebugPanel tags={['profile.update', 'profile.changePassword', 'admins.create', 'admins.promote', 'auth.passwordReset']} />` to a screen to inspect network calls.
- If Firebase config is still not available, mark this sprint 🔴 Blocked and open the PR without device-test sign-off. Document which tests are pending in the PR description.

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
1. Update `.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/002-profile-mgmt-password-reset-admin.md` → **Status: shipped**
3. Push `feat/profile-mgmt-password-reset-admin` and open PR into `main`
4. Reference `.claude/_specs/002-profile-mgmt-password-reset-admin.md` in the PR description
