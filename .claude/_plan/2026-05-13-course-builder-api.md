# Implementation Plan: Course Builder and Catalog API Integration

**Spec:** [`.claude/_specs/004-course-builder-api.md`](../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 3–4 days (device testing blocked on backend)

---

## 📋 Context

The course system spans two roles: students browse a public catalog (§4.1–4.2), while admins author courses through a 4-level builder (Course → Semester → Subject → Lesson → Attachments). All data is currently mock. This plan replaces mock course data with real API calls across all affected screens, while keeping the builder's local `courseBuilderStore` as the in-memory working copy.

- **Spec:** 004-course-builder-api
- **API Reference:** §4 (Courses), §5 (Semesters), §6.1–6.7 (Subjects + Lessons), §7.1 + §7.3 (Attachments)
- **Replaces mock:** `COURSES` mock in `CoursesScreen` + `StudentBrowseScreen`, hardcoded `drafts` array, `courseBuilderStore` local-only mutations, `SAMPLE_BUILDER_COURSE` on edit

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | `courseBuilderStore` stays as in-memory working copy — API mutations update the store on success | Builder UI needs immediate reactivity; the store is the source of truth between API calls | `courseBuilderStore`, `CourseBuilderScreen`, `LessonEditorScreen` |
| 2 | Create flow: `POST /courses` first, get `courseId`, then open builder | API requires a course to exist before semesters/subjects can be added; "Add Semester" is disabled until course is saved | `CoursesScreen`, `CourseBuilderScreen` |
| 3 | Remove `CourseType` picker from builder | `POST /courses` body has no `type` field — never existed in the API | `CourseBuilderScreen`, `courseBuilderStore` |
| 4 | Rename `BuilderLesson.youtubeUrl` → `url` everywhere | API Lesson accepts any video URL (not just YouTube); field name in API is `url` | `LessonEditorScreen`, `courseBuilderStore`, `data/types.ts` (BuilderLesson) |
| 5 | Attachment upload via `expo-document-picker` + multipart `FormData` fetch | `POST /subjects/:id/attachments` is `multipart/form-data`; Expo Go compatible | `LessonEditorScreen`, `src/services/attachments.ts` |
| 6 | Client-side validation before attachment upload: file type (PDF/DOC/DOCX) and size (≤ 25 MB) | Gives instant feedback without a round-trip; must still handle server-side `UNSUPPORTED_MEDIA_TYPE` / `FILE_TOO_LARGE` | `LessonEditorScreen` |
| 7 | Student catalog: load first page (limit 20), no infinite scroll | Keeps the scope manageable; pagination can be added in a future sprint | `StudentBrowseScreen`, `src/services/courses.ts` |
| 8 | Pessimistic updates on builder mutations | Avoids showing stale state if API call fails; local store only updated after server confirms | All builder mutation handlers |
| 9 | `SAMPLE_BUILDER_COURSE` removed as the "edit" source | On edit, the course is loaded from `GET /courses/:id` which returns the real content tree | `CoursesScreen`, `courseBuilderStore` |
| 10 | Admin course list: per-tab fetch (`?state=published/draft/archived`) on tab change | The API filters by state server-side; avoids loading all courses at once | `CoursesScreen` |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/courses.ts`:
  - `ApiCourse` interface (list item: `id, title, description, coverImageUrl, state, semesterCount, createdBy, createdByName, publishedAt, createdAt, updatedAt`)
  - `ApiSubjectDetail` interface — includes `youtubeVideoId`, `sortOrder`, `attachments[]`
  - `ApiSemesterDetail` interface — includes `subjects: ApiSubjectDetail[]`
  - `ApiCourseDetail` extends `ApiCourse` with `semesters: ApiSemesterDetail[]`
  - `listCourses(params: { state?, q?, cursor?, limit? })` → `GET /courses`
  - `getCourseById(id)` → `GET /courses/:id`
  - `createCourse(payload: { title, description, coverImageUrl? })` → `POST /courses`
  - `updateCourse(id, patch)` → `PATCH /courses/:id`
  - `publishCourse(id)` → `POST /courses/:id/publish`
  - `unpublishCourse(id)` → `POST /courses/:id/unpublish`
  - `archiveCourse(id)` → `POST /courses/:id/archive`
  - `deleteCourse(id)` → `DELETE /courses/:id` (204)

- [ ] Create `src/services/semesters.ts`:
  - `ApiSemester` interface: `id, courseId, name, sortOrder, subjectCount, createdAt, updatedAt`
  - `createSemester(courseId, payload: { name, sortOrder })` → `POST /courses/:id/semesters`
  - `updateSemester(id, patch: { name?, sortOrder? })` → `PATCH /semesters/:id`
  - `deleteSemester(id)` → `DELETE /semesters/:id` (204)

- [ ] Create `src/services/subjects.ts`:
  - `ApiSubject` interface: `id, semesterId, title, description, youtubeVideoId, sortOrder, attachments[], createdAt, updatedAt`
  - `ApiLesson` interface: `id, subjectId, courseId, semesterId, title, description, url, order, deletedAt, createdAt, updatedAt`
  - `createSubject(semesterId, payload: { title, description, youtubeVideoUrl, sortOrder })` → `POST /semesters/:id/subjects`
  - `updateSubject(id, patch)` → `PATCH /subjects/:id`
  - `deleteSubject(id)` → `DELETE /subjects/:id`
  - `listLessons(subjectId)` → `GET /subjects/:id/lessons`
  - `createLesson(subjectId, payload: { title, url, description? })` → `POST /subjects/:id/lessons`
  - `updateLesson(id, patch: { title?, url?, description? })` → `PATCH /lessons/:id`
  - `deleteLesson(id)` → `DELETE /lessons/:id`

- [ ] Create `src/services/attachments.ts`:
  - `ApiAttachment` interface: `id, subjectId, fileName, mimeType, sizeBytes, uploadedBy, uploadedAt`
  - `uploadAttachment(subjectId, file: { uri, name, type })` → `POST /subjects/:id/attachments` (multipart/form-data)
  - `deleteAttachment(id)` → `DELETE /attachments/:id` (204)

### Phase 2: Student Course Catalog

- [ ] Update `src/screens/student/StudentBrowseScreen.tsx`:
  - Replace `COURSES` mock with `listCourses({ limit: 20 })` on mount
  - Show `ActivityIndicator` while loading
  - Map `ApiCourse` fields to existing card display (`title`, `description`, `coverImageUrl`, `semesterCount`)
  - Remove fields that don't exist in the API: `kind`/`emblem`/`tag`/`lessons`/`time`/`progress`/`instructor`/`students`/`rating` — fall back gracefully for fields not in API (keep mock display for progress/stats until progress integration)

- [ ] Update `src/screens/student/CourseDetailScreen.tsx`:
  - Replace mock with `getCourseById(id)` — load real semester/subject/lesson tree
  - Pass the real course ID from the browse screen navigation
  - Display `semesters[]` → `subjects[]` (with `youtubeVideoId`) → lessons via `listLessons(subjectId)` on expand

### Phase 3: Admin Course List (CoursesScreen)

- [ ] Replace `COURSES` mock + hardcoded `drafts` array with API-driven data:
  - State: `courses: ApiCourse[]`, `loadingCourses: boolean` (local to screen, not store)
  - Fetch `listCourses({ state: tab })` on mount and on tab change (`published` / `draft` / `archived`)
  - Show `ActivityIndicator` while loading
  - Map `ApiCourse` fields to existing `CourseCard`/list display

- [ ] Wire **Create course** flow:
  - Tap "+" → show a simple `Modal` or `Alert.prompt`-style form asking for title + description
  - Call `createCourse({ title, description })` → on success navigate to `CourseBuilderScreen` with the returned `courseId` and set `courseBuilderStore` with the new course
  - Handle `COURSE_TITLE_EXISTS` → inline error

- [ ] Wire **3-dot menu lifecycle actions**:
  - Publish → `publishCourse(id)` → on success update the local course list (move to published tab)
  - Unpublish → `unpublishCourse(id)` → update list
  - Archive → `archiveCourse(id)` → update list
  - Delete → existing confirmation modal → `deleteCourse(id)` → remove from list
  - Handle error codes: `INVALID_STATE`, `EMPTY_SEMESTER`, `NO_SEMESTERS` — show descriptive toast

- [ ] Wire **Edit** (3-dot menu) → load `getCourseById(id)` → convert to `BuilderCourse` shape → load into `courseBuilderStore` → navigate to builder

### Phase 4: Course Builder — Semester & Subject CRUD

- [ ] Update `courseBuilderStore` to hold the real `courseId` (string, from the API):
  - Add `courseId: string | null` to state
  - `initNew(courseId)` → sets `courseId` + resets `semesters: []`
  - `load(course: BuilderCourse, courseId: string)` → sets `courseId`

- [ ] Update `CourseBuilderScreen`:
  - Remove `CourseType` picker and `setType` call — not part of the API
  - Update `PATCH /courses/:id` on title/description save
  - **Add Semester** button:
    - Calls `createSemester(courseId, { name, sortOrder })` → on success calls `courseBuilderStore.addSemester()` with real `semesterId`
    - Disabled when `courseId` is null
  - **Rename Semester** → `updateSemester(semesterId, { name })`
  - **Delete Semester** → `deleteSemester(semesterId)` → on success remove from store
  - **Add Subject** requires a YouTube URL:
    - Calls `createSubject(semesterId, { title, description, youtubeVideoUrl, sortOrder })` → on success `courseBuilderStore.addSubject()`
    - Handle `INVALID_YOUTUBE_ID` — show error below the URL input
  - **Update Subject** → `updateSubject(subjectId, patch)`
  - **Delete Subject** → `deleteSubject(subjectId)` → remove from store
  - **Publish** button → `publishCourse(courseId)` → handle `EMPTY_SEMESTER`, `NO_SEMESTERS`, `INVALID_STATE` with descriptive toasts

### Phase 5: Lesson Editor — Lesson & Attachment CRUD

- [ ] Update `src/data/types.ts` — rename `BuilderLesson.youtubeUrl` → `BuilderLesson.url`; update all references in `courseBuilderStore` and `LessonEditorScreen`

- [ ] Update `LessonEditorScreen`:
  - **Add Lesson** → `createLesson(subjectId, { title, url, description? })` → on success `courseBuilderStore.addLesson()`
  - **Update Lesson** → `updateLesson(lessonId, patch)` on save
  - **Delete Lesson** → `deleteLesson(lessonId)` → on success `courseBuilderStore.removeLesson()`
  - Update video URL input: relabel from "YouTube URL" to "Video URL" (any platform accepted)
  - **Upload attachment**:
    - Tap upload → `expo-document-picker` (PDF/DOC/DOCX filter if possible, otherwise validate after pick)
    - Client-side check: `mimeType` and size ≤ 25 MB before calling API
    - `uploadAttachment(subjectId, { uri, name, type })` → multipart fetch
    - On success: add to `courseBuilderStore` lesson's `attachments[]`
    - Show loading indicator on upload button
  - **Delete attachment** → `deleteAttachment(id)` → on success remove from store

### Phase 6: Edge Cases & Polish

- [ ] Network failures on all course list and builder operations → toast + re-enable button / keep form data
- [ ] `COURSE_TITLE_EXISTS` on create → inline error on title field
- [ ] `INVALID_YOUTUBE_ID` on subject create/update → inline error below URL field
- [ ] `EMPTY_SEMESTER` / `NO_SEMESTERS` on publish → toast with specific guidance ("Add at least one subject to each semester before publishing.")
- [ ] `INVALID_STATE` on lifecycle actions → toast "This course is no longer in the required state." + refresh list
- [ ] Attachment `UNSUPPORTED_MEDIA_TYPE` → toast "Only PDF, DOC, and DOCX files are accepted."
- [ ] Attachment `FILE_TOO_LARGE` → toast "File exceeds the 25 MB limit."
- [ ] Dark mode: verify `CourseBuilderScreen`, `LessonEditorScreen`, `CoursesScreen`, `StudentBrowseScreen`
- [ ] Verify no `toast.info('… coming soon')` on any touched course-management button

### Phase 7: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires backend + Firebase config)
- [ ] Student: Browse screen loads real published courses
- [ ] Student: Tap course → detail shows real semesters/subjects/lessons
- [ ] Admin: Courses tab shows published/draft/archived from API (per tab)
- [ ] Admin: Create course → fills title + description → course appears in drafts
- [ ] Admin: Open builder → add semester → add subject (YouTube URL) → add lesson (any URL)
- [ ] Admin: Upload PDF attachment → appears in lesson
- [ ] Admin: Delete attachment → removed
- [ ] Admin: Publish course → success (valid: ≥1 semester + ≥1 subject each)
- [ ] Admin: Publish course → failure (`EMPTY_SEMESTER`) → correct toast shown
- [ ] Admin: Archive / Unpublish / Delete from 3-dot menu
- [ ] Admin: Invalid YouTube URL in subject → inline error shown
- [ ] Toggle dark mode across all course screens

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/courses.ts` | **new** | Full course CRUD + lifecycle |
| `src/services/semesters.ts` | **new** | Semester CRUD |
| `src/services/subjects.ts` | **new** | Subject + Lesson CRUD |
| `src/services/attachments.ts` | **new** | Upload + delete |
| `src/screens/student/StudentBrowseScreen.tsx` | modified | Wire `GET /courses` |
| `src/screens/student/CourseDetailScreen.tsx` | modified | Wire `GET /courses/:id` |
| `src/screens/admin/CoursesScreen.tsx` | modified | API-driven tabs, create, lifecycle |
| `src/screens/admin/CourseBuilderScreen.tsx` | modified | Wire CRUD, remove CourseType |
| `src/screens/admin/LessonEditorScreen.tsx` | modified | Wire lesson + attachment CRUD |
| `src/store/courseBuilderStore.ts` | modified | Add `courseId`, rename `youtubeUrl→url` |
| `src/data/types.ts` | modified | `BuilderLesson.youtubeUrl` → `url` |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (backend required)
- [ ] Student catalog: browse → tap course → see real content tree
- [ ] Admin create: title + desc → draft in list
- [ ] Admin builder: add semester → add subject (valid YouTube URL) → add lesson
- [ ] Admin lesson: upload PDF → delete attachment
- [ ] Admin publish: empty course → error toast; valid course → success
- [ ] Admin archive/unpublish/delete via 3-dot
- [ ] Invalid YouTube URL on subject form → inline error
- [ ] Network off during any mutation → toast, state preserved

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` introduced
- [ ] No `toast.info('… coming soon')` on any course management action
- [ ] `POST /courses` body: `{ title, description, coverImageUrl? }` — no `type` field
- [ ] `POST /semesters/:id/subjects` body: `{ title, description, youtubeVideoUrl, sortOrder }` — YouTube URL not ID
- [ ] `POST /subjects/:id/lessons` body: `{ title, url, description? }` — `url` not `youtubeUrl`
- [ ] Attachment upload uses `FormData` with field name `file`
- [ ] Dark mode correct across all new/modified screens
- [ ] All 7 phases completed
- [ ] Spec status → `shipped`
- [ ] PR references spec

---

## 📝 Progress Tracking

**Status legend:**
- 🟡 Draft — Planning stage
- 🔵 In Progress — Implementation started
- 🟢 Complete — All phases done
- 🔴 Blocked — Waiting on dependency

**Current Phase:** Phase 1
**Completion:** 0%

---

## 📌 Notes

- **Backend blocker:** Phases 1–6 can be fully coded and TypeScript-verified without the backend. Phase 7 needs the backend.
- **`expo-document-picker`** must be installed before Phase 5 (`npx expo install expo-document-picker`). It is Expo Go compatible.
- **`CourseType` removal:** `BuilderCourse.type` and `CourseType` enum in `data/types.ts` can be kept for now (other code may reference them) — just stop sending `type` to the API and remove the picker from the UI.
- **Subject `youtubeVideoId` vs `youtubeVideoUrl`:** The API accepts a full YouTube URL in the request body (`youtubeVideoUrl`) and stores only the 11-char ID (`youtubeVideoId`) in the response. The builder input should accept a full URL (easier for admins); extract logic is server-side.
- **Student `CourseDetailScreen` content tree:** `GET /courses/:id` returns subjects directly with their `youtubeVideoId`. Lessons are a separate fetch per subject (`GET /subjects/:id/lessons`). For the initial integration, call `listLessons` lazily when a subject accordion is expanded.
- **`SAMPLE_BUILDER_COURSE`** in `data/mock.ts`: keep it in mock.ts for now; just stop importing it in `CoursesScreen`. Remove the import, not the data.
