# Admin Registration and Enrollment Queue Integration

**Spec ID:** 003-admin-queues
**Branch:** `feat/admin-queues`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Wire the two admin queue screens (`RegistrationsScreen` and `EnrolmentsScreen`) to the real API, replacing the `approvalsStore` mock mutations with live data from `GET /admin/registrations` and `GET /admin/enrollments`. Admins can approve, reject (with optional reason), and bulk-approve registrations. Enrollment approvals and rejections also use the real API.

---

## User Stories
- As an **admin**, I want to see real pending student registration requests from the API, so that I can approve or reject actual sign-ups.
- As an **admin**, I want to approve or reject a registration with an optional reason, so that the student receives meaningful feedback.
- As an **admin**, I want to bulk-approve all pending registrations in one tap, so that I can clear the queue efficiently.
- As an **admin**, I want to see real pending enrollment requests for my courses, so that I can grant or deny course access.
- As an **admin**, I want to approve or reject an enrollment with an optional reason, so that the student knows why their request was handled.

---

## API Contract

### 1. List registrations
_Reference: API Reference §9.1 — `GET /admin/registrations`_
- **Endpoint:** `GET /admin/registrations`
- **Auth:** bearer (admin, super_admin)
- **Query params:** `status` (`pending` | `approved` | `rejected`, default `pending`), `q` (search), `limit` (default 25), `cursor`
- **Success response:** `200` paginated list
  ```json
  {
    "items": [{ "id", "studentUid", "firstName", "lastName", "email", "status", "submittedAt" }],
    "nextCursor": null,
    "total": 12
  }
  ```

### 2. Approve registration
_Reference: API Reference §9.2 — `POST /admin/registrations/:id/approve`_
- **Endpoint:** `POST /admin/registrations/:id/approve`
- **Auth:** bearer (admin, super_admin)
- **Request body:** none
- **Success response:** `200` `{ "message": "Registration approved.", "studentUid": "..." }`
- **Error codes:** `INVALID_STATE` → "Registration is no longer pending."

### 3. Reject registration
_Reference: API Reference §9.3 — `POST /admin/registrations/:id/reject`_
- **Endpoint:** `POST /admin/registrations/:id/reject`
- **Auth:** bearer (admin, super_admin)
- **Request body:** `{ "reason"?: string }` — optional, max 500 chars
- **Success response:** `200` `{ "message": "Registration rejected.", "studentUid": "..." }`
- **Error codes:** `INVALID_STATE` → "Registration is no longer pending."

### 4. Bulk-approve registrations
_Reference: API Reference §9.4 — `POST /admin/registrations/bulk-approve`_
- **Endpoint:** `POST /admin/registrations/bulk-approve`
- **Auth:** bearer (admin, super_admin)
- **Request body:** `{ "registrationIds": string[] }` — 1–50 IDs
- **Success response:** `200` `{ "approved": [...], "failed": [{ "id", "reason" }] }`
- **Note:** Partial success is possible — show a summary (e.g. "12 approved, 1 failed.")

### 5. List enrollments
_Reference: API Reference §10.1 — `GET /admin/enrollments`_
- **Endpoint:** `GET /admin/enrollments`
- **Auth:** bearer (admin, super_admin)
- **Query params:** `status` (`pending` | `approved` | `rejected` | `withdrawn`), `courseId`, `limit` (default 20), `cursor`
- **Success response:** `200` paginated list
  ```json
  {
    "items": [{ "id", "studentUid", "studentName", "studentEmail", "courseId", "courseTitle", "state", "submittedAt" }],
    "nextCursor": null,
    "total": 5
  }
  ```

### 6. Approve enrollment
_Reference: API Reference §10.2 — `POST /admin/enrollments/:id/approve`_
- **Endpoint:** `POST /admin/enrollments/:id/approve`
- **Auth:** bearer (admin, super_admin)
- **Request body:** none
- **Success response:** `200` `{ "id", "courseId", "state": "approved", "approvedAt" }`
- **Error codes:** `INVALID_STATE` → item already processed

