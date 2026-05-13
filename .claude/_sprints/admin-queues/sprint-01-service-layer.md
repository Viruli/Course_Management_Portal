# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create both service files with API-aligned types and typed fetch functions — the foundation every other sprint depends on.

---

## 📋 Tasks

- [ ] Create `src/services/registrations.ts`:
  - `ApiRegistration` interface: `{ id: string; studentUid: string; firstName: string; lastName: string; email: string; status: 'pending' | 'approved' | 'rejected'; submittedAt: string }`
  - `BulkApproveResult` interface: `{ approved: string[]; failed: { id: string; reason: string }[] }`
  - `listRegistrations(params: { status?: string; q?: string; cursor?: string })` → `GET /admin/registrations`
  - `approveRegistration(id: string)` → `POST /admin/registrations/${id}/approve`
  - `rejectRegistration(id: string, reason?: string)` → `POST /admin/registrations/${id}/reject`; include `reason` in body **only** when it is a non-empty string
  - `bulkApproveRegistrations(ids: string[])` → `POST /admin/registrations/bulk-approve`; body: `{ registrationIds: ids }`

- [ ] Create `src/services/enrollments.ts` (admin side):
  - `ApiAdminEnrollment` interface: `{ id: string; studentUid: string; studentName: string; studentEmail: string; courseId: string; courseTitle: string; state: 'pending' | 'approved' | 'rejected' | 'withdrawn'; submittedAt: string }`
  - `listAdminEnrollments(params: { status?: string; courseId?: string; cursor?: string })` → `GET /admin/enrollments`
  - `approveEnrollment(id: string)` → `POST /admin/enrollments/${id}/approve`
  - `rejectEnrollment(id: string, reason?: string)` → `POST /admin/enrollments/${id}/reject`; include `reason` only when non-empty

---

## 📁 Files to Touch

**New:**
- `src/services/registrations.ts`
- `src/services/enrollments.ts`

**Modified:** none
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2–5
- **External:** none — pure TypeScript, no backend needed

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `rejectRegistration` and `rejectEnrollment` only include `reason` in the request body when it is provided and non-empty — never send `{ "reason": "" }`
- [ ] `bulkApproveRegistrations` body is exactly `{ "registrationIds": [...] }` — no other fields
- [ ] Do NOT import anything from `src/data/types.ts` — `Registration` and `Enrolment` mock types must not be used

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

No device needed — pure service layer.

---

## 📝 Notes

- `rejectRegistration` and `rejectEnrollment` should conditionally add `reason`: `body: reason ? { reason } : {}` (or `body: reason && reason.trim() ? { reason: reason.trim() } : {}`).
- All functions use `apiFetch` from `src/services/api.ts` which auto-attaches the Firebase token. No `token` param needed.
- Use `tag:` values like `'registrations.list'`, `'registrations.approve'`, `'enrollments.list'` etc. so calls appear in the DebugPanel.

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

**Next:** [`sprint-02-store-update.md`](./sprint-02-store-update.md)
