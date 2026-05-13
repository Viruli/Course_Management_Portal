# Sprint 6: Edge Cases & Polish

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 1–2 h · **Actual:** ~15 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Harden all course screens against API errors and network failures; verify dark mode; confirm no stubs remain.

---

## 📋 Tasks

- [ ] **Network failures on all mutations** (create, update, delete, publish, upload):
  - Show `toast.error` + re-enable button; preserve form data on screen
- [ ] **`COURSE_TITLE_EXISTS`** (409 on create) → inline error on title field: "A course with this title already exists."
- [ ] **`INVALID_YOUTUBE_ID`** (400 on subject create/update) → inline error below URL field (not a toast)
- [ ] **`EMPTY_SEMESTER`** (422 on publish) → toast: "Every semester needs at least one subject before publishing."
- [ ] **`NO_SEMESTERS`** (422 on publish) → toast: "Add at least one semester before publishing."
- [ ] **`INVALID_STATE`** (409 on lifecycle actions) → toast: "This course can't be [published/archived/etc.] right now." + refresh the course list
- [ ] **`UNSUPPORTED_MEDIA_TYPE`** (415 on attachment upload) → toast: "Only PDF, DOC, and DOCX files are accepted." (should be caught client-side first, but handle server error too)
- [ ] **`FILE_TOO_LARGE`** (400 on attachment upload) → toast: "File exceeds the 25 MB limit." (handle both client-side and server-side)
- [ ] **`COURSE_NOT_FOUND`** (404 on course detail) → show inline error state with a back button
- [ ] **Dark mode** — verify `StudentBrowseScreen`, `CourseDetailScreen`, `CoursesScreen`, `CourseBuilderScreen`, `LessonEditorScreen` all render correctly in dark mode
- [ ] **Stub check** — grep for `toast.info('… coming soon')` on all touched course management buttons; remove any remaining stubs
- [ ] **Final typecheck** — `npx tsc --noEmit` passes clean

---

## 📁 Files to Touch

**New:** none
**Modified:** any screens from Sprints 2–5 that need error-handling or styling fixes
**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprints 2–5 complete
- **Blocks:** Sprint 7 (manual test)
- **External:** none — can verify error UI without backend by simulating errors

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Network off during any mutation → toast, form preserved, button re-enabled
- [ ] Each API error code shows a specific, actionable message — no raw error codes shown to the user
- [ ] No `toast.info('… coming soon')` on any course management action
- [ ] All modified screens correct in dark mode

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Check for leftover stubs on course management flows
grep -rn "coming soon" \
  src/screens/admin/CoursesScreen.tsx \
  src/screens/admin/CourseBuilderScreen.tsx \
  src/screens/admin/LessonEditorScreen.tsx \
  src/screens/student/StudentBrowseScreen.tsx \
  src/screens/student/CourseDetailScreen.tsx 2>&1 || echo "CLEAN"
```

---

## 📝 Notes

- `INVALID_YOUTUBE_ID` and `COURSE_TITLE_EXISTS` should show as inline field errors (below the input), not toasts. Toasts are for non-field errors (network, server fault, state errors).
- For the student `CourseDetailScreen` 404: this can happen if an admin deletes a course while a student is viewing it. Show a friendly "This course is no longer available" message.

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

**Next:** [`sprint-07-manual-test-on-device.md`](./sprint-07-manual-test-on-device.md)