### 7. Reject enrollment
_Reference: API Reference §10.3 — `POST /admin/enrollments/:id/reject`_
- **Endpoint:** `POST /admin/enrollments/:id/reject`
- **Auth:** bearer (admin, super_admin)
- **Request body:** `{ "reason"?: string }` — optional, max 500 chars
- **Success response:** `200` `{ "id", "courseId", "state": "rejected", "rejectedAt", "reason" }`

---

## Screens / Navigation

- **New screens:** none
- **Modified screens:**
  - `src/screens/admin/RegistrationsScreen.tsx` — load from `GET /admin/registrations` per tab; wire approve/reject/bulk-approve to real API; add reason input on reject
  - `src/screens/admin/EnrolmentsScreen.tsx` — load from `GET /admin/enrollments`; wire approve/reject to real API; add reason input on reject; "Approve all" calls reject-free individual approvals in sequence (no bulk-enrollment endpoint exists in the API)

- **Navigation changes:** none

---

## State / Stores

- **Stores touched:** `approvalsStore`
- **Approach:** Replace the mock-seeded `Registration[]` and `Enrolment[]` in `approvalsStore` with API-typed data. The store holds the fetched list and exposes async fetch/approve/reject actions. This keeps the badge counts and tab counts reactive.
- **API types (new interfaces, do not reuse mock `Registration`/`Enrolment`):**
  - `ApiRegistration`: `id`, `studentUid`, `firstName`, `lastName`, `email`, `status`, `submittedAt`
  - `ApiEnrollment`: `id`, `studentUid`, `studentName`, `studentEmail`, `courseId`, `courseTitle`, `state`, `submittedAt`
- **Pagination:** Load first page (default limit 25) on screen mount. No infinite scroll yet — noted as future improvement.
- **Server data strategy:** Zustand holds the fetched list; a `fetchRegistrations(status)` / `fetchEnrollments(status)` action calls the API and replaces the relevant slice in the store.

---

## UI States

