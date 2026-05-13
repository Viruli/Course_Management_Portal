# Implementation Plan: User Management, Admin Management and Audit Log Integration

**Spec:** [`.claude/_specs/007-user-management.md`](../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 2–3 days (device testing blocked on backend + admin session)

---

## 📋 Context

Three screens in the admin/super-admin flows currently read from the mock `usersStore` and `AUDIT` constant. This plan replaces them with real API calls. All three areas are self-contained with component-local state — no new Zustand store needed.

- **Spec:** 007-user-management
- **API Reference:** §13.1–13.4 (Users), §14.1 + §14.3–14.6 (Admins), §15.1 (Audit Log)
- **Replaces mock:** `usersStore` reads in `UsersScreen`, `UserDetailScreen`, `AdminsScreen`; `AUDIT` constant in `AuditScreen`

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | **Component-local state** — no new Zustand store | User/admin lists are per-session admin data; no cross-screen reactivity needed | `UsersScreen`, `UserDetailScreen`, `AdminsScreen`, `AuditScreen` |
| 2 | **Pessimistic updates** on suspend/reactivate/delete | Backend must confirm before UI changes — admin actions require server authority | All action handlers |
| 3 | **Keep `usersStore`** — stop using it in these screens but don't delete it | Other screens still reference it (`changeRole`, badge counts) until full migration | `usersStore` |
| 4 | `suspendUser`/`suspendAdmin` ask for optional reason via `RejectReasonModal` (reuse existing component) | Already built for queue screens; consistent UX for reason entry | `UserDetailScreen`, `AdminsScreen` |
| 5 | `reactivateUser`/`reactivateAdmin` send **no body** | API spec explicitly — sending `{}` would be wrong | Service files |
| 6 | `DELETE /super-admin/admins/:uid` returns `204 No Content` — handle as `ApiResult<undefined>` | Same pattern as semester/subject delete in course-builder | `adminManagement.ts` |
| 7 | Audit log `actor` is an object `{ uid, email }` not a flat string — display `actor.email` | API v1.1 changed the shape; mock had a flat `who` string | `AuditScreen` |
| 8 | Audit log filter map: UI pill `success` → API `category=enrollment`, `info` → `category=user`, `warning` → no category filter (shows all) | Approximation; exact mapping can be refined with real data | `AuditScreen` |
| 9 | First page only (limit 25 users/admins, limit 20 audit entries) — no infinite scroll | Keeps scope manageable; pagination added in a future sprint | All list screens |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/userManagement.ts`:
  - `ApiUser` interface: `{ uid, email, role, status, firstName, lastName, enrolledCourses, createdAt }`
  - `ApiUserDetail` extends `ApiUser` with `enrollments: Array<{ courseId, courseTitle, enrollmentState, completionPercent, approvedAt }>` and `profilePhotoUrl`
  - `listUsers(params: { status?, role?, q?, cursor? })` → `GET /users?limit=25`, tag: `'users.list'`
  - `getUserById(uid)` → `GET /users/${uid}`, tag: `'users.getById'`
  - `suspendUser(uid, reason?)` → `POST /users/${uid}/suspend`, body: `reason ? { reason } : {}`, tag: `'users.suspend'`
  - `reactivateUser(uid)` → `POST /users/${uid}/reactivate` (no body), tag: `'users.reactivate'`

- [ ] Create `src/services/adminManagement.ts`:
  - `listAdmins(params: { status?, q?, cursor? })` → `GET /super-admin/admins?limit=25`, tag: `'admins.list'`
  - `getAdminById(uid)` → `GET /super-admin/admins/${uid}`, tag: `'admins.getById'`
  - `suspendAdmin(uid, reason?)` → `POST /super-admin/admins/${uid}/suspend`, body: `reason ? { reason } : {}`, tag: `'admins.suspend'`
  - `reactivateAdmin(uid)` → `POST /super-admin/admins/${uid}/reactivate` (no body), tag: `'admins.reactivate'`
  - `deleteAdmin(uid)` → `DELETE /super-admin/admins/${uid}` (returns 204), tag: `'admins.delete'`

- [ ] Create `src/services/auditLog.ts`:
  - `ApiAuditEntry` interface: `{ id, when, actor: { uid: string|null; email: string|null }, action, category, ip, targetType, targetId, requestId }`
  - `getAuditLog(params?: { category?, action?, from?, to?, cursor?, limit? })` → `GET /audit-log?limit=20`, tag: `'audit.list'`

### Phase 2: User Management UI

- [ ] Update `UsersScreen.tsx`:
  - Replace `usersStore` reads with component state: `users: ApiUser[]`, `loading: boolean`
  - `useEffect`: call `listUsers({ role: activeFilter === 'all' ? undefined : activeFilter })` on mount and filter change
  - Map `ApiUser` fields to display: name = `${firstName} ${lastName}`, email, status badge, `enrolledCourses` count
  - Tap a user row → `navigation.navigate('UserDetail', { uid: user.uid })` (pass `uid` string, not full object)

- [ ] Update `UserDetailScreen.tsx`:
  - On mount: call `getUserById(uid)` where `uid` comes from `route.params`
  - Show loading spinner while fetching
  - Display: name, email, role, status, `enrollments[]` list with `courseTitle` + `completionPercent`
  - **Suspend button** (when `status === 'approved'`):
    - Open `RejectReasonModal` for optional reason
    - On confirm: call `suspendUser(uid, reason?)` → update local user state to `status: 'suspended'`
    - Handle `ALREADY_SUSPENDED` (409) → toast
  - **Reactivate button** (when `status === 'suspended'`):
    - Call `reactivateUser(uid)` → update local user state to `status: 'approved'`
    - Handle `ALREADY_ACTIVE` (409) → toast

### Phase 3: Admin Management UI

- [ ] Update `AdminsScreen.tsx`:
  - Replace `usersStore` reads with component state: `admins: ApiUser[]`, `loading: boolean`
  - On mount: call `listAdmins()`
  - 3-dot menu (per admin card):
    - **Suspend** → `RejectReasonModal` for reason → `suspendAdmin(uid, reason?)` → update badge in local list
    - **Reactivate** → `reactivateAdmin(uid)` → update badge
    - **Delete** → `Alert.alert` confirmation → `deleteAdmin(uid)` → remove from local list
  - "Invite an admin" button: already wired to `CreateAdminScreen` in `feat/profile-mgmt` — keep as-is

### Phase 4: Audit Log UI

- [ ] Update `AuditScreen.tsx`:
  - Replace `AUDIT` mock with component state: `entries: ApiAuditEntry[]`, `loading: boolean`
  - On mount: call `getAuditLog()` with current filter
  - Map UI filter pills → API `category` param:
    - "All" → no category param
    - "Approvals" → `category=enrollment`
    - "Changes" → `category=user`
    - "Warnings" → no category (show all — closest approximation)
  - Display `entry.when` (formatted relative date), `entry.actor?.email ?? 'System'`, `entry.action`, `entry.targetType`
  - Remove `ico` / `tone` mock fields — use `category` to determine icon/colour instead:
    - `enrollment` → green ✓
    - `user` → blue info
    - `auth` → orange key
    - `course` → purple book
    - `system` / default → grey

### Phase 5: Edge Cases & Polish

- [ ] All list screens: network failure → toast + show empty state; no crash
- [ ] `suspendUser`/`suspendAdmin` `ALREADY_SUSPENDED` (409) → toast "This account is already suspended." + refresh
- [ ] `reactivateUser`/`reactivateAdmin` `ALREADY_ACTIVE` (409) → toast "This account is already active." + refresh
- [ ] `deleteAdmin` `USER_NOT_FOUND` (404) → toast + remove from local list
- [ ] Reason field in `RejectReasonModal` validated ≤ 500 chars before API call
- [ ] Dark mode: verify all new screens in dark mode
- [ ] Grep: no `usersStore` reads remain in `UsersScreen`, `UserDetailScreen`, `AdminsScreen`

### Phase 6: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Sign in as admin → Users tab → real user list loads
- [ ] Tap a user → real profile + enrollment history shown
- [ ] Suspend a user → backend confirms → status badge updates
- [ ] Sign in as super admin → Admins screen → real admin list loads
- [ ] Suspend/reactivate an admin → confirmed
- [ ] Delete an admin → confirmation dialog → admin removed from list
- [ ] Audit screen → real entries load with actor emails + actions
- [ ] Filter by "Approvals" → enrollment category entries shown

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/userManagement.ts` | **new** | `listUsers`, `getUserById`, `suspendUser`, `reactivateUser` |
| `src/services/adminManagement.ts` | **new** | `listAdmins`, `getAdminById`, `suspendAdmin`, `reactivateAdmin`, `deleteAdmin` |
| `src/services/auditLog.ts` | **new** | `getAuditLog` + `ApiAuditEntry` type |
| `src/screens/superadmin/UsersScreen.tsx` | modified | API-driven list, pass `uid` to detail |
| `src/screens/superadmin/UserDetailScreen.tsx` | modified | `getUserById`, suspend/reactivate wired |
| `src/screens/superadmin/AdminsScreen.tsx` | modified | API-driven list, suspend/reactivate/delete |
| `src/screens/admin/AuditScreen.tsx` | modified | `getAuditLog`, real entries + filter mapping |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires Firebase + backend)
- [ ] Happy path — admin: view users list → tap user → see enrollments
- [ ] Happy path — suspend user → status badge changes
- [ ] Happy path — super admin: view admins → delete admin → confirmation → removed
- [ ] Happy path — audit log: loads → filter by Approvals → filtered list
- [ ] Error path: network off → toast, list stays visible
- [ ] Toggle dark mode on all modified screens

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` introduced
- [ ] No `usersStore` reads in `UsersScreen`, `UserDetailScreen`, `AdminsScreen`
- [ ] No `AUDIT` mock import in `AuditScreen`
- [ ] `reactivateUser`/`reactivateAdmin` sends **no body**
- [ ] `suspendUser`/`suspendAdmin` only includes `reason` when provided and non-empty
- [ ] `deleteAdmin` returns 204 — handled as `ApiResult<undefined>`
- [ ] Audit `actor.email` (not flat `who` string) displayed
- [ ] All phases completed
- [ ] Spec status → `shipped`
- [ ] PR references spec

---

## 📝 Progress Tracking

**Status legend:**
- 🟡 Draft — Planning stage
- 🔵 In Progress — Implementation started
- 🟢 Complete — All phases done
- 🔴 Blocked — Waiting on dependency

**Current Phase:** Phase 1
**Completion:** 0%

---

## 📌 Notes

- **`usersStore` retention:** Do NOT delete `usersStore` — it's still used by `changeRole` (promote to admin mock in `UserDetailScreen`) and other non-wired screens. Only stop reading from it in the three screens wired in this feature.
- **`RejectReasonModal` import:** Already built in `feat/admin-queues` (not yet merged to main). On this branch (`feat/user-management` off main), `RejectReasonModal` doesn't exist yet. Either use a simple `Alert.alert` as a placeholder and update when queues merge, or recreate the modal here.
- **Audit log `actor` null case:** The API doc says `actor.uid` and `actor.email` can be null for system events. Display `'System'` when null.
- **Filter mapping for audit log:** The mapping is approximate. Once real data is available, adjust the `category` values sent to the API based on what the backend actually produces.
