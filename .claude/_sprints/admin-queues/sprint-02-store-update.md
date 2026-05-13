# Sprint 2: Store Update

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~30 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Replace the mock-seeded `approvalsStore` with API-typed data and async fetch/action functions, so all queue screens and badge counts stay reactive with real data.

---

## 📋 Tasks

- [ ] Update `src/store/approvalsStore.ts`:
  - Import `ApiRegistration`, `BulkApproveResult` from `src/services/registrations.ts`
  - Import `ApiAdminEnrollment` from `src/services/enrollments.ts`
  - Import service functions: `listRegistrations`, `approveRegistration`, `rejectRegistration`, `bulkApproveRegistrations`, `listAdminEnrollments`, `approveEnrollment`, `rejectEnrollment`
  - **Remove** `REGISTRATIONS` and `ENROLMENTS` mock imports from `data/mock.ts`
  - Replace `Registration[]` with `ApiRegistration[]`; replace `Enrolment[]` with `ApiAdminEnrollment[]`
  - Initial state: `registrations: []`, `enrolments: []`, `loadingRegistrations: false`, `loadingEnrolments: false`

- [ ] Add `fetchRegistrations(status: string)` async action:
  - Sets `loadingRegistrations = true`
  - Calls `listRegistrations({ status })`
  - On success: sets `registrations` to `result.data.items`
  - On error: `toast.error`
  - Always sets `loadingRegistrations = false`

- [ ] Add `fetchEnrollments(status?: string)` async action — same pattern for enrolments

- [ ] Update `approveRegistration(id: string)` to be async:
  - Calls `approveRegistration` service
  - On success: removes the item from `registrations` list (pessimistic — only remove after server confirms)
  - On error `INVALID_STATE`: `toast.error('Already processed.')` + calls `fetchRegistrations('pending')` to refresh
  - On other error: re-throws so the screen can show the error

- [ ] Update `rejectRegistration(id: string, reason?: string)` — same pattern as above

- [ ] Add `bulkApproveAllRegistrations()` async action:
  - Collects all IDs where `status === 'pending'` from current `registrations`
  - If empty: returns `{ approved: 0, failed: 0 }`
  - Calls `bulkApproveRegistrations(ids)` (split into chunks of 50 if needed)
  - On success: removes approved IDs from local list; returns `{ approved: count, failed: failedCount }`

- [ ] Update `approveEnrolment(id: string)` → async, calls `approveEnrollment` service, pessimistic remove

- [ ] Update `rejectEnrolment(id: string, reason?: string)` → async, calls `rejectEnrollment` service, pessimistic remove

- [ ] Update `approveAllEnrolments()` → async:
  - Gets all pending enrolments from store
  - Loops: `await approveEnrollment(e.id)` for each (sequential, not parallel)
  - Counts successes and failures
  - Removes successfully approved items from local list
  - Returns `{ approved: number, failed: number }`

- [ ] Check that `AdminDashboardScreen` and tab badges still derive counts correctly from the updated store types — update any field references from `status` to the correct field

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/store/approvalsStore.ts` — full rewrite of types + actions

**Deleted:** none (mock data stays in `data/mock.ts` for other screens that still need it)

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (service files must exist)
- **Blocks:** Sprints 3 and 4 (screens call store actions)
- **External:** none — no backend needed for this sprint

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No import of `REGISTRATIONS`, `ENROLMENTS`, `Registration`, or `Enrolment` from mock files remains in `approvalsStore.ts`
- [ ] `loadingRegistrations` and `loadingEnrolments` are exported from the store state
- [ ] Approve/reject actions are async and pessimistically update the list
- [ ] `AdminDashboardScreen` and tab badges still compile and derive counts correctly

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

No device needed — store only, no UI yet.

---

## 📝 Notes

- The `approveAllEnrolments` mock returned a plain number. The new async version returns `{ approved: number, failed: number }` — screens in Sprint 4 will use this shape to build the summary toast.
- Keep the existing `approveAllEnrolments` function name for now so other screens that might reference it don't break — just change its implementation and return type.
- `AdminDashboardScreen` likely reads `approvalsStore((s) => s.registrations.filter(r => r.status === 'pending').length)`. With API types, `ApiRegistration.status` is the same field name — should still work. Check and confirm.

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

**Next:** [`sprint-03-ui-wiring-registrations.md`](./sprint-03-ui-wiring-registrations.md)
