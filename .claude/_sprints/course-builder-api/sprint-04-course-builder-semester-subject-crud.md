# Sprint 4: Course Builder — Semester & Subject CRUD

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 3 h · **Actual:** ~1 h
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire all semester and subject mutations in `CourseBuilderScreen` to the real API; remove the `CourseType` picker; wire the Publish button.

---

## 📋 Tasks

**`courseBuilderStore` updates:**
- [ ] Add `courseId: string | null` to state (if not added in Sprint 3)
- [ ] Update `initNew(courseId: string)` to accept and store the real `courseId`
- [ ] Update `load(course: BuilderCourse, courseId: string)` to store the real `courseId`
- [ ] Update `addSemester()` to accept a real `semesterId` from the API response (replace the local `uid()` generator for the ID)
- [ ] Update `addSubject()` to accept a real `subjectId` from the API response

**`CourseBuilderScreen` UI + wiring:**
- [ ] **Remove `CourseType` picker** — delete the type selector row and `Pill` type options from the form
- [ ] **Save course title/description** → `updateCourse(courseId, { title, description })` on save; debounce or save-on-blur
- [ ] **Add Semester** button:
  - Calls `createSemester(courseId, { name, sortOrder: semesters.length + 1 })`
  - Disabled when `courseId` is null
  - On success: call `courseBuilderStore.addSemester()` with the returned real `semesterId`
  - Per-button loading state
- [ ] **Rename Semester** → `updateSemester(semesterId, { name })`
- [ ] **Delete Semester** → confirmation → `deleteSemester(semesterId)` → remove from store
- [ ] **Add Subject** requires title, description, and a YouTube video URL:
  - Calls `createSubject(semesterId, { title, description, youtubeVideoUrl, sortOrder })`
  - Handle `INVALID_YOUTUBE_ID` (400) → inline error below the URL input: "That YouTube URL or video ID isn't valid."
  - On success: `courseBuilderStore.addSubject()` with real `subjectId`
- [ ] **Update Subject** → `updateSubject(subjectId, patch)` on save
- [ ] **Delete Subject** → confirmation → `deleteSubject(subjectId)` → remove from store
- [ ] **Publish button** → `publishCourse(courseId)`:
  - On `EMPTY_SEMESTER` (422): toast "Every semester needs at least one subject before publishing."
  - On `NO_SEMESTERS` (422): toast "Add at least one semester before publishing."
  - On `INVALID_STATE` (409): toast "This course has already been published."
  - On success: toast "Course published!" + navigate back or refresh

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/store/courseBuilderStore.ts` — `courseId` field, updated action signatures
- `src/screens/admin/CourseBuilderScreen.tsx` — remove CourseType, wire all mutations

**Deleted:** none (CourseType UI removed inline, not a separate file)

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (semester + subject service functions) + Sprint 3 (`courseId` in store after create)
- **Blocks:** Sprint 5 (lesson editor needs real `subjectId` from the store)
- **External:** Requires authenticated admin session (Firebase + backend)

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `CourseType` picker is gone from the builder UI — no `type` field sent to any API call
- [ ] "Add Semester" is disabled when `courseId` is null
- [ ] `createSemester` and `createSubject` use real IDs returned by the API
- [ ] `INVALID_YOUTUBE_ID` shows an inline error (not a generic toast)
- [ ] Publish errors show specific guidance messages

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test on device (requires Firebase auth + backend):
- [ ] Create course → builder opens → add semester → add subject with valid YouTube URL
- [ ] Add subject with invalid YouTube URL → inline error shown, no navigation
- [ ] Publish course with empty semester → specific error toast

---

## 📝 Notes

- The `addSemester()` and `addSubject()` store actions currently use a local `uid()` generator for IDs. After this sprint, they must accept the real server-assigned IDs. The function signatures need to change: `addSemester(id: string, name: string)` instead of generating the ID internally.
- `sortOrder` for semesters and subjects: use the current count + 1 as the sort order when creating. This is good enough for now; drag-to-reorder is out of scope.
- `updateCourse` for title/description: consider calling it on blur from the text inputs rather than requiring a separate "Save" button tap — aligns with how most course builders work. Either approach is fine.

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

**Next:** [`sprint-05-lesson-editor-lesson-attachment-crud.md`](./sprint-05-lesson-editor-lesson-attachment-crud.md)
