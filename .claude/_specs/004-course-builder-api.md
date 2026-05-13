# Course Builder and Catalog API Integration

**Spec ID:** 004-course-builder-api
**Branch:** `feat/course-builder-api`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Wire the full course lifecycle: the public course catalog (student/public browse via `GET /courses` and `GET /courses/:id`), admin course CRUD and lifecycle management, and the course builder's nested CRUD (semesters, subjects, lessons, attachments). Replaces all mock course data with real API data. The frontend hierarchy (Course → Semester → Subject → Lesson → Attachments) already aligns with the API hierarchy — no structural rework needed.

---

## User Stories

- As a **student or visitor**, I want to browse the published course catalog so I can discover and view courses.
- As a **student**, I want to see a course's full content tree (semesters, subjects with their main video, and lessons) so I know what I'm enrolling in.
- As an **admin**, I want to view all my courses (draft, published, archived) and create new ones from the Courses tab.
- As an **admin**, I want to build a course by adding semesters, subjects (with a YouTube video), and lessons (any video URL), so the course is ready to publish.
- As an **admin**, I want to publish, unpublish, or archive a course from the course list, so I control what students can see.
- As an **admin**, I want to delete a course (soft-delete) with a confirmation, so I can clean up the catalog.
- As an **admin**, I want to upload PDF/DOC attachments to a subject, so students get supplementary materials.

---

## API Contract

### Course endpoints

**§4.1 `GET /courses`** — List courses (public: published only; admin: all states)
- Query params: `state` (admin only), `q`, `limit`, `cursor`
- Response: paginated `{ items: ApiCourse[], nextCursor, total }`

**§4.2 `GET /courses/:id`** — Get course with full semester/subject tree
- Public: 404 if draft/archived; Admins: any state
- Response: `ApiCourseDetail` (includes `semesters[].subjects[].attachments`)

**§4.3 `POST /courses`** — Create course in `draft` state
- Body: `{ title, description, coverImageUrl? }`
- **Note:** No `type`/`tag` field in API — the mock's `CourseType` (Engineering, Science, etc.) does not exist in the API. Do not send it.

**§4.4 `PATCH /courses/:id`** — Update metadata (draft state only)
- Body: partial `{ title?, description?, coverImageUrl? }`

**§4.5 `POST /courses/:id/publish`** — Publish a draft course
- Server enforces: ≥1 semester, each semester ≥1 subject
- Error codes: `INVALID_STATE`, `EMPTY_SEMESTER`, `NO_SEMESTERS`

**§4.6 `POST /courses/:id/unpublish`** — Return published course to draft

**§4.7 `POST /courses/:id/archive`** — Archive a published course

**§4.8 `DELETE /courses/:id`** — Soft-delete

### Semester endpoints

**§5.1 `POST /courses/:id/semesters`** — Add semester
- Body: `{ name, sortOrder }`

**§5.2 `PATCH /semesters/:id`** — Update name/sortOrder

**§5.3 `DELETE /semesters/:id`** — Soft-delete semester and all its subjects

### Subject endpoints

**§6.1 `POST /semesters/:id/subjects`** — Add subject
- Body: `{ title, description, youtubeVideoUrl, sortOrder }` — server extracts the 11-char YouTube ID
- Error: `INVALID_YOUTUBE_ID` if URL/ID is not a valid YouTube video

**§6.2 `PATCH /subjects/:id`** — Update subject

**§6.3 `DELETE /subjects/:id`** — Soft-delete

### Lesson endpoints

**§6.4 `GET /subjects/:id/lessons`** — List lessons ordered by `order`

**§6.5 `POST /subjects/:id/lessons`** — Add lesson
- Body: `{ title, url, description? }` — accepts any video URL (YouTube, Vimeo, etc.)
- **Note:** `url` field (not `youtubeUrl`). Order is auto-assigned by the server.

**§6.6 `PATCH /lessons/:id`** — Update lesson

**§6.7 `DELETE /lessons/:id`** — Soft-delete

### Attachment endpoints

**§7.1 `POST /subjects/:id/attachments`** — Upload file
- `Content-Type: multipart/form-data`; field name `file`; PDF/DOC/DOCX only; max 25 MB
- Requires `expo-document-picker` for file selection

