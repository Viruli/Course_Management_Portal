# Sprint 2: Student Course Catalog

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~45 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire the student-facing course browse and detail screens to the real API, replacing mock `COURSES` data with live published courses.

---

## 📋 Tasks

**`StudentBrowseScreen`:**
- [ ] Call `listCourses({ limit: 20 })` on mount; replace mock `COURSES` import
- [ ] Add `loading` state — show `ActivityIndicator` while the request is in flight
- [ ] Map `ApiCourse` fields to the existing card display:
  - `title`, `description`, `coverImageUrl` → existing props
  - `semesterCount` → use as "lessons" count label (closest available field)
  - Remove / gracefully hide fields that don't exist in the API (`rating`, `students`, `instructor`, `progress`) — keep card styled but use placeholders or omit those stats
- [ ] Pass the real `courseId` (from `ApiCourse.id`) to the navigation handler when a card is tapped

**`CourseDetailScreen`:**
- [ ] Accept a `courseId` string as a route param (instead of a full mock `Course` object)
- [ ] Call `getCourseById(courseId)` on mount; show loading spinner
- [ ] Display real course data: title, description, `semesters[]` tree
- [ ] For each subject within a semester, show the `youtubeVideoId` (use existing player component or thumbnail)
- [ ] Lazily load lessons per subject: when the user expands a subject accordion, call `listLessons(subjectId)` and display the lesson list
- [ ] Handle `COURSE_NOT_FOUND` (404) gracefully — show an error state

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/student/StudentBrowseScreen.tsx` — wire `listCourses`
- `src/screens/student/CourseDetailScreen.tsx` — wire `getCourseById` + lazy lesson fetch

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`listCourses`, `getCourseById`, `listLessons` service functions)
- **Blocks:** Sprint 6 (edge-case polish for catalog screens)
- **External:** `GET /courses` is **public** — can test without Firebase auth. Backend must be reachable at `EXPO_PUBLIC_API_BASE_URL`.

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] Browse screen renders real courses on mount without crashing
- [ ] No `COURSES` mock import remains in `StudentBrowseScreen`
- [ ] Course detail shows real semester/subject tree from the API
- [ ] Tapping a subject accordion calls `listLessons` and shows lessons
- [ ] 404 on course detail → error state shown (not crash)

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test on device (backend running, no Firebase auth needed for GET /courses):
- [ ] Browse screen: real course list loads
- [ ] Tap course → detail shows real semesters + subjects
- [ ] Expand subject → lessons load

---

## 📝 Notes

- `GET /courses` requires no authentication — this is the one sprint you can partially test without Firebase config.
- The student browse screen likely has mock fields like `kind`, `emblem`, `tag`, `instructor`, `students`, `rating` that don't map to the API. Remove them from the rendered display or replace with `—` to avoid TypeScript errors.
- `CourseDetailScreen` currently probably receives a full `Course` object as a route param. Change the route param to just `{ courseId: string }` so the screen fetches the real data itself.
- For the lesson list lazy load: add a `loadedSubjectIds: Set<string>` state and call `listLessons` when a subject is first expanded. Store results in local component state `lessons: Record<subjectId, ApiLesson[]>`.

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

**Next:** [`sprint-03-admin-course-list.md`](./sprint-03-admin-course-list.md)
