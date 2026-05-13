# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create all new service files with API-aligned types and function signatures so every subsequent sprint has a typed, consistent interface to call — no UI changes yet.

---

## 📋 Tasks

- [ ] Create `src/services/profile.ts`:
  - `UpdateProfilePayload` interface: `{ firstName?: string; lastName?: string }` — matches `PATCH /me` body (no photo yet — `profilePhotoUrl` deferred)
  - `updateMyProfile(patch: UpdateProfilePayload)` → `apiFetch<ApiUserProfile>('PATCH', '/me', { body: patch, tag: 'profile.update' })`; returns the updated `ApiUserProfile`
  - `changePassword(newPassword: string)` → `apiFetch<{ message: string }>('POST', '/me/change-password', { body: { newPassword }, tag: 'profile.changePassword', redactFields: ['newPassword'] })`
- [ ] Add `resetPassword(email: string)` to `src/services/auth.ts`:
  - → `apiFetch<{ message: string }>('POST', '/auth/password-reset', { body: { email }, tag: 'auth.passwordReset' })`
  - Always returns 200 — never throws on "email not found" (by API design)
- [ ] Create `src/services/admins.ts`:
  - `CreateAdminPayload` interface: `{ firstName: string; lastName: string; email: string; initialPassword: string }`
  - `createAdmin(payload: CreateAdminPayload)` → `apiFetch<ApiUserProfile>('POST', '/super-admin/admins', { body: payload, tag: 'admins.create', redactFields: ['initialPassword'] })`
  - `promoteToAdmin(uid: string)` → `apiFetch<ApiUserProfile>('POST', \`/super-admin/users/${uid}/make-admin\`, { tag: 'admins.promote' })`
- [ ] Import `ApiUserProfile` from `src/services/auth.ts` in `profile.ts` and `admins.ts` (do NOT define a duplicate interface)

---

## 📁 Files to Touch

**New:**
- `src/services/profile.ts` — `updateMyProfile`, `changePassword`
- `src/services/admins.ts` — `createAdmin`, `promoteToAdmin`

**Modified:**
- `src/services/auth.ts` — add `resetPassword`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2–6 (all UI sprints call these service functions)
- **External:** none — pure TypeScript, no backend needed

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `PATCH /me` body type contains only `firstName?` and `lastName?` — no `profilePhotoUrl` parameter exposed yet
- [ ] `POST /me/change-password` body type contains only `newPassword` — no `currentPassword` field
- [ ] `initialPassword` marked in `redactFields` so it never appears in DebugPanel logs
- [ ] No UI changes — service layer only

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test: none needed — pure service layer.

---

## 📝 Notes

- `ApiUserProfile` is already defined in `src/services/auth.ts`. Import it from there; do NOT create a duplicate in `profile.ts` or `admins.ts`.
- The `apiFetch` function auto-attaches the Firebase token — callers do not pass `token` manually.
- `POST /me/change-password` takes only `newPassword`. The existing `EditProfileScreen` has a "Current password" field — that is removed in Sprint 3, not here.
- `POST /auth/password-reset` always returns `200` whether or not the email exists (prevents enumeration). Do not treat a 200 response as confirmation the email was found.

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

**Next:** [`sprint-02-profile-display-real-data.md`](./sprint-02-profile-display-real-data.md)