**§7.3 `DELETE /attachments/:id`** — Delete attachment

---

## Screens / Navigation

**Student / Public (course catalog):**
- `src/screens/student/StudentBrowseScreen.tsx` — replace mock `COURSES` with `GET /courses` (published only)
- `src/screens/student/CourseDetailScreen.tsx` — replace mock with `GET /courses/:id`; display semesters → subjects (with `youtubeVideoId`) → lessons

**Admin (course management):**
- `src/screens/admin/CoursesScreen.tsx` — replace mock `COURSES` + hardcoded `drafts` with `GET /courses` per tab (published, draft, archived); wire create → `POST /courses`; wire lifecycle actions (publish/unpublish/archive/delete) from the 3-dot menu
- `src/screens/admin/CourseViewScreen.tsx` — wire `GET /courses/:id` to show real content tree; "Edit" navigates to builder with the real course loaded
- `src/screens/admin/CourseBuilderScreen.tsx` — wire all builder mutations to API calls; course must exist (created via `POST /courses`) before semesters/subjects/lessons can be added
- `src/screens/admin/LessonEditorScreen.tsx` — wire `POST /subjects/:id/lessons`, `PATCH /lessons/:id`, `DELETE /lessons/:id`, and attachment upload/delete

**New screens:** none

**Navigation changes:** none — existing routes stay the same

---

## State / Stores

- **Stores touched:** `courseBuilderStore`
- **Approach:** `courseBuilderStore` currently holds a `BuilderCourse` entirely in local state. After wiring, mutations (add semester, add subject, add lesson) call the API AND update local state on success. The local store remains the source of truth for the builder UI between mutations.
- **New API types (define in service files, not `data/types.ts`):**
  - `ApiCourse` — list item shape from `GET /courses`
  - `ApiCourseDetail` — full tree shape from `GET /courses/:id`
  - `ApiSemester`, `ApiSubject`, `ApiLesson`, `ApiAttachment`
- **Important:** `API Course` has no `type`/`tag` field. The builder's `CourseType` picker should be removed or kept as a local-only label that is NOT sent to the API.
- **Pagination:** Load first page (limit 20) on mount. No infinite scroll yet.

---

## UI States

- **Course list loading:** spinner while `GET /courses` is in flight
- **Empty states:** existing `EmptyState` component handles "no courses" per tab
- **Builder — course not yet saved:** create flow must `POST /courses` first to get a `courseId`; the "Add Semester" button should be disabled until the course is saved
- **Builder — save/publish errors:** inline toast for `INVALID_STATE`, `COURSE_TITLE_EXISTS`, `EMPTY_SEMESTER`, `INVALID_YOUTUBE_ID`
- **Attachment upload:** loading indicator on the upload button; 25 MB size check client-side; file type check before calling API
- **Delete confirmation:** existing modal pattern — confirm before calling `DELETE /courses/:id`

---

## Functional Requirements

**Service layer:**
- [ ] Create `src/services/courses.ts` — `listCourses`, `getCourseById`, `createCourse`, `updateCourse`, `publishCourse`, `unpublishCourse`, `archiveCourse`, `deleteCourse`
- [ ] Create `src/services/semesters.ts` — `createSemester`, `updateSemester`, `deleteSemester`
- [ ] Create `src/services/subjects.ts` — `createSubject`, `updateSubject`, `deleteSubject`, `listLessons`, `createLesson`, `updateLesson`, `deleteLesson`
- [ ] Create `src/services/attachments.ts` — `uploadAttachment(subjectId, fileUri, fileName, mimeType)`, `deleteAttachment(id)`

**Student catalog:**
- [ ] Wire `StudentBrowseScreen` to `GET /courses` (published list)
- [ ] Wire `CourseDetailScreen` to `GET /courses/:id` (full tree)

**Admin course list (`CoursesScreen`):**
- [ ] Load published/draft/archived courses from `GET /courses?state=<tab>` on tab change
- [ ] Create course flow: tap "+" → input title + description → `POST /courses` → navigate to builder with returned `courseId`
- [ ] 3-dot menu: wire Publish (`POST /courses/:id/publish`), Unpublish, Archive, Delete (with confirmation)
- [ ] Remove hardcoded `drafts` array and `COURSES` mock import

