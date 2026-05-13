# Implementation Plan: Student Enrollment, Progress Tracking and Attachment Downloads

**Spec:** [`.claude/_specs/005-student-learning.md`](../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Created:** 2026-05-13
**Status:** 🟡 Draft
**Estimated effort:** 2–3 days (device testing requires approved enrolment from backend)

---

## 📋 Context

Students can browse and view courses but cannot enrol, track progress, or download attachments. This plan wires the full student learning loop. All three screen areas (`CourseDetailScreen`, `MyLearningScreen`, `LessonPlayerScreen`) currently use mock data.

- **Spec:** 005-student-learning
- **API Reference:** §7.2 (Attachment Download), §8.1–8.3 (Enrollment), §11.1–11.4 (Progress)
- **Replaces mock:** `COURSES` in `MyLearningScreen`; "Request enrol" toast stub; mock LESSON attachments in `LessonPlayerScreen`

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|---|---|---|
| 1 | **No Zustand store for progress** — component-local state | Progress is transient; persisted server-side. Adding a store would duplicate state without benefit at this stage. | `LessonPlayerScreen`, `CourseDetailScreen` |
| 2 | `CourseDetailScreen` checks enrolment state by calling `listMyEnrollments()` on mount and matching `courseId` | Avoids passing enrolment state through navigation params; the screen self-fetches | `CourseDetailScreen` |
| 3 | `LessonPlayerScreen` requires `subjectId`, `courseId`, `semesterId` as new route params | `POST /progress/subjects/:id/complete` and `POST /progress/subjects/:id/access` both require `courseId` + `semesterId` in the body — these must be passed from the course tree | `LessonPlayerScreen`, `StudentTabs` navigator |
| 4 | Attachment download via `Linking.openURL()` | The signed URL expires in 15 min — open immediately in the device browser; never cache the URL | `LessonPlayerScreen` |
| 5 | `MyLearningScreen` uses three tabs: **In Progress** (approved + progress > 0), **Enrolled** (approved + no progress), **Pending** (state = pending) | Matches the existing two-tab layout; adds Pending to surface awaiting-approval courses | `MyLearningScreen` |
| 6 | **Pessimistic updates** on enrol/mark-complete | Only change UI state after the server confirms success | All enrollment + progress handlers |
| 7 | Auto-complete at 90% video playback — **deferred** | Requires a real YouTube player; current player is a mock. Manual "Mark Complete" only. | `LessonPlayerScreen` |
| 8 | `getCourseProgress` fetched per enrolled course in MyLearningScreen | Populates the real progress % bar. Loaded after the enrolment list arrives. | `MyLearningScreen` |

---

## 🚀 Implementation Steps

### Phase 1: Service Layer

- [ ] Create `src/services/studentEnrollments.ts`:
  - `ApiEnrollment` interface: `{ id, courseId, courseTitle, studentUid, state: 'pending'|'approved'|'rejected'|'withdrawn', approvedAt?, rejectedAt?, createdAt, updatedAt }`
  - `enrollInCourse(courseId: string)` → `POST /courses/:courseId/enroll`
  - `listMyEnrollments(cursor?: string)` → `GET /me/enrollments?limit=50`
  - `withdrawEnrollment(enrollmentId: string)` → `POST /enrollments/:enrollmentId/withdraw`

- [ ] Create `src/services/progress.ts`:
  - `ApiSubjectProgress` interface: `{ studentUid, subjectId, courseId, semesterId, state: 'not_started'|'in_progress'|'completed', completedAt?, lastAccessedAt? }`
  - `ApiCourseProgress` interface: `{ courseId, studentUid, totalSubjects, completedCount, pendingCount, completionPercent, lastAccessedSubjectId }`
  - `markSubjectComplete(subjectId, payload: { courseId: string; semesterId: string })` → `POST /progress/subjects/:id/complete`
  - `updateLastAccessed(subjectId, payload: { courseId: string; semesterId: string })` → `POST /progress/subjects/:id/access`
  - `getCourseProgress(courseId)` → `GET /me/progress/courses/:courseId`
  - `getSubjectProgress(subjectId)` → `GET /me/progress/subjects/:subjectId`

- [ ] Add `getAttachmentDownloadUrl(attachmentId)` to `src/services/attachments.ts`:
  - → `GET /attachments/:id/download-url`
  - Returns `{ downloadUrl: string; expiresAt: string }`

### Phase 2: UI Wiring — Enrollment

- [ ] Update `CourseDetailScreen.tsx`:
  - On mount: call `listMyEnrollments()` and find the entry matching `courseId` → store in local `enrolment` state
  - **If no enrolment:** show "Request enrol" button
  - **If `state === 'pending'`:** show "Pending approval" badge (not tappable)
  - **If `state === 'approved'`:** show "Continue learning" button (navigates to first subject/lesson)
  - "Request enrol" tap → `enrollInCourse(courseId)` → loading state → on success: update local enrolment state to `pending`
  - Handle `ENROLLMENT_EXISTS` (409) → refresh enrolment state, show current badge
  - Handle `RESUBMIT_TOO_EARLY` (429) → toast "You must wait 24 hours after a rejection before re-enrolling."

- [ ] Update `MyLearningScreen.tsx`:
  - Replace `COURSES` mock with `listMyEnrollments()` on mount
  - Show `ActivityIndicator` while loading
  - After enrolments load, fetch `getCourseProgress(courseId)` for each approved enrolment to get real `completionPercent`
  - Three tabs: **In Progress** (approved + completionPercent > 0), **Enrolled** (approved + completionPercent === 0), **Pending** (state = pending)
  - Course card displays: `courseTitle`, `completionPercent` progress bar
  - Empty state per tab: "No courses in progress", "Not enrolled in any courses yet", "No pending enrolments"

### Phase 3: UI Wiring — Progress + Lesson Player

- [ ] Update navigation to pass `subjectId`, `courseId`, `semesterId` to `LessonPlayerScreen`:
  - `CourseDetailScreen` currently navigates to `LessonPlayer` — update to pass the subject's IDs
  - `StudentTabs` navigator: update `LessonPlayerScreen` route params type

- [ ] Update `LessonPlayerScreen.tsx`:
  - Accept `subjectId`, `courseId`, `semesterId` from route params
  - **On mount:** call `updateLastAccessed(subjectId, { courseId, semesterId })` (fire-and-forget, no loading state needed)
  - Add **"Mark Complete"** button in the player UI:
    - Calls `markSubjectComplete(subjectId, { courseId, semesterId })`
    - Loading state while in-flight
    - On success: show green tick + toast "Subject marked complete! ✓"
    - Idempotent — safe to tap multiple times
  - Load attachment list from the subject data (already available in course tree from `getCourseById`)
  - Per attachment: show download icon button → `getAttachmentDownloadUrl(attachmentId)` → `Linking.openURL(downloadUrl)`

- [ ] Update `CourseDetailScreen.tsx` — subject completion ticks:
  - When a subject accordion is expanded, call `getSubjectProgress(subjectId)` lazily
  - Show a green tick next to the subject title if `state === 'completed'`

### Phase 4: Edge Cases & Polish

- [ ] `enrollInCourse` network failure → toast "Couldn't reach the server." + button re-enabled
- [ ] `markSubjectComplete` network failure → toast + "Mark Complete" button re-enabled
- [ ] `getAttachmentDownloadUrl` → `ENROLLMENT_REQUIRED` (403) → toast "You need an approved enrolment to download attachments."
- [ ] `getAttachmentDownloadUrl` network failure → toast "Download failed. Check your connection."
- [ ] `withdrawEnrollment` (future — for pending enrolments in MyLearningScreen): `INVALID_STATE` (409) → toast "Only pending enrolments can be withdrawn."
- [ ] Dark mode verification: `MyLearningScreen` tabs + cards, `LessonPlayerScreen` attachment download button
- [ ] Grep check: no `toast.info('… coming soon')` on enrol, mark-complete, or attachment flows

### Phase 5: Manual Test on Device

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go (requires backend + Firebase)
- [ ] Student taps "Request enrol" on a published course → button changes to "Pending approval"
- [ ] Admin approves the enrolment (from admin app)
- [ ] Student opens My Learning → enrolled course appears in "Enrolled" tab
- [ ] Student taps into course → subject accordion → opens lesson player
- [ ] LessonPlayerScreen opens → `POST /progress/subjects/:id/access` fires (verify in Metro console or DebugPanel)
- [ ] Student taps "Mark Complete" → tick appears, toast shown, `POST /progress/subjects/:id/complete` fires with `courseId` + `semesterId` in body
- [ ] Student returns to My Learning → course moves to "In Progress" tab, progress bar shows %
- [ ] Student taps attachment download icon → signed URL opens in device browser
- [ ] Student with no enrolment taps attachment → 403 toast shown
- [ ] Network off during enrol → toast, button re-enabled

---

## 📁 Key Files

| File | Change | Notes |
|---|---|---|
| `src/services/studentEnrollments.ts` | **new** | `enrollInCourse`, `listMyEnrollments`, `withdrawEnrollment` |
| `src/services/progress.ts` | **new** | `markSubjectComplete`, `updateLastAccessed`, `getCourseProgress`, `getSubjectProgress` |
| `src/services/attachments.ts` | modified | add `getAttachmentDownloadUrl` |
| `src/screens/student/CourseDetailScreen.tsx` | modified | enrol flow + subject completion ticks |
| `src/screens/student/MyLearningScreen.tsx` | modified | real enrolment data + progress % |
| `src/screens/student/LessonPlayerScreen.tsx` | modified | access tracking + mark complete + attachment download |
| `src/navigation/StudentTabs.tsx` | modified | pass `subjectId`, `courseId`, `semesterId` to LessonPlayer |

---

## 🧪 Manual Test Plan

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go
- [ ] Happy path: enrol → admin approves → My Learning shows course → mark subject complete → progress % updates
- [ ] Error path: enrol with no Wi-Fi → toast, no crash
- [ ] Attachment download: tap download → browser opens with signed URL
- [ ] Attachment download without enrolment → 403 toast
- [ ] Toggle dark mode on My Learning + Lesson Player screens

---

## ✅ Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` introduced
- [ ] No `toast.info('… coming soon')` on enrol / mark-complete / attachment flows
- [ ] `POST /progress/subjects/:id/complete` body contains BOTH `courseId` AND `semesterId` (verify in DebugPanel)
- [ ] `POST /progress/subjects/:id/access` same — both required fields present
- [ ] Attachment `downloadUrl` is opened immediately via `Linking.openURL` — not stored in state
- [ ] Loading + error states present on all new buttons
- [ ] All 5 phases completed
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

- **`courseId` + `semesterId` in progress body** — the single most error-prone part of this feature. Both fields are mandatory in §11.1 and §11.2. When `LessonPlayerScreen` opens, it must receive these IDs from the subject tree navigation.
- **`LessonPlayerScreen` route params** — currently receives no subject/course IDs. The navigator must be updated to pass `subjectId`, `courseId`, `semesterId` alongside the lesson info.
- **Attachment download URL** — the signed URL from `GET /attachments/:id/download-url` expires in 15 minutes. Call it on tap, then immediately `Linking.openURL()`. Do not store it in state or pass it to another screen.
- **Backend dependency for device test** — Phase 5 needs an admin to approve an enrolment. Coordinate with the backend team for a test account that already has an approved enrolment, or plan for the admin to approve during testing.
