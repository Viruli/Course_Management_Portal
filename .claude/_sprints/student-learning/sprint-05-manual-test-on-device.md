# Sprint 5: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Status:** 🟡 Not Started
**Estimated:** 2 h · **Actual:** ___
**Started:** ___ · **Completed:** ___

---

## 🎯 Sprint Goal
Confirm the full student learning loop works end-to-end on a real device — enrol, admin approves, see course in My Learning, mark subject complete, download attachment.

> ⚠️ Requires Firebase config + backend at `https://cms.api.bethelnet.au/api/v1`. Enrollment approval requires an admin account.

---

## 📋 Tasks

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go

**Enrollment flow:**
- [ ] Sign in as student → browse a published course → "Request enrol" button visible
- [ ] Tap "Request enrol" → button changes to "Pending approval" badge
- [ ] Admin approves the enrollment from the admin app
- [ ] Navigate to My Learning → course appears in "Enrolled" tab
- [ ] Re-open the course → button now shows "Continue learning"

**Progress tracking:**
- [ ] Navigate into a subject → tap a lesson → `LessonPlayerScreen` opens
- [ ] Check DebugPanel for `progress.access` entry — body must contain `courseId` and `semesterId`
- [ ] Tap "Mark Complete" → check DebugPanel for `progress.complete` — body must contain `courseId` and `semesterId`
- [ ] Toast "Subject marked complete! ✓" shown, button changes to "✓ Completed"
- [ ] Go back to course detail → green tick appears next to the completed subject
- [ ] Go to My Learning → course moves to "In Progress" tab with progress % shown

**Attachment download:**
- [ ] Open a subject that has attachments → tap download icon
- [ ] Check DebugPanel for `attachments.downloadUrl` entry
- [ ] Device browser opens with the signed URL
- [ ] Try downloading an attachment WITHOUT an approved enrollment → `ENROLLMENT_REQUIRED` toast shown

**Error paths:**
- [ ] Turn off Wi-Fi → try to enrol → toast shown, "Request enrol" button re-enabled
- [ ] Turn off Wi-Fi → try "Mark Complete" → toast shown, button re-enabled

**Dark mode:**
- [ ] Toggle dark mode during My Learning, Course Detail, Lesson Player → all themed correctly

**Final typecheck:**
- [ ] `npx tsc --noEmit` — passes clean
- [ ] No `console.error` in Metro during any test

---

## 📁 Files to Touch

**New / Modified / Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–4 all 🟢 Complete
- **External:** Firebase + backend running; admin available to approve enrolment

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro
- [ ] `progress.complete` DebugPanel body: `{ "courseId": "...", "semesterId": "..." }` both present
- [ ] `progress.access` DebugPanel body: same
- [ ] Attachment `downloadUrl` opened via `Linking.openURL` — not stored

---

## 📝 Notes

- Coordinate with the backend team to have a pre-approved enrolled student account ready, or plan for an admin to approve during testing.
- The `completionPercent` in My Learning only updates after navigating away and back (list is re-fetched on mount). Expect a small delay.
- If backend is not yet ready, mark Sprint 5 🔴 Blocked and open the PR with Sprints 1–4 complete.

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
1. Update `.claude/_plan/2026-05-13-student-learning.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/005-student-learning.md` → **Status: shipped**
3. Push `feat/student-learning` and open PR into `main`
4. Reference spec + sprint folder in the PR description
