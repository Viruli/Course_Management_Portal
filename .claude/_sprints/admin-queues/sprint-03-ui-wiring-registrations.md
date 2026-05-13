# Sprint 3: UI Wiring — RegistrationsScreen

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire `RegistrationsScreen` to load real registration data per tab, wire approve/reject/bulk-approve to the real API, and add an optional reason input on reject.

---

## 📋 Tasks

- [ ] Add `useEffect` to call `fetchRegistrations(filter)` on mount and whenever `filter` changes (the active tab: `pending`, `approved`, `rejected`)
- [ ] Show a loading indicator (e.g. `ActivityIndicator` centred) while `loadingRegistrations` is true — replace the list with it
- [ ] Update card display to use `ApiRegistration` fields:
  - Name: `${r.firstName} ${r.lastName}`
  - Email: `r.email`
  - Date: format `r.submittedAt` to a human-readable string (e.g. `new Date(r.submittedAt).toLocaleDateString()`)
  - Status badge: `r.status` (same values: `pending`, `approved`, `rejected`)
- [ ] Add `processingId: string | null` state — tracks which item has an in-flight action; disable Approve + Reject buttons on that card while set
- [ ] **Approve button**: call `approveRegistration(r.id)` from store → set `processingId` → on resolve clear it; on error show `toast.error`
- [ ] **Reject button**: open the `RejectReasonModal` (created in Sprint 4 — use a placeholder `Alert.alert` for now to unblock this sprint); on confirm call `rejectRegistration(r.id, reason)`
- [ ] **Bulk-approve button** (the "Approve all" / select-all action — currently missing from `RegistrationsScreen`): add a header-row button "Approve all pending" visible only on the pending tab; calls `bulkApproveAllRegistrations()` from store; show result toast:
  - All approved: `"X registrations approved."`
  - Partial: `"X approved. Y failed — they may have already been processed."`
  - None pending: `"No pending registrations to approve."`
- [ ] Remove the `ApprovalStatus` import from `src/data/types.ts` if it's no longer needed after the type update

---

## 📁 Files to Touch

**New:** none (RejectReasonModal comes in Sprint 4)

**Modified:**
- `src/screens/admin/RegistrationsScreen.tsx`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 2 (store has real API actions and `loadingRegistrations`)
- **Blocks:** Sprint 5 (edge cases refine this screen)
- **External:** none — can use mock store data until backend is live

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Loading indicator shown while `loadingRegistrations` is true
- [ ] Card displays real `ApiRegistration` field names (not mock `r.name`)
- [ ] Approve/Reject buttons disabled on the card being processed (`processingId` matches)
- [ ] Bulk-approve button visible on pending tab; shows correct summary toast
- [ ] Tab switch triggers a fresh fetch for that status

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (requires backend):
- [ ] Pending tab loads real registrations
- [ ] Approve → item disappears from pending tab
- [ ] Bulk-approve all → summary toast

---

## 📝 Notes

- For the reject flow in this sprint, a temporary `Alert.alert` is acceptable as a placeholder for the `RejectReasonModal`. Replace it in Sprint 4 with the real cross-platform modal.
- The `filter` state is `ApprovalStatus` in the current mock. Check whether this type needs to be updated to `'pending' | 'approved' | 'rejected'` after removing the mock type import.
- Tab counts in the header should derive from `registrations.filter(r => r.status === tab).length` — same as before; works with the new API type since the field name is identical.

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

**Next:** [`sprint-04-ui-wiring-enrolments-modal.md`](./sprint-04-ui-wiring-enrolments-modal.md)