- **Loading (initial fetch):** Show a spinner/skeleton while the first page loads; replace the current static list render
- **Empty:** Existing `EmptyState` component handles this — keep it
- **Error (fetch failure):** `toast.error` + show the current empty state (don't crash the screen)
- **Action loading (approve/reject buttons):** Disable the tapped button while the API call is in flight; re-enable on completion or error
- **Reject reason modal:** A simple `Alert.prompt` (iOS) or a bottom-sheet/modal with a text input (cross-platform); reason is optional — user can dismiss without entering one
- **Bulk-approve result:** Toast with summary: "12 approved." or "11 approved, 1 failed." List failed IDs in a second toast if any
- **"Approve all" enrollments:** Calls approvals individually; shows progress toast after completion; no bulk endpoint exists for enrollments in the API

---

## Functional Requirements

- [ ] Create `src/services/registrations.ts`:
  - `listRegistrations(status, q?, cursor?)` → `GET /admin/registrations`
  - `approveRegistration(id)` → `POST /admin/registrations/:id/approve`
  - `rejectRegistration(id, reason?)` → `POST /admin/registrations/:id/reject`
  - `bulkApproveRegistrations(ids: string[])` → `POST /admin/registrations/bulk-approve`
  - `ApiRegistration` interface matching API response
- [ ] Create `src/services/enrollments.ts` (admin side):
  - `listAdminEnrollments(status?, courseId?, cursor?)` → `GET /admin/enrollments`
  - `approveEnrollment(id)` → `POST /admin/enrollments/:id/approve`
  - `rejectEnrollment(id, reason?)` → `POST /admin/enrollments/:id/reject`
  - `ApiAdminEnrollment` interface matching API response
- [ ] Update `src/store/approvalsStore.ts`:
  - Replace `Registration[]` with `ApiRegistration[]`
  - Replace `Enrolment[]` with `ApiAdminEnrollment[]`
  - Remove mock seeding from `REGISTRATIONS` / `ENROLMENTS`
  - Add async `fetchRegistrations(status)` action
  - Add async `fetchEnrollments(status?)` action
  - Keep `approveRegistration` / `rejectRegistration` / `approveEnrolment` / `rejectEnrolment` but make them call the API then update the local list
- [ ] Update `RegistrationsScreen`:
  - Call `fetchRegistrations(filter)` on mount and on tab change
  - Display `ApiRegistration` fields (`firstName + lastName` as name, `email`, `submittedAt` as date)
  - Show loading state while fetching
  - Add reason input on Reject (optional text before confirming)
  - Replace current mock bulk-approve with real `bulkApproveRegistrations` on all pending IDs
- [ ] Update `EnrolmentsScreen`:
  - Call `fetchEnrollments('pending')` on mount
  - Display `ApiAdminEnrollment` fields (`studentName`, `studentEmail`, `courseTitle`, `submittedAt`)
  - Show loading state while fetching
  - Add reason input on Reject (optional)
  - "Approve all" calls `approveEnrollment(id)` for each pending item individually (loop, not bulk — no batch endpoint for enrollments)
- [ ] Badge counts on nav tabs and dashboard cards remain derived from the store — update to use the real fetched counts

---

## Non-Functional Requirements

- [ ] **Performance** — first page loads within 3 s on a normal mobile connection
- [ ] **Accessibility** — action buttons ≥ 44pt; reason modal has a labelled text input
- [ ] **Security** — reason text validated client-side to max 500 chars before API call
- [ ] **Offline behaviour** — network failure on fetch → toast + show existing (possibly stale) list; network failure on action → toast + re-enable button

---

## Acceptance Criteria

- [ ] `RegistrationsScreen` loads real pending registrations from the API on mount
- [ ] Approving a registration calls `POST /admin/registrations/:id/approve` and removes the item from the pending tab
- [ ] Rejecting a registration (with or without reason) calls `POST /admin/registrations/:id/reject` and removes the item
- [ ] Bulk-approve all pending registrations calls `POST /admin/registrations/bulk-approve`; shows summary toast
- [ ] `EnrolmentsScreen` loads real pending enrollments from the API on mount
- [ ] Approving an enrollment calls `POST /admin/enrollments/:id/approve` and removes the item
- [ ] Rejecting an enrollment calls `POST /admin/enrollments/:id/reject`
- [ ] "Approve all" enrollments processes each item individually and shows a summary
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `approvalsStore` mock-seeded `REGISTRATIONS` / `ENROLMENTS` arrays; all mock `approve*` / `reject*` store actions
- **Still mocked after this feature:** pending/approved counts on `AdminDashboardScreen` cards (derived from the store — will update automatically once store uses real data)

---

## Out of Scope

- Pagination / infinite scroll (load first page only — noted for a future sprint)
- Push notification receipt when admin approves/rejects (backend side effect)
- Audit log entries for approvals (backend side effect)
- Enrollment filtering by `courseId` in the UI (the API supports it; add to a future sprint)

---

## Definition of Done

- [ ] Spec status updated to `shipped`
- [ ] `src/services/registrations.ts` and `src/services/enrollments.ts` created
- [ ] `approvalsStore` updated with API types and async fetch/action functions
- [ ] `RegistrationsScreen` and `EnrolmentsScreen` wired to real API
- [ ] Loading states on all screens and action buttons
- [ ] Reason input on all reject flows
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on device (happy path: approve + reject with reason, bulk-approve)
- [ ] PR description references this spec

---

## References Used

- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §9.1–9.4 (Registration Queue), §10.1–10.3 (Enrollment Queue)
- `src/screens/admin/RegistrationsScreen.tsx` — existing mock-driven implementation
- `src/screens/admin/EnrolmentsScreen.tsx` — existing mock-driven implementation
- `src/store/approvalsStore.ts` — current mock store structure
