# Sprint 7: Manual Test on Device

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🔵 In Progress
**Estimated:** 2 h · **Actual:** ___
**Started:** 2026-05-14 · **Completed:** ___

---

## 🎯 Sprint Goal
Confirm the full course lifecycle works end-to-end on a real device — student catalog browsing, admin course creation, builder, and lesson editor with attachments.

> ⚠️ Requires Firebase config in `.env` + backend running at `http://192.168.1.136:3000/api/v1`.

---

## 📋 Tasks

**Pre-flight:**
- [ ] Confirm `.env` has real `EXPO_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_API_BASE_URL`
- [ ] `npx expo start --lan --clear`

**Student catalog (no auth required):**
- [ ] Browse screen loads real published courses without signing in
- [ ] Tap a course → detail shows real semesters + subjects with videos
- [ ] Expand a subject → lessons load

**Admin course management:**
- [ ] Sign in as admin → Courses tab → Published tab shows real courses
- [ ] Draft tab shows draft courses; Archived tab shows archived
- [ ] Tap "+" → Create course modal → fill title + description → submit → course appears in Drafts
- [ ] Tap the new draft course → Open builder

**Course builder:**
- [ ] Add semester → semester appears in list
- [ ] Add subject with a valid YouTube URL → subject appears under semester
- [ ] Add subject with an invalid YouTube URL → inline error shown
- [ ] Open lesson editor → add lesson with any video URL → lesson appears
- [ ] Upload a PDF attachment → attachment appears in lesson
- [ ] Try uploading a .jpg → error toast shown, no upload happens
- [ ] Delete the attachment → removed
- [ ] Delete the lesson → removed
- [ ] Back to builder → Publish the course → success toast

**Lifecycle actions:**
- [ ] Published course 3-dot → Unpublish → moves to Draft tab
- [ ] Draft course 3-dot → Archive → moves to Archived tab
- [ ] Draft course 3-dot → Delete → confirmation → removed from list

**Error paths:**
- [ ] Publish empty course (no semesters) → specific error toast
- [ ] Publish course with empty semester (no subjects) → specific error toast
- [ ] Create course with duplicate title → inline error

**Dark mode:**
- [ ] Toggle dark mode during browse, detail, builder, lesson editor → all themed correctly

**Final:**
- [ ] `npx tsc --noEmit` — passes clean
- [ ] No `console.error` in Metro during any test

---

## 📁 Files to Touch

**New / Modified / Deleted:** none (test sprint only)

---

## 🔗 Dependencies
- **Requires:** Sprints 1–6 all 🟢 Complete
- **External:** Firebase config + backend running

---

## ✅ Acceptance Criteria
- [ ] All manual test tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `console.error` in Metro
- [ ] `POST /courses` body verified in DebugPanel: no `type` field
- [ ] `POST /subjects/:id/lessons` body: `url` field (not `youtubeUrl`)
- [ ] Attachment upload field: `file` in FormData

---

## 📝 Notes

- If Firebase config is not available, sprint can be partially run: student browse + course detail can be tested without auth (`GET /courses` is public). Mark partial tests as ✅ and leave auth-dependent tests as 🔴 Blocked.
- Use `<DebugPanel tags={['courses.create', 'courses.publish', 'subjects.create', 'lessons.create']} />` temporarily to inspect request bodies.

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

## ✅ Closing the Loop
When this sprint is 🟢:
1. Update `.claude/_plan/2026-05-13-course-builder-api.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/004-course-builder-api.md` → **Status: shipped**
3. Push `feat/course-builder-api` and open PR into `main`
4. Reference spec + sprint folder in the PR description
