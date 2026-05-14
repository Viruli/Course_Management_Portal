# User Management, Admin Management and Audit Log Integration

**Spec ID:** 007-user-management
**Branch:** `feat/user-management`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Wire three admin/super-admin screens to the real API:
1. **User Management** (§13) — `UsersScreen` and `UserDetailScreen` load real student/admin data, and suspend/reactivate actions call the API instead of the mock `usersStore`.
2. **Admin Management** (§14) — `AdminsScreen` lists real admin accounts, with suspend, reactivate, and delete wired for super admin.
3. **Audit Log** (§15) — `AuditScreen` loads the real append-only audit log from `GET /audit-log`.

---

## User Stories
- As an **admin/super admin**, I want to see the real list of users with their current status, so I can identify who to suspend or reactivate.
- As an **admin/super admin**, I want to view a user's full profile including enrollment history, so I have context before taking an action.
- As an **admin/super admin**, I want to suspend or reactivate a student account via the API, so the backend enforces the change.
- As a **super admin**, I want to see the real list of admin accounts so I can manage them.
- As a **super admin**, I want to suspend, reactivate, or delete an admin account via the API.
- As an **admin/super admin**, I want to browse the real audit log with filters by category, so I can review platform activity.

---

## API Contract

### §13.1 — List users
**Endpoint:** `GET /users`
**Auth:** bearer (admin, super_admin)
**Query params:** `status` (pending_approval|approved|rejected|suspended), `role` (default: student), `q` (search), `limit` (default 25), `cursor`
**Success:** `200` paginated
```json
{
  "items": [
    { "uid", "email", "role", "status", "firstName", "lastName", "enrolledCourses", "createdAt" }
  ],
  "nextCursor": null, "total": 47
}
```

### §13.2 — Get user by ID
**Endpoint:** `GET /users/:uid`
**Auth:** bearer (admin, super_admin)
**Success:** `200` — full user object including `enrollments[]` with `completionPercent`

### §13.3 — Suspend user
**Endpoint:** `POST /users/:uid/suspend`
**Auth:** bearer (admin, super_admin)
**Request body:** `{ "reason"?: string }` — optional
**Success:** `200` `{ "uid", "status": "suspended" }`
**Error codes:** `ALREADY_SUSPENDED` (409)

### §13.4 — Reactivate user
**Endpoint:** `POST /users/:uid/reactivate`
**Auth:** bearer (admin, super_admin)
**Request body:** none
**Success:** `200` `{ "uid", "status": "approved" }`
**Error codes:** `ALREADY_ACTIVE` (409)

### §14.1 — List admins
**Endpoint:** `GET /super-admin/admins`
**Auth:** bearer (super_admin only)
**Query params:** `status` (approved|suspended), `q`, `limit` (default 25), `cursor`
**Success:** `200` paginated — same shape as user list

### §14.3 — Get admin by ID
**Endpoint:** `GET /super-admin/admins/:uid`
**Auth:** bearer (super_admin)
**Success:** `200` — full admin user object

### §14.4 — Suspend admin
**Endpoint:** `POST /super-admin/admins/:uid/suspend`
**Auth:** bearer (super_admin)
**Request body:** `{ "reason"?: string }` — optional, max 500 chars
**Success:** `200` — full updated admin object

### §14.5 — Reactivate admin
**Endpoint:** `POST /super-admin/admins/:uid/reactivate`
**Auth:** bearer (super_admin)
**Request body:** none
**Success:** `200` — full updated admin object

### §14.6 — Delete admin
**Endpoint:** `DELETE /super-admin/admins/:uid`
**Auth:** bearer (super_admin)
**Request body:** none
**Success:** `204 No Content`
**Note:** Only accounts with `role: "admin"` may be deleted. Attempting to delete a super_admin returns 404.

### §15.1 — Get audit log
**Endpoint:** `GET /audit-log`
**Auth:** bearer (admin, super_admin)
**Query params:** `category` (auth|user|course|enrollment|progress|storage|system), `action`, `from`, `to`, `limit` (default 20), `cursor`
**Success:** `200` paginated
```json
{
  "items": [
    { "id", "when", "actor": { "uid", "email" }, "action", "category", "ip", "targetType", "targetId", "requestId" }
  ],
  "nextCursor": null, "total": 142
}
```
**Note:** `when` field (not `createdAt`) — ISO 8601 timestamp. `actor` is an object with `uid` and `email`, not a flat string.

---

## Screens / Navigation

- **Modified screens:**
  - `src/screens/superadmin/UsersScreen.tsx` — replace `usersStore` mock with `GET /users` per filter; pass real `uid` to `UserDetailScreen`
  - `src/screens/superadmin/UserDetailScreen.tsx` — load real user from `GET /users/:uid`; wire suspend/reactivate to real API; suspend should prompt for optional reason
  - `src/screens/superadmin/AdminsScreen.tsx` — replace `usersStore` mock with `GET /super-admin/admins`; wire suspend/reactivate/delete actions
  - `src/screens/admin/AuditScreen.tsx` — replace `AUDIT` mock with `GET /audit-log`; map `category` filter to API `category` param; display real `when` + `actor.email` + `action`

- **Navigation changes:** none

---

## State / Stores

- **Approach:** No new Zustand store for these screens — all data is component-local state (same pattern as `CoursesScreen` from feat/course-builder-api). Each screen manages its own `users/admins/entries: []` + `loading` + pagination.
- **New API types** (define in service files):
  - `ApiUser`: `{ uid, email, role, status, firstName, lastName, enrolledCourses, createdAt }`
  - `ApiUserDetail` extends `ApiUser` with `enrollments[]` + `profilePhotoUrl`
  - `ApiAuditEntry`: `{ id, when, actor: { uid, email }, action, category, ip, targetType, targetId, requestId }`
