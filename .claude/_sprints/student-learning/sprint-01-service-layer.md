# Sprint 1: Service Layer

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Status:** 🟢 Complete
**Estimated:** 1 h · **Actual:** ~20 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Create all service files with API-aligned types and typed fetch functions — the foundation every subsequent sprint calls.

---

## 📋 Tasks

**`src/services/studentEnrollments.ts` (new)**
- [ ] Define `ApiEnrollment` interface: `{ id, courseId, courseTitle, studentUid, state: 'pending'|'approved'|'rejected'|'withdrawn', approvedAt?, rejectedAt?, createdAt, updatedAt }`
- [ ] `enrollInCourse(courseId: string)` → `POST /courses/${courseId}/enroll` (no body), tag: `'enrollment.enroll'`
- [ ] `listMyEnrollments(cursor?: string)` → `GET /me/enrollments?limit=50`, tag: `'enrollment.list'`
- [ ] `withdrawEnrollment(enrollmentId: string)` → `POST /enrollments/${enrollmentId}/withdraw` (no body), tag: `'enrollment.withdraw'`

**`src/services/progress.ts` (new)**
- [ ] Define `ApiSubjectProgress` interface: `{ studentUid, subjectId, courseId, semesterId, state: 'not_started'|'in_progress'|'completed', completedAt?, lastAccessedAt? }`
- [ ] Define `ApiCourseProgress` interface: `{ courseId, studentUid, totalSubjects, completedCount, pendingCount, completionPercent, lastAccessedSubjectId }`
- [ ] `markSubjectComplete(subjectId, payload: { courseId: string; semesterId: string })` → `POST /progress/subjects/${subjectId}/complete`, tag: `'progress.complete'`
- [ ] `updateLastAccessed(subjectId, payload: { courseId: string; semesterId: string })` → `POST /progress/subjects/${subjectId}/access`, tag: `'progress.access'`
- [ ] `getCourseProgress(courseId)` → `GET /me/progress/courses/${courseId}`, tag: `'progress.course'`
- [ ] `getSubjectProgress(subjectId)` → `GET /me/progress/subjects/${subjectId}`, tag: `'progress.subject'`

**`src/services/attachments.ts` (modify — add download URL function)**
- [ ] Add `getAttachmentDownloadUrl(attachmentId: string)` → `GET /attachments/${attachmentId}/download-url`; returns `{ downloadUrl: string; expiresAt: string }`, tag: `'attachments.downloadUrl'`

---

## 📁 Files to Touch

**New:**
- `src/services/studentEnrollments.ts`
- `src/services/progress.ts`

**Modified:**
- `src/services/attachments.ts` — add `getAttachmentDownloadUrl`

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** none — Sprint 1
- **Blocks:** Sprints 2, 3
- **External:** none — pure TypeScript, no backend needed

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `markSubjectComplete` and `updateLastAccessed` bodies include BOTH `courseId` AND `semesterId` — never send just one
- [ ] `enrollInCourse` and `withdrawEnrollment` send **no body** (not even `{}`)
- [ ] No mock types from `src/data/types.ts` used in these service files

---

## 🧪 Verification

```bash
npx tsc --noEmit
```

No device needed — pure service layer.

---

## 📝 Notes

- `listMyEnrollments` returns a paginated list — for now load limit=50 (no infinite scroll). The response shape is `{ items: ApiEnrollment[], nextCursor, total }`.
- `enrollInCourse` posts to `/courses/:courseId/enroll` — note the path goes through the course resource, not a top-level `/enrollments` path.
- `getSubjectProgress` returns a 404 if the student has never accessed that subject — callers must handle 404 gracefully (treat as `state: 'not_started'`).

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

**Next:** [`sprint-02-ui-wiring-enrollment.md`](./sprint-02-ui-wiring-enrollment.md)
