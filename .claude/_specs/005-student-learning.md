# Student Enrollment, Progress Tracking and Attachment Downloads

**Spec ID:** 005-student-learning
**Branch:** `feat/student-learning`
**Status:** draft
**Created:** 2026-05-13

---

## Overview
Wire the core student learning loop: a student can enrol in a published course, view their enrolled courses in MyLearning, track subject completion and last-accessed state, see real course progress percentages, and download subject attachments. Replaces all mock enrollment and progress data with live API calls.

---

## User Stories
- As a **student**, I want to tap "Request enrol" on a course detail page so that I can request access and see a "Pending" status while I wait for approval.
- As a **student**, I want to see my enrolled courses (with real progress %) in the My Learning tab so I know where I left off.
- As a **student**, I want to withdraw a pending enrolment so that I can cancel a request I submitted by mistake.
- As a **student**, I want the app to record that I accessed a subject when I open it so that "Continue Learning" can resume from the right place.
- As a **student**, I want to mark a subject as complete (or have it marked automatically at ~90% video) so I can track my progress through a course.
- As a **student**, I want to download a PDF/DOC attachment from a subject so I have the supplementary material offline.

---

## API Contract

### §8.1 — Enrol in course
**Endpoint:** `POST /courses/:id/enroll`
**Auth:** bearer (student)
**Request body:** none
**Success:** `201` — enrollment object
```json
{
  "id": "enr-...",
  "courseId": "course-abc",
  "courseTitle": "...",
  "studentUid": "...",
  "state": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```
**Error codes:**
- `ENROLLMENT_EXISTS` (409) → "You already have a pending or approved enrolment for this course."
- `COURSE_NOT_PUBLISHED` (422) → course must be published
- `RESUBMIT_TOO_EARLY` (429) → 24h cooldown after rejection

### §8.2 — List my enrolments
**Endpoint:** `GET /me/enrollments`
**Auth:** bearer (student)
**Query params:** `limit` (default 20), `cursor`
**Success:** `200` paginated
```json
{
  "items": [
    {
      "id": "enr-abc",
      "courseId": "course-abc",
      "courseTitle": "...",
      "state": "approved",
      "approvedAt": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "nextCursor": null,
  "total": 1
}
```

### §8.3 — Withdraw enrolment
**Endpoint:** `POST /enrollments/:id/withdraw`
**Auth:** bearer (student)
**Request body:** none
**Success:** `200` — updated enrollment with `state: "withdrawn"`
**Error codes:**
- `INVALID_STATE` (409) → only pending enrolments can be withdrawn

### §11.1 — Mark subject complete
**Endpoint:** `POST /progress/subjects/:id/complete`
**Auth:** bearer (student)
**Request body:**
```json
{ "courseId": "course-abc", "semesterId": "sem-001" }
```
**Note:** `courseId` and `semesterId` are **required** — both must be sent.
**Success:** `200` — progress record (idempotent — safe to call multiple times)
```json
{
  "studentUid": "...",
  "subjectId": "sub-001",
  "courseId": "course-abc",
  "semesterId": "sem-001",
  "state": "completed",
  "completedAt": "...",
  "lastAccessedAt": "..."
}
```

### §11.2 — Update last accessed
**Endpoint:** `POST /progress/subjects/:id/access`
**Auth:** bearer (student)
**Request body:**
```json
{ "courseId": "course-abc", "semesterId": "sem-001" }
```
**Note:** Both `courseId` and `semesterId` **required**.
**Success:** `200`
```json
{ "subjectId": "sub-001", "lastAccessedAt": "..." }
```

### §11.3 — Get course progress aggregate
**Endpoint:** `GET /me/progress/courses/:courseId`
**Auth:** bearer (student)
**Success:** `200`
```json
{
  "courseId": "course-abc",
  "studentUid": "...",
  "totalSubjects": 10,
  "completedCount": 4,
  "pendingCount": 6,
  "completionPercent": 40.0,
  "lastAccessedSubjectId": "sub-004"
}
```