- **`usersStore`** — retain for backward compat (other screens still reference it for the promote-to-admin mock and change-role feature). Do NOT delete it — just stop using it in the screens wired in this feature.

---

## UI States

- **Loading:** `ActivityIndicator` while list loads
- **Empty:** existing `EmptyState` per screen
- **Suspend user:** optional reason input via `Alert.prompt` (iOS) or the existing `RejectReasonModal` pattern (cross-platform); confirm before calling API
- **Delete admin:** confirmation dialog before `DELETE /super-admin/admins/:uid`
- **Pagination:** load first page (limit 25/20) on mount; no infinite scroll yet
- **Audit log filters:** map existing UI filter pills to `category` query param

---

## Functional Requirements

- [ ] Create `src/services/userManagement.ts`:
  - `ApiUser`, `ApiUserDetail` interfaces
  - `listUsers(params: { status?, role?, q?, cursor? })` → `GET /users`
  - `getUserById(uid)` → `GET /users/:uid`
  - `suspendUser(uid, reason?)` → `POST /users/:uid/suspend`
  - `reactivateUser(uid)` → `POST /users/:uid/reactivate` (no body)

- [ ] Create `src/services/adminManagement.ts`:
  - `listAdmins(params: { status?, q?, cursor? })` → `GET /super-admin/admins`
  - `getAdminById(uid)` → `GET /super-admin/admins/:uid`
  - `suspendAdmin(uid, reason?)` → `POST /super-admin/admins/:uid/suspend`
  - `reactivateAdmin(uid)` → `POST /super-admin/admins/:uid/reactivate` (no body)
  - `deleteAdmin(uid)` → `DELETE /super-admin/admins/:uid` (204)

- [ ] Create `src/services/auditLog.ts`:
  - `ApiAuditEntry` interface: `{ id, when, actor: { uid: string|null; email: string|null }, action, category, ip, targetType, targetId, requestId }`
  - `getAuditLog(params: { category?, action?, from?, to?, cursor?, limit? })` → `GET /audit-log`

- [ ] Update `UsersScreen.tsx`:
  - Replace `usersStore` reads with `listUsers({ role: 'student' })` (or all roles)
  - Load on mount + on filter change
  - Pass real `uid` string to `UserDetailScreen` navigation

- [ ] Update `UserDetailScreen.tsx`:
  - Load `getUserById(uid)` on mount instead of looking up `usersStore`
  - Wire suspend: show reason prompt → `suspendUser(uid, reason?)` → update local state
  - Wire reactivate: `reactivateUser(uid)` → update local state
  - Handle `ALREADY_SUSPENDED` / `ALREADY_ACTIVE` (409) → toast

- [ ] Update `AdminsScreen.tsx`:
  - Replace `usersStore` reads with `listAdmins()` on mount (super admin only)
  - Wire suspend → `suspendAdmin(uid, reason?)`
  - Wire reactivate → `reactivateAdmin(uid)`
  - Wire delete → confirmation → `deleteAdmin(uid)` → remove from local list

- [ ] Update `AuditScreen.tsx`:
  - Replace `AUDIT` mock with `getAuditLog()` on mount
  - Map UI filter pills → `category` API param: `success` → `enrollment`, `info` → `user|course`, etc. (or simplify to pass category directly)
  - Display `entry.when` (formatted), `entry.actor.email`, `entry.action`, `entry.targetType`
  - Show `ActivityIndicator` while loading

---

## Non-Functional Requirements

- [ ] **Performance** — list loads within 3 s; no infinite scroll yet
- [ ] **Accessibility** — all action buttons ≥ 44pt
- [ ] **Security** — suspend reason field max 500 chars; `reactivateUser`/`reactivateAdmin` send no body
- [ ] **Offline** — network failure → toast + keep existing list visible

---

## Acceptance Criteria

- [ ] `UsersScreen` loads real users from `GET /users` on mount
- [ ] `UserDetailScreen` loads real user profile from `GET /users/:uid`
- [ ] Suspend user calls `POST /users/:uid/suspend`; suspended badge updates
- [ ] Reactivate user calls `POST /users/:uid/reactivate`; active badge updates
- [ ] `AdminsScreen` loads real admins from `GET /super-admin/admins` (super admin only)
- [ ] Delete admin shows confirmation → `DELETE /super-admin/admins/:uid` → item removed
- [ ] `AuditScreen` loads real entries from `GET /audit-log`
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `usersStore` usage in `UsersScreen`, `UserDetailScreen`, `AdminsScreen`; `AUDIT` mock in `AuditScreen`
- **Keep mock:** `usersStore` store itself (used by other screens for `changeRole` and badge counts until fully migrated)

---

## Out of Scope

- Pagination / infinite scroll (first page only)
- User search in `UsersScreen` (API supports `q` param — add to future sprint)
- Audit log date range filter (API supports `from`/`to` — add to future sprint)
- `GET /super-admin/admins/:uid` detail screen (no UI exists for this — new screen out of scope)

---

## Definition of Done

- [ ] Spec status → `shipped`
- [ ] `src/services/userManagement.ts`, `adminManagement.ts`, `auditLog.ts` created
- [ ] `UsersScreen`, `UserDetailScreen`, `AdminsScreen`, `AuditScreen` wired
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on device
- [ ] PR references this spec

---

## References Used

- `CLAUDE.md`
- API Reference §13.1–13.4 (User Management), §14.1 + §14.3–14.6 (Admin Mgmt), §15.1 (Audit Log)
- `src/screens/superadmin/UsersScreen.tsx` — currently reads from `usersStore` mock
- `src/screens/admin/AuditScreen.tsx` — currently reads from `AUDIT` mock
