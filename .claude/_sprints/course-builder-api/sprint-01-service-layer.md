# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 2 h · **Actual:** ~40 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create all four service files with API-aligned types and typed fetch functions — the foundation all subsequent sprints depend on.

---

## 📋 Tasks

**`src/services/courses.ts`**
- [ ] Define `ApiCourse` interface: `id, title, description, coverImageUrl, state, semesterCount, createdBy, createdByName, publishedAt, createdAt, updatedAt`
- [ ] Define `ApiSubjectDetail`: `id, semesterId, title, description, youtubeVideoId, sortOrder, attachments[]`
- [ ] Define `ApiSemesterDetail`: `id, courseId, name, sortOrder, subjectCount, subjects: ApiSubjectDetail[]`
- [ ] Define `ApiCourseDetail` extends `ApiCourse` with `semesters: ApiSemesterDetail[]`
- [ ] `listCourses(params: { state?, q?, cursor?, limit? })` → `GET /courses`
- [ ] `getCourseById(id)` → `GET /courses/:id` — returns `ApiCourseDetail`
- [ ] `createCourse(payload: { title, description, coverImageUrl? })` → `POST /courses`
- [ ] `updateCourse(id, patch: { title?, description?, coverImageUrl? })` → `PATCH /courses/:id`
- [ ] `publishCourse(id)` → `POST /courses/:id/publish`
- [ ] `unpublishCourse(id)` → `POST /courses/:id/unpublish`
- [ ] `archiveCourse(id)` → `POST /courses/:id/archive`
- [ ] `deleteCourse(id)` → `DELETE /courses/:id` (returns `204 No Content` — `ApiResult<undefined>`)

**`src/services/semesters.ts`**
- [ ] Define `ApiSemester`: `id, courseId, name, sortOrder, subjectCount, createdAt, updatedAt`
- [ ] `createSemester(courseId, payload: { name, sortOrder })` → `POST /courses/:courseId/semesters`
- [ ] `updateSemester(id, patch: { name?, sortOrder? })` → `PATCH /semesters/:id`
- [ ] `deleteSemester(id)` → `DELETE /semesters/:id` (204)

**`src/services/subjects.ts`**
- [ ] Define `ApiSubject`: `id, semesterId, title, description, youtubeVideoId, sortOrder, attachments[], createdAt, updatedAt`
- [ ] Define `ApiLesson`: `id, subjectId, courseId, semesterId, title, description, url, order, deletedAt, createdAt, updatedAt`
- [ ] `createSubject(semesterId, payload: { title, description, youtubeVideoUrl, sortOrder })` → `POST /semesters/:id/subjects`
- [ ] `updateSubject(id, patch: { title?, description?, youtubeVideoUrl?, sortOrder? })` → `PATCH /subjects/:id`
- [ ] `deleteSubject(id)` → `DELETE /subjects/:id` (204)
- [ ] `listLessons(subjectId)` → `GET /subjects/:id/lessons` — returns `ApiLesson[]`
- [ ] `createLesson(subjectId, payload: { title, url, description? })` → `POST /subjects/:id/lessons`
- [ ] `updateLesson(id, patch: { title?, url?, description? })` → `PATCH /lessons/:id`
- [ ] `deleteLesson(id)` → `DELETE /lessons/:id` (204)

**`src/services/attachments.ts`**
- [ ] Install `expo-document-picker`: `npx expo install expo-document-picker` — verify Expo Go compatible
- [ ] Define `ApiAttachment`: `id, subjectId, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt`
- [ ] `uploadAttachment(subjectId, file: { uri: string, name: string, type: string })` → `POST /subjects/:id/attachments` using `FormData` with field name `file`
- [ ] `deleteAttachment(id)` → `DELETE /attachments/:id` (204)

---

## 📁 Files to Touch

**New:**
- `src/services/courses.ts`
- `src/services/semesters.ts`
- `src/services/subjects.ts`
- `src/services/attachments.ts`

**Modified:**
- `package.json` / `package-lock.json` — expo-document-picker added

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2–6
- **External:** none — pure TypeScript, no backend needed

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `npx expo install --check` shows no version mismatches after adding expo-document-picker
- [ ] `POST /courses` body type: only `title`, `description`, `coverImageUrl?` — no `type` field
- [ ] `POST /semesters/:id/subjects` body: `youtubeVideoUrl` (full URL string, not the 11-char ID)
- [ ] `POST /subjects/:id/lessons` body: `url` (any video URL, not `youtubeUrl`)
- [ ] Attachment upload uses `FormData` with field `file` (not `attachment` or other name)
- [ ] No imports from `src/data/types.ts` mock types in any service file

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo install --check
```

No device needed — pure service layer.

---

## 📝 Notes

- The `uploadAttachment` function must build a `FormData` object and pass it to `fetch` directly (not through `apiFetch` which always sets `Content-Type: application/json`). Use `fetch` directly for the multipart call, but still attach the Firebase token via `getAuthToken()`.
- `deleteCourse` returns `204 No Content` — use `apiFetch<undefined>` or check for 204 response before parsing JSON.
- `listLessons` returns a plain array (not paginated) per the API spec.

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

**Next:** [`sprint-02-student-course-catalog.md`](./sprint-02-student-course-catalog.md)
