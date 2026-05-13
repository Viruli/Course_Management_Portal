# Sprint 5: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~10 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden both queue screens against network failures, stale state, and partial-success scenarios; verify dark mode on all new/modified UI.

---

## 📋 Tasks

- [ ] **Fetch failure** — `fetchRegistrations` / `fetchEnrollments` network error: `toast.error` shown; existing list (possibly empty) remains visible; retry is possible by switching tabs or pulling to refresh (no pull-to-refresh implemented — just re-mounting the screen retries)
- [ ] **Approve/reject failure** — network error: `toast.error` + button re-enabled; item stays in the list (pessimistic update never ran)
- [ ] **INVALID_STATE (409)** on approve/reject — item was already processed by another admin: show `toast.error('This request has already been processed.')` + call `fetchRegistrations(filter)` or `fetchEnrollments()` to refresh and remove the stale item
- [ ] **Bulk-approve partial failure** — `failed[]` is non-empty: show `"X approved. Y failed — they may have already been processed."` (not just a success toast)
- [ ] **Bulk-approve 0 pending** — guard in store returns early; screen shows `toast.info('No pending registrations to approve.')`
- [ ] **Approve-all enrollments 0 pending** — same guard
- [ ] **Reason too long** — `RejectReasonModal` blocks input at 500 chars via `maxLength`; no server-side validation needed if the client enforces it
- [ ] **Dark mode** — `RegistrationsScreen`, `EnrolmentsScreen`, `RejectReasonModal` all correct in dark mode
- [ ] **Grep check** — no `toast.info('… coming soon')` remains on any queue button
- [ ] **Final typecheck** — `npx tsc --noEmit` passes clean

---

## 📁 Files to Touch

**New:** none
**Modified:** any screens / store / modal that need fixing from Sprints 2–4
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 3 and 4 complete
- **Blocks:** Sprint 6 (manual test)
- **External:** none — polish only

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during fetch → toast, empty/stale list shown, no crash
- [ ] Network off during action → toast, item still in list, button re-enabled
- [ ] `INVALID_STATE` error → toast + list refreshes
- [ ] Bulk-approve partial failure → summary toast with both counts
- [ ] No `toast.info('… coming soon')` on any queue button
- [ ] All modified screens correct in dark mode

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Check for leftover stubs
grep -rn "coming soon" \
  src/screens/admin/RegistrationsScreen.tsx \
  src/screens/admin/EnrolmentsScreen.tsx 2>&1 || echo "CLEAN"
```

---

## 📝 Notes

- INVALID_STATE refresh: after the toast, call the fetch action with the current filter so the stale item is removed from the list. This avoids the user seeing a "ghost" item that can no longer be actioned.
- Bulk-approve chunks: if the store has > 50 pending registrations, split into chunks of 50 and call `bulkApproveRegistrations` for each chunk. Merge the results into one `{ approved, failed }` summary.

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

**Next:** [`sprint-06-manual-test-on-device.md`](./sprint-06-manual-test-on-device.md)
