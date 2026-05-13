# Sprint 4: UI Wiring — EnrolmentsScreen + RejectReasonModal

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create the shared `RejectReasonModal`, wire `EnrolmentsScreen` to the real API, and replace the Sprint 3 `Alert.alert` placeholder in `RegistrationsScreen` with the real modal.

---

## 📋 Tasks

**Create shared modal:**
- [ ] Create `src/components/RejectReasonModal.tsx`:
  - Props: `visible: boolean`, `onConfirm: (reason?: string) => void`, `onCancel: () => void`, `title?: string`
  - Uses React Native `Modal` (not `Alert.prompt`) — works on both iOS and Android
  - Contains a `TextInput` for the reason (placeholder: "Optional reason for the student…", `maxLength={500}`, `multiline`)
  - Character counter below the input (e.g. "230 / 500")
  - Two buttons: "Skip" (calls `onConfirm()` with no reason) and "Reject" (calls `onConfirm(reason.trim())`)
  - Uses `useThemedStyles` for dark mode
  - Dismiss on backdrop tap calls `onCancel`

**Wire EnrolmentsScreen:**
- [ ] Add `useEffect` to call `fetchEnrollments('pending')` on mount
- [ ] Show loading indicator while `loadingEnrolments` is true
- [ ] Update card display to use `ApiAdminEnrollment` fields:
  - Name: `e.studentName`
  - Course: `e.courseTitle`
  - Date: format `e.submittedAt`
- [ ] Add `processingId: string | null` state for per-item loading
- [ ] **Approve button**: call `approveEnrolment(e.id)` from store; per-item loading state
- [ ] **Reject button**: open `RejectReasonModal` → on confirm call `rejectEnrolment(e.id, reason?)`
- [ ] **"Approve all" button**: call `approveAllEnrolments()` from store → show summary toast:
  - All approved: `"X enrolments approved."`
  - Partial: `"X approved. Y failed."`
  - None: `"No pending enrolments to approve."`
- [ ] **Remove the "Note" button** — there is no notes endpoint in the API. Remove the button entirely (not just the stub toast).

**Replace placeholder in RegistrationsScreen:**
- [ ] Replace the `Alert.alert` placeholder in `RegistrationsScreen` with `<RejectReasonModal>` for consistency

---

## 📁 Files to Touch

**New:**
- `src/components/RejectReasonModal.tsx`

**Modified:**
- `src/screens/admin/EnrolmentsScreen.tsx`
- `src/screens/admin/RegistrationsScreen.tsx` — replace `Alert.alert` with `RejectReasonModal`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 3 (RegistrationsScreen wired, placeholder reject in place)
- **Blocks:** Sprint 5 (edge-case polish on both screens + modal)
- **External:** none — can be built without backend

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `RejectReasonModal` renders correctly in both light and dark mode
- [ ] Tapping "Skip" calls `onConfirm()` with no argument
- [ ] Tapping "Reject" calls `onConfirm(reason)` with the typed reason (trimmed)
- [ ] Character counter shows correct count and stops input at 500
- [ ] "Note" button is gone from `EnrolmentsScreen` — no stub toast remains
- [ ] `EnrolmentsScreen` loads real pending enrolments on mount
- [ ] Approve/reject per-item loading state works correctly

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test (no backend required for modal UI):
- [ ] Open modal → type reason → tap Reject → `onConfirm` called with trimmed reason
- [ ] Open modal → tap Skip → `onConfirm` called with no argument
- [ ] Open modal → tap backdrop → `onCancel` called
- [ ] Toggle dark mode with modal visible → themed correctly

---

## 📝 Notes

- The `RejectReasonModal` should be usable by both screens with a `title` prop to customise the heading (e.g. "Reject registration" vs "Reject enrolment").
- The modal backdrop should partially dim the background (semi-transparent overlay) — use `backgroundColor: 'rgba(0,0,0,0.5)'` on the `Modal` outer view.
- The `approveAllEnrolments` store action now returns `{ approved, failed }` — use that to build the summary toast. Do not hardcode the count.

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

**Next:** [`sprint-05-edge-cases-polish.md`](./sprint-05-edge-cases-polish.md)