### §11.4 — Get subject progress
**Endpoint:** `GET /me/progress/subjects/:subjectId`
**Auth:** bearer (student)
**Success:** `200` — progress record or `404` if not yet accessed

### §7.2 — Get attachment download URL
**Endpoint:** `GET /attachments/:id/download-url`
**Auth:** bearer (student, requires approved enrolment)
**Success:** `200`
```json
{
  "downloadUrl": "https://storage.googleapis.com/...?X-Goog-Signature=...",
  "expiresAt": "..."
}
```
**Error codes:**
- `ENROLLMENT_REQUIRED` (403) → student must have an approved enrolment for the parent course
- URL expires in **15 minutes** — open immediately on receipt; do not cache

---

## Screens / Navigation

- **New screens:** none
- **Modified screens:**
  - `src/screens/student/CourseDetailScreen.tsx` — wire "Request enrol" button → `POST /courses/:id/enroll`; show enrolment state (pending/approved) if already enrolled
  - `src/screens/student/MyLearningScreen.tsx` — replace mock `COURSES` with `GET /me/enrollments`; show real progress % per course
  - `src/screens/student/LessonPlayerScreen.tsx` — call `POST /progress/subjects/:id/access` when screen opens; add "Mark Complete" → `POST /progress/subjects/:id/complete`; show attachment download button → `GET /attachments/:id/download-url`
  - `src/screens/student/CourseDetailScreen.tsx` — show real completion tick per subject using `GET /me/progress/subjects/:id`

- **Navigation changes:** none

---

## State / Stores

- **New API types** (define in service files, do NOT reuse mock types):
  - `ApiEnrollment`: `id, courseId, courseTitle, studentUid, state, approvedAt?, rejectedAt?, createdAt, updatedAt`
  - `ApiSubjectProgress`: `studentUid, subjectId, courseId, semesterId, state, completedAt?, lastAccessedAt?`
  - `ApiCourseProgress`: `courseId, studentUid, totalSubjects, completedCount, pendingCount, completionPercent, lastAccessedSubjectId`