**Course builder (`CourseBuilderScreen`):**
- [ ] On mount in "create" mode: the course already exists from the create flow (has `courseId`)
- [ ] Add Semester → `POST /courses/:id/semesters` → add to store on success
- [ ] Rename Semester → `PATCH /semesters/:id`
- [ ] Delete Semester → `DELETE /semesters/:id` with confirmation
- [ ] Add Subject → `POST /semesters/:id/subjects` (requires `youtubeVideoUrl`) → add to store on success
- [ ] Update Subject → `PATCH /subjects/:id`
- [ ] Delete Subject → `DELETE /subjects/:id`
- [ ] Publish/Save Course → `POST /courses/:id/publish` or `PATCH /courses/:id` for draft saves
- [ ] Remove `CourseType` picker from the builder UI (no `type` field in API)

**Lesson editor (`LessonEditorScreen`):**
- [ ] Add Lesson → `POST /subjects/:id/lessons` with `{ title, url, description? }` — any video URL accepted
- [ ] Update Lesson → `PATCH /lessons/:id`
- [ ] Delete Lesson → `DELETE /lessons/:id`
- [ ] Upload attachment → `POST /subjects/:id/attachments` (multipart); client-side validate: PDF/DOC/DOCX, ≤ 25 MB
- [ ] Delete attachment → `DELETE /attachments/:id`
- [ ] Rename field: `youtubeUrl` (mock) → `url` (API) everywhere in the lesson editor

---

## Non-Functional Requirements

- [ ] **Performance** — course list loads within 3 s; builder mutations give immediate local feedback (optimistic or loading indicator)
- [ ] **Accessibility** — all action buttons ≥ 44pt; attachment upload errors shown inline
- [ ] **Security** — `expo-document-picker` used for attachment selection (no raw file path access); `INVALID_YOUTUBE_ID` handled gracefully in subject form
- [ ] **Offline behaviour** — network failure on any builder action → toast + revert local state if optimistic

---

## Acceptance Criteria

- [ ] Student browse screen shows real published courses from the API
- [ ] Course detail shows the full semester → subject → lesson tree
- [ ] Admin can create a course (title + description), which starts in `draft`
- [ ] Admin can add a semester, add a subject with a YouTube URL, add lessons with any video URL
- [ ] Admin can publish a course; server validates ≥1 semester + subjects
- [ ] Admin can archive/unpublish/delete from the 3-dot menu
- [ ] Lesson editor accepts any video URL (not just YouTube)
- [ ] Attachment upload rejects non-PDF/DOC/DOCX files client-side
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `COURSES` import in `CoursesScreen`, `StudentBrowseScreen`; hardcoded `drafts` in `CoursesScreen`; `courseBuilderStore` local-only mutations; `SAMPLE_BUILDER_COURSE` loaded on edit
- **Still mocked after this feature:** student progress data on course cards (enrolled count, hours), learning content player (`LessonPlayerScreen` progress — separate spec), notifications

---

## Out of Scope

- `GET /attachments/:id/download-url` — student attachment downloads (separate spec with enrollment gate)
- Course cover image upload (requires Firebase Storage — deferred)
- Subject `sortOrder` drag-to-reorder UI (keep manual sort order input for now)
- Infinite scroll / pagination beyond first page
- Course search/filter UI (`q` parameter wired in service, not in UI)

---

## Definition of Done

- [ ] Spec status → `shipped`
- [ ] All service files created: `courses.ts`, `semesters.ts`, `subjects.ts`, `attachments.ts`
- [ ] Student catalog wired
- [ ] Admin course list wired (all tabs + lifecycle actions)
- [ ] Course builder mutations wired (semester, subject, lesson CRUD)
- [ ] Attachment upload/delete wired in lesson editor
- [ ] `CourseType` picker removed from builder
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on device
- [ ] PR references this spec

---

## References Used

- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §4.1–4.8 (Courses), §5.1–5.3 (Semesters), §6.1–6.7 (Subjects + Lessons), §7.1 + §7.3 (Attachments)
- `src/screens/admin/CoursesScreen.tsx` — current mock-driven course list
- `src/screens/admin/CourseBuilderScreen.tsx` — current local-only builder
- `src/store/courseBuilderStore.ts` — current mock hierarchy store
