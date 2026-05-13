# Sprint 3: UI Wiring — Progress + Lesson Player

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Status:** 🟢 Complete
**Estimated:** 2–3 h · **Actual:** ~40 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire progress tracking (last accessed on open, mark complete on tap) and attachment downloads in `LessonPlayerScreen`; show subject completion ticks in `CourseDetailScreen`.

---

## 📋 Tasks

**Navigator update — pass subject IDs to `LessonPlayerScreen`:**
- [ ] Update `StudentTabs.tsx` (or wherever `LessonPlayer` route is defined) to pass these params: `{ subjectId: string, courseId: string, semesterId: string }` alongside the existing lesson info
- [ ] Update `CourseDetailScreen.tsx` to pass `subjectId`, `courseId`, `semesterId` when navigating to `LessonPlayer`

**`LessonPlayerScreen.tsx` — progress tracking:**
- [ ] Destructure `subjectId`, `courseId`, `semesterId` from `route.params`
- [ ] **On mount:** call `updateLastAccessed(subjectId, { courseId, semesterId })` — fire-and-forget (no loading state, no error toast — silent background call)
- [ ] Add **"Mark Complete"** button to the player UI:
  - State: `marking: boolean`, `completed: boolean`
  - On tap: set `marking = true` → call `markSubjectComplete(subjectId, { courseId, semesterId })`
  - On success: set `completed = true`, set `marking = false` → toast "Subject marked complete! ✓"
  - On error: set `marking = false` → toast "Couldn't mark complete. Try again."
  - If `completed === true`: button shows "✓ Completed" (disabled, green)

**`LessonPlayerScreen.tsx` — attachment downloads:**
- [ ] Show download icon button next to each attachment in the materials list
- [ ] On tap: call `getAttachmentDownloadUrl(attachmentId)` → on success: `Linking.openURL(downloadUrl)` immediately (do NOT store the URL in state)
- [ ] Show loading spinner on the tapped attachment's button while the API call is in flight
- [ ] Handle `ENROLLMENT_REQUIRED` (403) → toast "You need an approved enrolment to download attachments."
- [ ] Handle network error → toast "Download failed. Check your connection."

**`CourseDetailScreen.tsx` — subject completion ticks:**
- [ ] Add local state: `subjectProgress: Record<string, ApiSubjectProgress>`, `loadedSubjects: Set<string>`
- [ ] When a subject accordion is **expanded** for the first time: call `getSubjectProgress(subjectId)` → store result in `subjectProgress[subjectId]`
- [ ] Handle 404 from `getSubjectProgress` gracefully: treat as `state: 'not_started'`
- [ ] Show a green tick (✓) next to the subject title if `subjectProgress[id]?.state === 'completed'`

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/navigation/StudentTabs.tsx` — add `subjectId`, `courseId`, `semesterId` to `LessonPlayer` route params
- `src/screens/student/LessonPlayerScreen.tsx` — progress tracking + attachment download
- `src/screens/student/CourseDetailScreen.tsx` — subject completion ticks + pass IDs to navigator

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (`markSubjectComplete`, `updateLastAccessed`, `getSubjectProgress`, `getAttachmentDownloadUrl` exist)
- **Blocks:** Sprint 4 (edge case polish for these screens)
- **External:** Requires Firebase + backend for device testing; attachment download also requires approved enrollment

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] `LessonPlayerScreen` receives `subjectId`, `courseId`, `semesterId` from route params
- [ ] `updateLastAccessed` is called on mount (verify in Metro console/DebugPanel — tag `progress.access`)
- [ ] `markSubjectComplete` body contains both `courseId` and `semesterId` (verify in DebugPanel — tag `progress.complete`)
- [ ] Attachment download uses `Linking.openURL` immediately — no URL stored in state
- [ ] Subject completion tick appears after "Mark Complete" is tapped and confirmed by backend

---

## 🧪 Verification

```bash
npx tsc --noEmit
npx expo start --lan --clear
```

Manual test on device (requires Firebase + approved enrollment + backend):
- [ ] Open lesson player → `progress.access` appears in DebugPanel with `courseId` + `semesterId` in body
- [ ] Tap "Mark Complete" → `progress.complete` in DebugPanel with correct body → toast shown
- [ ] Attachment download button → browser opens with signed URL
- [ ] Check DebugPanel body for `progress.complete`: must contain `{ "courseId": "...", "semesterId": "..." }`

---

## 📝 Notes

- `updateLastAccessed` is a **fire-and-forget** call — do NOT await it in a way that blocks the UI. Use `.catch(() => {})` to swallow errors silently.
- `Linking` from `react-native` — import `{ Linking } from 'react-native'`. No extra package needed.
- The subject accordion in `CourseDetailScreen` currently calls `listLessons(subjectId)` lazily. Add `getSubjectProgress` to the same expand handler so both load together.
- `subjectId` in the course tree (from `getCourseById`) is `sub.id`. Pass this — plus `courseId` from the course, and `semesterId` from the semester — when navigating to `LessonPlayer`.

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

**Next:** [`sprint-04-edge-cases-polish.md`](./sprint-04-edge-cases-polish.md)
