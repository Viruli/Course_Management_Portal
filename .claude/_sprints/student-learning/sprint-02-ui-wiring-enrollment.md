# Sprint 2: UI Wiring — Enrollment

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~45 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire the enrol button on `CourseDetailScreen` and replace mock `COURSES` in `MyLearningScreen` with real enrollment data and progress percentages.

---

## 📋 Tasks

**`CourseDetailScreen.tsx`:**
- [ ] Add local state: `enrolment: ApiEnrollment | null`, `enrolmentLoading: boolean`, `enrolling: boolean`
- [ ] On mount (when `courseId` is available): call `listMyEnrollments()` and find the entry matching `courseId` → set `enrolment`
- [ ] Replace the existing "Request enrol" toast stub with real logic:
  - If `enrolment` is null → show "Request enrol" button
  - If `enrolment.state === 'pending'` → show "Pending approval" non-tappable badge
  - If `enrolment.state === 'approved'` → show "Continue learning" button
  - If `enrolment.state === 'rejected'` → show "Re-enrol" button (same as Request enrol)
- [ ] "Request enrol" tap:
  - Set `enrolling = true`
  - Call `enrollInCourse(courseId)`
  - On success → update local `enrolment` state to the returned object
  - On `ENROLLMENT_EXISTS` (409) → refresh `listMyEnrollments()` to get current state
  - On `RESUBMIT_TOO_EARLY` (429) → toast "You must wait 24 hours after a rejection before re-enrolling."
  - Always set `enrolling = false`

**`MyLearningScreen.tsx`:**
- [ ] Add local state: `enrollments: ApiEnrollment[]`, `progressMap: Record<string, ApiCourseProgress>`, `loading: boolean`
- [ ] On mount: call `listMyEnrollments()` → set `enrollments`
- [ ] After enrollments load: for each `approved` enrollment call `getCourseProgress(courseId)` → populate `progressMap`
- [ ] Remove `COURSES` mock import and all references
- [ ] Three tabs: **In Progress** (approved + completionPercent > 0), **Enrolled** (approved + completionPercent = 0 or undefined), **Pending** (state = pending)
- [ ] Course card displays: `courseTitle`, `completionPercent` progress bar from `progressMap`
- [ ] Empty states:
  - In Progress: "No courses in progress yet."
  - Enrolled: "You haven't started any courses yet."
  - Pending: "No pending enrolments."

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/student/CourseDetailScreen.tsx` — enrol button wired
- `src/screens/student/MyLearningScreen.tsx` — real enrolment data

**Deleted:** none (mock `COURSES` removed inline)

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`enrollInCourse`, `listMyEnrollments`, `getCourseProgress` exist)
- **Blocks:** Sprint 3 (progress uses the enrolled course/subject IDs)
- **External:** Requires authenticated student session (Firebase + backend) for device testing

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `COURSES` mock import remains in `MyLearningScreen`
- [ ] "Request enrol" button is replaced with real API call — no `toast.info('… coming soon')` left
- [ ] Button shows "Enrolling…" and is disabled while the API call is in flight
- [ ] All three tabs render (even if empty) without crashing

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device (requires Firebase + backend):
- [ ] Open a published course → "Request enrol" button visible → tap → button changes to "Pending approval"
- [ ] My Learning tab → pending enrollment appears in "Pending" tab

---

## 📝 Notes

- `CourseDetailScreen` currently receives `courseId` (on this branch it fetches its own data). Use the `courseId` to match against the enrollment list.
- `MyLearningScreen.onCourse` currently passes a `Course | string` — after this sprint it should pass `courseId: string` since there are no mock `Course` objects.
- Progress % may be undefined for newly approved enrollments (student hasn't accessed any subjects yet). Default to 0.

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

**Next:** [`sprint-03-ui-wiring-progress-lesson-player.md`](./sprint-03-ui-wiring-progress-lesson-player.md)