- **Server data caching:** local component state for now; no Zustand store for progress (that's a future refactor)
- `MyLearningScreen` manages its own `enrollments: ApiEnrollment[]` + `loading` state
- `LessonPlayerScreen` receives `subjectId`, `courseId`, `semesterId` as route params (in addition to lesson info)
- Progress state per subject loaded lazily when `CourseDetailScreen` expands a subject

---

## UI States

- **Enrol button states:**
  - Default (not enrolled): "Request enrol" — tappable
  - Loading: "Enrolling…" disabled
  - Success: button changes to "Pending approval" pill (not tappable)
  - Already enrolled (approved): button changes to "Continue learning" → navigates into course
  - Error `ENROLLMENT_EXISTS`: show current state badge instead of button
  - Error `RESUBMIT_TOO_EARLY`: toast "You must wait 24 hours after rejection before re-enrolling."

- **My Learning:** loading spinner → real enrolled course list with `completionPercent` bar; empty state "You haven't enrolled in any courses yet."

- **Mark Complete:** button in LessonPlayerScreen; shows spinner while API call is in flight; on success shows tick + toast "Subject marked complete!"

- **Attachment download:** tap download icon → loading spinner → opens the signed URL in device browser (`Linking.openURL`); expired URL or `ENROLLMENT_REQUIRED` → error toast

---

## Functional Requirements

- [ ] Create `src/services/studentEnrollments.ts`:
  - `ApiEnrollment` interface matching `GET /me/enrollments` response
  - `enrollInCourse(courseId)` → `POST /courses/:courseId/enroll`
  - `listMyEnrollments(cursor?)` → `GET /me/enrollments`
  - `withdrawEnrollment(enrollmentId)` → `POST /enrollments/:id/withdraw`

- [ ] Create `src/services/progress.ts`:
  - `ApiSubjectProgress`, `ApiCourseProgress` interfaces
  - `markSubjectComplete(subjectId, payload: { courseId, semesterId })` → `POST /progress/subjects/:id/complete`
  - `updateLastAccessed(subjectId, payload: { courseId, semesterId })` → `POST /progress/subjects/:id/access`
  - `getCourseProgress(courseId)` → `GET /me/progress/courses/:courseId`
  - `getSubjectProgress(subjectId)` → `GET /me/progress/subjects/:subjectId`

- [ ] Create `src/services/attachmentDownload.ts` (or extend `attachments.ts`):
  - `getAttachmentDownloadUrl(attachmentId)` → `GET /attachments/:id/download-url`

- [ ] Update `CourseDetailScreen`:
  - Detect if student is already enrolled (call `GET /me/enrollments` or check passed state)
  - "Request enrol" → `enrollInCourse(courseId)` → update button state
  - Show subject completion ticks from `getSubjectProgress` (lazy per subject expand)

- [ ] Update `MyLearningScreen`:
  - Replace `COURSES` mock with `listMyEnrollments()`
  - Display `courseTitle`, `completionPercent` progress bar per enrolment
  - Separate tabs: "In progress" (approved, progress > 0), "Enrolled" (approved, progress = 0), "Pending" (state = pending)

- [ ] Update `LessonPlayerScreen`:
  - Accept `subjectId`, `courseId`, `semesterId` as route params
  - On mount: call `updateLastAccessed(subjectId, { courseId, semesterId })`
  - "Mark Complete" button: call `markSubjectComplete(subjectId, { courseId, semesterId })`
  - Attachment download button: call `getAttachmentDownloadUrl(attachmentId)` → `Linking.openURL(downloadUrl)`

---

## Non-Functional Requirements

- [ ] **Performance** — enrolment list loads within 3 s; mark-complete responds within 3 s
- [ ] **Accessibility** — enrol/mark-complete buttons ≥ 44pt touch targets
- [ ] **Security** — `ENROLLMENT_REQUIRED` on attachment download → clear error toast; do not expose the signed URL beyond the `Linking.openURL` call
- [ ] **Offline** — network failure on enrol/mark-complete → toast, button re-enabled

---

## Acceptance Criteria

- [ ] Student can tap "Request enrol" on a published course → state changes to "Pending approval"
- [ ] `GET /me/enrollments` data appears in My Learning tab with real course titles and progress %
- [ ] Student cannot see attachment download if not enrolled (403 handled)
- [ ] Opening a subject lesson calls `POST /progress/subjects/:id/access` (verify in DebugPanel)
- [ ] "Mark Complete" on a subject calls `POST /progress/subjects/:id/complete` with correct `courseId` and `semesterId` in the body
- [ ] Attachment download opens the signed URL in the device browser
- [ ] `npx tsc --noEmit` passes throughout

---

## Mock vs Real

- **Replaces mock:** `COURSES` in `MyLearningScreen`; "Request enrol" toast stub in `CourseDetailScreen`; mock attachment list in `LessonPlayerScreen`
- **Still mocked after this feature:** video playback (no real YouTube player yet); auto-complete at 90% (deferred until real player)

---

## Out of Scope

- `GET /me/progress/courses/:courseId` for admin analytics (§11.5) — separate feature
- Auto-complete at 90% video (requires real YouTube player integration)
- Push notification on enrolment approval (backend side effect)
- Offline caching of progress data

---

## Definition of Done

- [ ] Spec status → `shipped`
- [ ] `src/services/studentEnrollments.ts` and `src/services/progress.ts` created
- [ ] `CourseDetailScreen` — enrol flow wired
- [ ] `MyLearningScreen` — real enrolment data shown
- [ ] `LessonPlayerScreen` — access + mark-complete + attachment download wired
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on device (enrol → pending → admin approves → appear in My Learning → mark subject complete → progress % updates)
- [ ] PR references this spec

---

## References Used

- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §7.2 (Attachment Download URL), §8.1–8.3 (Enrollment), §11.1–11.4 (Progress)
- `src/screens/student/MyLearningScreen.tsx` — currently reads mock COURSES
- `src/screens/student/LessonPlayerScreen.tsx` — currently uses mock LESSON data
- `src/screens/student/CourseDetailScreen.tsx` — "Request enrol" is a toast stub
