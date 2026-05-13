# Sprint 6: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Status:** 🟡 Not Started
**Estimated:** 1–2 h · **Actual:** ___
**Started:** ___ · **Completed:** ___

---

## 🎯 Sprint Goal
Confirm the full registration and enrollment queue flows work end-to-end on a real device with the live backend, for both admin and super admin roles.

> ⚠️ Requires Firebase config in `.env` + backend running at `http://192.168.1.136:3000/api/v1`.

---

## 📋 Tasks

- [ ] Confirm `.env` has real `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_API_BASE_URL`
- [ ] `npx expo start --lan --clear`

**Registration queue — admin role:**
- [ ] Sign in as admin → Approvals tab → Registrations → pending registrations load from API
- [ ] Tap Approve on a pending registration → item removed from pending; check approved tab
- [ ] Tap Reject on a pending registration → `RejectReasonModal` opens → type reason → confirm → item removed
- [ ] Tap Reject → tap Skip → item rejected without reason
- [ ] Bulk-approve all pending → summary toast shows correct count
- [ ] Switch to Approved tab → approved items load; switch to Rejected tab → same

**Enrollment queue — admin role:**
- [ ] Enrollments tab → pending enrollments load from API
- [ ] Tap Approve → item removed
- [ ] Tap Reject with reason → item removed
- [ ] "Approve all" → all pending approved, summary toast

**Super admin role:**
- [ ] Sign in as super admin → same queue screens visible and functional
- [ ] Approve / reject both queue types — identical behaviour to admin

**Error paths:**
- [ ] Turn off Wi-Fi mid-fetch → toast, no crash
- [ ] Tap Approve/Reject with Wi-Fi off → toast, button re-enabled, item stays

**Dark mode:**
- [ ] Toggle dark mode during queue interaction → `RejectReasonModal` and cards themed correctly

**Final checks:**
- [ ] `npx tsc --noEmit` — clean
- [ ] DebugPanel (if added): verify request bodies:
  - Approve: no body sent
  - Reject with reason: `{ "reason": "..." }` present
  - Reject without reason: empty body `{}`
  - Bulk-approve: `{ "registrationIds": [...] }`

---

## 📁 Files to Touch

**New / Modified / Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–5 all 🟢 Complete
- **External:** Firebase config + backend running at `http://192.168.1.136:3000`

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro during any test
- [ ] `POST /admin/registrations/:id/reject` sends `reason` only when provided
- [ ] `POST /admin/registrations/bulk-approve` body is `{ "registrationIds": [...] }`
- [ ] Both admin and super admin can use all queue features identically

---

## 📝 Notes

- If backend is not ready, mark this sprint 🔴 Blocked and open the PR without device sign-off. Note the blocker in the PR description.
- Use `<DebugPanel tags={['registrations.approve', 'registrations.reject', 'registrations.bulkApprove', 'enrollments.approve', 'enrollments.reject']} />` temporarily on a screen to inspect request/response bodies.

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

## ✅ Closing the Loop
When this sprint is 🟢:
1. Update `.claude/_plan/2026-05-13-admin-queues.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/003-admin-queues.md` → **Status: shipped**
3. Push `feat/admin-queues` and open PR into `main`
4. Reference spec + sprint folder in the PR description
