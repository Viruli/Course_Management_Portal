# Implementation Plan: Admin Registration and Enrollment Queue Integration

**Spec:** [`.claude/_specs/003-admin-queues.md`](../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 1–2 days (device testing blocked on backend)

---

## 📋 Context

Both `RegistrationsScreen` and `EnrolmentsScreen` currently read from and mutate `approvalsStore`, which is seeded with mock data (`REGISTRATIONS`, `ENROLMENTS` from `data/mock.ts`). This plan replaces the mock with real API calls.

Both `admin` and `super_admin` roles have identical access to these queues. There is only one super admin in the system; the super admin additionally manages admin accounts (covered in spec 002, already implemented).

- **Spec:** 003-admin-queues
- **API Reference:** §9.1–9.4 (Registrations), §10.1–10.3 (Enrollments)
- **Replaces mock:** `REGISTRATIONS` and `ENROLMENTS` seeding in `approvalsStore`

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | `approvalsStore` remains the reactive data layer — fetches from API and caches in memory | Badge counts, tab counts, and dashboard cards all derive from the store reactively. Keeping the store as the single source avoids prop drilling and makes badge updates instant after an action. | `approvalsStore`, all screens that read counts |
| 2 | **Pessimistic updates** — local state updates only after a successful API response | Avoids showing stale or incorrect state if the API call fails. An item is only removed from the pending list when the server confirms it. | All approve/reject handlers |
| 3 | Reject reason via a **custom modal** (not `Alert.prompt`) | `Alert.prompt` is iOS-only. A cross-platform modal/bottom-sheet works on Android too. Use a simple `Modal` component with a `TextInput`. | `RegistrationsScreen`, `EnrolmentsScreen` |
| 4 | Reason field is **optional** — user can reject without typing | Matches API contract: `reason` is optional in both §9.3 and §10.3. The modal must allow dismissing with or without a reason. | Reject modal UI |
| 5 | Tab change in `RegistrationsScreen` triggers a **fresh fetch** for that status | The three tabs (pending/approved/rejected) map to distinct API queries. Avoid re-fetching on every render; fetch once per tab activation. | `RegistrationsScreen` |
| 6 | `EnrolmentsScreen` loads only `status=pending` for now | The existing screen only shows pending items. Adding approved/rejected tabs is out of scope; the API supports it when needed. | `EnrolmentsScreen` |
| 7 | Bulk-approve registrations: collect **all pending IDs** from the store and send in one `POST /admin/registrations/bulk-approve` call | The API supports 1–50 IDs per call. If pending count > 50, split into chunks. Show partial-failure summary if `failed[]` is non-empty. | `RegistrationsScreen` bulk-approve handler |
| 8 | "Approve all" enrollments: **loop individual calls** — no batch endpoint exists | `POST /admin/enrollments/:id/approve` must be called per item. Await each sequentially to avoid flooding; show a summary toast after all complete. | `EnrolmentsScreen` approve-all handler |
| 9 | New API types defined in service files — **do NOT reuse mock `Registration`/`Enrolment` types** from `src/data/types.ts` | Mock types (`name`, `when`, `course`) don't match API fields (`firstName`+`lastName`, `submittedAt`, `courseTitle`). Using old types would cause runtime mismatches when the backend is connected. | All new service files, store |
| 10 | Both admin and super_admin see the same queues — **no role-based filtering in the UI** | The API endpoints are identical for both roles. The navigators already route both roles through the same queue screens. | No change needed |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/registrations.ts`:
  - `ApiRegistration` interface: `{ id, studentUid, firstName, lastName, email, status: 'pending'|'approved'|'rejected', submittedAt }`
  - `BulkApproveResult` interface: `{ approved: string[], failed: { id: string, reason: string }[] }`
  - `listRegistrations(params: { status?: string; q?: string; cursor?: string })` → `GET /admin/registrations`; returns `ApiResult<PaginatedResponse<ApiRegistration>>`
  - `approveRegistration(id: string)` → `POST /admin/registrations/:id/approve`
  - `rejectRegistration(id: string, reason?: string)` → `POST /admin/registrations/:id/reject`
  - `bulkApproveRegistrations(ids: string[])` → `POST /admin/registrations/bulk-approve`; returns `ApiResult<BulkApproveResult>`

- [ ] Create `src/services/enrollments.ts` (admin-side):
  - `ApiAdminEnrollment` interface: `{ id, studentUid, studentName, studentEmail, courseId, courseTitle, state: 'pending'|'approved'|'rejected'|'withdrawn', submittedAt }`
  - `listAdminEnrollments(params: { status?: string; courseId?: string; cursor?: string })` → `GET /admin/enrollments`
  - `approveEnrollment(id: string)` → `POST /admin/enrollments/:id/approve`
  - `rejectEnrollment(id: string, reason?: string)` → `POST /admin/enrollments/:id/reject`

### Phase 2: Store Update

- [ ] Update `src/store/approvalsStore.ts`:
  - Import `ApiRegistration` from `src/services/registrations.ts` and `ApiAdminEnrollment` from `src/services/enrollments.ts`
  - Replace `Registration[]` with `ApiRegistration[]` and `Enrolment[]` with `ApiAdminEnrollment[]`
  - **Remove** mock seeding (`REGISTRATIONS`, `ENROLMENTS` imports and initial state)
  - Replace initial state: `registrations: []`, `enrolments: []`, add `loadingRegistrations: false`, `loadingEnrolments: false`
  - Add `fetchRegistrations(status: string)` async action:
    - Sets `loadingRegistrations = true`
    - Calls `listRegistrations({ status })`
    - Sets `registrations` to `result.data.items`
    - Sets `loadingRegistrations = false`; handles error with `toast.error`
  - Add `fetchEnrollments(status?: string)` async action — same pattern
  - Update `approveRegistration(id)` → call `approveRegistration` service, then remove item from `registrations` list on success
  - Update `rejectRegistration(id, reason?)` → call `rejectRegistration` service, then remove item from `registrations` pending list on success
  - Update `approveEnrolment(id)` → call `approveEnrollment` service, then remove from `enrolments` on success
  - Update `rejectEnrolment(id, reason?)` → call `rejectEnrollment` service, then remove from `enrolments` on success
  - Update `approveAllEnrolments()` → loop `approveEnrolment(id)` for each pending item; return `{ approved: number, failed: number }`

### Phase 3: UI Wiring — RegistrationsScreen

- [ ] Update `src/screens/admin/RegistrationsScreen.tsx`:
  - Call `fetchRegistrations(filter)` on mount and whenever `filter` (tab) changes; use `useEffect`
  - Show a loading indicator while `loadingRegistrations` is true (replace list with spinner)
  - Map `ApiRegistration` fields for display: name = `${firstName} ${lastName}`, email = `email`, date = `submittedAt` (format to readable string)
  - **Approve button**: call `approveRegistration(id)` from store; disable the button while the item is being processed (add per-item `processingId` state)
  - **Reject button**: open a `RejectReasonModal` (see Phase 4), confirm → call `rejectRegistration(id, reason?)`
  - **Bulk-approve button** (replaces current `approveAllEnrolments` usage): collect all pending IDs → call `bulkApproveRegistrations(ids)` → show summary toast: "X approved." or "X approved, Y failed."
  - Handle `INVALID_STATE` error: show toast "This registration has already been processed." and refresh the list

### Phase 4: UI Wiring — EnrolmentsScreen + Shared Modal

- [ ] Create a shared `RejectReasonModal` component (or inline `Modal`) — reusable by both screens:
  - Props: `visible: boolean`, `onConfirm(reason?: string): void`, `onCancel(): void`
  - `TextInput` for reason (placeholder "Optional reason for the student…", maxLength 500)
  - Two buttons: "Skip" (confirm with no reason) and "Reject" (confirm with reason)
  - Works on both iOS and Android

- [ ] Update `src/screens/admin/EnrolmentsScreen.tsx`:
  - Call `fetchEnrollments('pending')` on mount
  - Show loading indicator while `loadingEnrolments` is true
  - Map `ApiAdminEnrollment` fields: name = `studentName`, course = `courseTitle`, date = `submittedAt`
  - **Approve button**: call `approveEnrolment(id)` from store; per-item loading state
  - **Reject button**: open `RejectReasonModal` → call `rejectEnrolment(id, reason?)`
  - **"Approve all"**: call store `approveAllEnrolments()` → show summary: "X approved." or "X approved, Y failed."
  - Remove the "Note" button (calls `toast.info` — it's a stub; remove it as there's no API endpoint for notes)

### Phase 5: Edge Cases & Polish

- [ ] Network failure on `fetchRegistrations` / `fetchEnrollments` → `toast.error` + show existing (possibly empty) list; do not crash
- [ ] Network failure on individual approve/reject → `toast.error` + re-enable the button; item stays in the list
- [ ] `INVALID_STATE` (409) on approve/reject → toast "Already processed." + refresh the list to remove the stale item
- [ ] Bulk-approve with `failed[]` non-empty → toast with partial result: "11 approved. 1 failed: [ID]."
- [ ] Bulk-approve with 0 pending → toast "No pending registrations to approve."
- [ ] "Approve all" enrollments with 0 pending → toast "No pending enrolments to approve."
- [ ] Dark mode check on `RegistrationsScreen`, `EnrolmentsScreen`, and the reject reason modal
- [ ] Verify no `toast.info('… coming soon')` remains on any touched button (particularly the "Note" button stub in `EnrolmentsScreen`)
- [ ] Badge counts on admin dashboard and tab nav still update correctly after approve/reject (they derive from `approvalsStore`)

### Phase 6: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires backend + Firebase config)
- [ ] **Registration pending tab**: real requests appear on mount
- [ ] **Approve registration**: tap Approve → item removed from pending tab → moves to approved tab on re-fetch
- [ ] **Reject with reason**: tap Reject → modal opens → type reason → confirm → item removed
- [ ] **Reject without reason**: tap Reject → tap "Skip" → confirm without reason
- [ ] **Bulk-approve**: pending list has multiple items → tap bulk-approve → summary toast
- [ ] **Enrolment queue**: real pending enrolments appear
- [ ] **Approve enrolment**: tap Approve → item removed
- [ ] **Reject enrolment with reason**: modal → confirm
- [ ] **Approve all enrolments**: summary toast
- [ ] **Admin role and super admin role**: both see the same queues
- [ ] **Dark mode**: toggle during queue interaction

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/registrations.ts` | **new** | `listRegistrations`, `approveRegistration`, `rejectRegistration`, `bulkApproveRegistrations` |
| `src/services/enrollments.ts` | **new** | `listAdminEnrollments`, `approveEnrollment`, `rejectEnrollment` |
| `src/store/approvalsStore.ts` | modified | Replace mock seeding with API types + async fetch/action functions |
| `src/screens/admin/RegistrationsScreen.tsx` | modified | Wire API, loading state, reject modal, bulk-approve |
| `src/screens/admin/EnrolmentsScreen.tsx` | modified | Wire API, loading state, reject modal, approve-all loop |
| `src/components/RejectReasonModal.tsx` | **new** | Shared cross-platform reject reason input modal |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (backend + Firebase required)
- [ ] Happy path — registration: approve → approved tab shows item
- [ ] Happy path — registration: reject with reason → rejected tab shows item
- [ ] Happy path — registration: bulk-approve all pending → summary toast
- [ ] Happy path — enrollment: approve → removed from list
- [ ] Happy path — enrollment: reject with reason → removed
- [ ] Happy path — enrollment: "Approve all" → all removed, summary toast
- [ ] Error path: network off → toast, item stays in list, button re-enabled
- [ ] Verify as admin role + as super admin role — both see same queues
- [ ] Toggle dark mode — reject modal renders correctly

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` introduced
- [ ] No `toast.info('… coming soon')` on any queue button ("Note" button removed)
- [ ] `POST /admin/registrations/:id/reject` body contains `reason` only when provided — no empty string sent
- [ ] `POST /admin/registrations/bulk-approve` body: `{ "registrationIds": [...] }` — matches API exactly
- [ ] `POST /admin/enrollments/:id/reject` body: same pattern as registration reject
- [ ] Loading indicator shown while fetching; buttons disabled while individual action is in flight
- [ ] All design decisions implemented
- [ ] All 6 phases completed
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

- **Backend blocker:** Phases 1–5 can be fully coded and TypeScript-verified without the backend. Phase 6 (device test) needs the backend.
- **One super admin rule:** The API enforces this server-side. The frontend has no special UI for this constraint in the queue screens — it's only relevant to the admin management screens (spec 002, already implemented).
- **Mock types:** `src/data/types.ts` has `Registration` and `Enrolment` mock types. Do NOT import or extend these. Define `ApiRegistration` and `ApiAdminEnrollment` in the service files only.
- **"Note" button:** The `EnrolmentsScreen` has a "Note" stub button (`toast.info`). Remove it — there is no notes/comment endpoint in the API.
- **`approveAllEnrolments` return type:** The current mock store returns a number. The async version should return `{ approved: number, failed: number }` so the UI can show a proper summary.
- **Tab badge counts:** `AdminDashboardScreen` and the nav tab badge derive pending counts from `approvalsStore`. Once the store fetches real data, these update automatically — no extra wiring needed.
