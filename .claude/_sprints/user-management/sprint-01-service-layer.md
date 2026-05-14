# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create all three service files with API-aligned types and typed fetch functions.

---

## 📋 Tasks

**`src/services/userManagement.ts` (new)**
- [ ] `ApiUser` interface: `{ uid, email, role, status, firstName, lastName, enrolledCourses, createdAt }`
- [ ] `ApiUserDetail` extends `ApiUser` with `{ enrollments: Array<{ courseId, courseTitle, enrollmentState, completionPercent, approvedAt }>, profilePhotoUrl: string|null }`
- [ ] `listUsers(params: { status?, role?, q?, cursor? })` → `GET /users?limit=25`, tag: `'users.list'`
- [ ] `getUserById(uid)` → `GET /users/${uid}`, tag: `'users.getById'`
- [ ] `suspendUser(uid, reason?)` → `POST /users/${uid}/suspend`, body: `reason?.trim() ? { reason } : {}`, tag: `'users.suspend'`
- [ ] `reactivateUser(uid)` → `POST /users/${uid}/reactivate` (no body), tag: `'users.reactivate'`

**`src/services/adminManagement.ts` (new)**
- [ ] `listAdmins(params: { status?, q?, cursor? })` → `GET /super-admin/admins?limit=25`, tag: `'admins.list'`
- [ ] `getAdminById(uid)` → `GET /super-admin/admins/${uid}`, tag: `'admins.getById'`
- [ ] `suspendAdmin(uid, reason?)` → `POST /super-admin/admins/${uid}/suspend`, body: `reason?.trim() ? { reason } : {}`, tag: `'admins.suspend'`
- [ ] `reactivateAdmin(uid)` → `POST /super-admin/admins/${uid}/reactivate` (no body), tag: `'admins.reactivate'`
- [ ] `deleteAdmin(uid)` → `DELETE /super-admin/admins/${uid}` (returns 204 → `ApiResult<undefined>`), tag: `'admins.delete'`

**`src/services/auditLog.ts` (new)**
- [ ] `ApiAuditEntry` interface: `{ id, when, actor: { uid: string|null; email: string|null }, action, category, ip, targetType, targetId, requestId }`
- [ ] `getAuditLog(params?: { category?, action?, from?, to?, cursor?, limit? })` → `GET /audit-log?limit=20`, tag: `'audit.list'`

---

## 📁 Files to Touch

**New:**
- `src/services/userManagement.ts`
- `src/services/adminManagement.ts`
- `src/services/auditLog.ts`

**Modified / Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2, 3, 4
- **External:** none — pure TypeScript

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `reactivateUser` and `reactivateAdmin` send **no body** — `body` option must NOT be passed
- [ ] `suspendUser`/`suspendAdmin` only send `reason` when it's non-empty: `reason?.trim() ? { reason } : {}`
- [ ] `deleteAdmin` uses `ApiResult<undefined>` return type (204 response)
- [ ] `ApiAuditEntry.actor` is an object `{ uid, email }` — NOT a flat string

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

No device needed — pure service layer.

---

## 📝 Notes

- The `reason` guard pattern: `reason?.trim() ? { reason: reason.trim() } : {}` — ensures an empty string is treated as no reason.
- `actor.uid` and `actor.email` can both be `null` for system-generated audit events. The interface must reflect `string | null`.

---

## 🐛 Issues Encountered

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

**Next:** [`sprint-02-user-management-ui.md`](./sprint-02-user-management-ui.md)
