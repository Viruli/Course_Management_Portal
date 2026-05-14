# Sprint 3: Admin Course List

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 2–3 h · **Actual:** ~1 h
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Replace `CoursesScreen`'s mock data with API-driven per-tab loading, wire course creation and all lifecycle actions (publish / unpublish / archive / delete / edit).

---

## 📋 Tasks

**Load courses per tab:**
- [ ] Add local state: `courses: ApiCourse[]`, `loadingCourses: boolean`
- [ ] Call `listCourses({ state: tab })` on mount and on tab change (`published` / `draft` / `archived`)
- [ ] Show `ActivityIndicator` while `loadingCourses` is true
- [ ] Remove `COURSES` mock import and hardcoded `drafts` array — keep `SAMPLE_BUILDER_COURSE` in `data/mock.ts` but stop importing it here
- [ ] Map `ApiCourse` fields to existing card/list display (`title`, `description`, `coverImageUrl`, `state`, `semesterCount`, `createdByName`, `publishedAt`)

**Create course:**
- [ ] Tap "+" button → show a `Modal` (or `Alert.prompt` on iOS) with `title` and `description` text inputs
- [ ] Validate: both fields required; title max 200 chars; description max 5000 chars
- [ ] Call `createCourse({ title, description })` on submit — no `type` field
- [ ] On success: store the returned `courseId`; `courseBuilderStore.initNew(courseId)` with the returned course; navigate to `CourseBuilderScreen`
- [ ] On `COURSE_TITLE_EXISTS` (409): inline error "A course with this title already exists."
- [ ] Loading state on the submit button while the API call is in flight

**3-dot menu lifecycle actions:**
- [ ] **Publish** → `publishCourse(id)` → on success move card to published tab (refresh list); handle `INVALID_STATE`, `EMPTY_SEMESTER`, `NO_SEMESTERS` with descriptive toasts
- [ ] **Unpublish** → `unpublishCourse(id)` → refresh list
- [ ] **Archive** → `archiveCourse(id)` → refresh list
- [ ] **Delete** → show existing confirmation modal → `deleteCourse(id)` → remove from local list on success
- [ ] Per-action loading state (disable the tapped menu item while in flight)

**Edit:**
- [ ] 3-dot → Edit → call `getCourseById(id)` → convert `ApiCourseDetail` to `BuilderCourse` shape → `courseBuilderStore.load(builderCourse, courseId)` → navigate to `CourseBuilderScreen`

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/screens/admin/CoursesScreen.tsx` — full wiring (tabs, create, lifecycle)
- `src/store/courseBuilderStore.ts` — add `courseId` to state, update `initNew`/`load` signatures

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (course service functions) + Sprint 4 depends on `courseBuilderStore.courseId`
- **Blocks:** Sprint 4 (builder needs `courseId` from the create flow)
- **External:** Requires authenticated admin session (Firebase config + backend)

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `COURSES` mock import or hardcoded `drafts` array in `CoursesScreen`
- [ ] Published / Draft / Archived tabs each load from API with their respective `state` filter
- [ ] Create flow: title + description → `POST /courses` → builder opens with real `courseId`
- [ ] `POST /courses` body: only `title` and `description` — no `type` field sent
- [ ] Publish with empty semester → descriptive toast (not a generic error)
- [ ] Delete confirmation → `DELETE /courses/:id` → card removed from list

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

Manual test on device (requires Firebase auth + backend):
- [ ] Published tab shows real published courses
- [ ] Draft tab shows drafts
- [ ] Tap "+" → fill form → course appears in drafts
- [ ] 3-dot → Publish valid course → moves to published tab

---

## 📝 Notes

- `courseBuilderStore` needs a new field `courseId: string | null`. Add it in this sprint (or Sprint 4) — the builder will use it in Phase 4.
- The "Edit" conversion from `ApiCourseDetail` → `BuilderCourse`: map `semesters[].subjects[]` to `BuilderSubject[]` (keeping `youtubeVideoId` as the video ref), and `subjects[].attachments[]` to `BuilderAttachment[]`. Lessons within subjects come from a separate `listLessons` call — load them lazily in the builder when the user expands the subject.
- When refreshing the list after a lifecycle action, re-fetch only the current tab rather than all three to avoid unnecessary requests.

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

**Next:** [`sprint-04-course-builder-semester-subject-crud.md`](./sprint-04-course-builder-semester-subject-crud.md)
