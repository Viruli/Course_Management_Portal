# Sprint 4: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~15 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden all new screens against network failures and error codes; verify dark mode; confirm no stubs remain.

---

## 📋 Tasks

**Enrollment error handling:**
- [ ] `enrollInCourse` network failure → toast "Couldn't reach the server." + button re-enabled
- [ ] `ENROLLMENT_EXISTS` (409) → refresh enrollment state, show current badge (not an error to the user)
- [ ] `RESUBMIT_TOO_EARLY` (429) → toast "You must wait 24 hours after a rejection before re-enrolling."
- [ ] `COURSE_NOT_PUBLISHED` (422) → toast "This course is not currently open for enrolment."

**Progress error handling:**
- [ ] `markSubjectComplete` network failure → toast "Couldn't mark complete. Try again." + button re-enabled
- [ ] `updateLastAccessed` failure → swallow silently (fire-and-forget — no user-visible error)
- [ ] `getCourseProgress` failure → skip progress bar (show 0%) without crashing
- [ ] `getSubjectProgress` 404 → treat as `state: 'not_started'` (no tick shown — expected for new subjects)
- [ ] `getSubjectProgress` network failure → no tick shown (fail silently)

**Attachment download error handling:**
- [ ] `ENROLLMENT_REQUIRED` (403) → toast "You need an approved enrolment to download attachments."
- [ ] Network failure → toast "Download failed. Check your connection." + download button re-enabled
- [ ] `Linking.openURL` failure (invalid URL) → toast "Couldn't open the download link."

**Withdrawal (if implemented in MyLearningScreen):**
- [ ] `withdrawEnrollment` `INVALID_STATE` (409) → toast "Only pending enrolments can be withdrawn."

**Dark mode:**
- [ ] `MyLearningScreen` tabs and course cards — verify in dark mode
- [ ] `CourseDetailScreen` enrol button states (pending/approved badges) — verify
- [ ] `LessonPlayerScreen` "Mark Complete" button and attachment download icon — verify

**Stub check:**
- [ ] Grep: no `toast.info('… coming soon')` on enrol, mark-complete, or attachment flows
- [ ] Final `npx tsc --noEmit` passes clean

---

## 📁 Files to Touch

**New:** none
**Modified:** any screens from Sprints 2–3 that need error-handling fixes
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 2 + 3 complete
- **Blocks:** Sprint 5 (manual test)
- **External:** none — can verify error UI without backend by temporarily simulating failures

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during enrol → toast, button re-enabled, no crash
- [ ] Network off during mark-complete → toast, button re-enabled
- [ ] `getSubjectProgress` 404 → no tick, no error shown (silent)
- [ ] All new screens correct in dark mode
- [ ] No `toast.info('… coming soon')` on any touched flow

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Check for leftover stubs
grep -rn "coming soon" \
  src/screens/student/CourseDetailScreen.tsx \
  src/screens/student/MyLearningScreen.tsx \
  src/screens/student/LessonPlayerScreen.tsx 2>&1 || echo "CLEAN"
```

---

## 📝 Notes

- `ENROLLMENT_EXISTS` is not really an error from the user's perspective — it means the student already has an enrollment. Refresh and show the current state badge rather than showing an error message.
- `updateLastAccessed` errors should NEVER show a toast — they're background tracking calls. Wrap in `.catch(() => {})`.

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

**Next:** [`sprint-05-manual-test-on-device.md`](./sprint-05-manual-test-on-device.md)
