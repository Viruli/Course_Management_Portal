# Sprint 5: Lesson Editor — Lesson & Attachment CRUD

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Status:** 🟢 Complete
**Estimated:** 3 h · **Actual:** ~45 min
**Started:** 2026-05-13 · **Completed:** 2026-05-13

---

## 🎯 Sprint Goal
Wire all lesson and attachment mutations in `LessonEditorScreen` to the real API; rename `youtubeUrl` → `url`; implement multipart file upload.

---

## 📋 Tasks

**Rename `youtubeUrl` → `url`:**
- [ ] Update `BuilderLesson.youtubeUrl` → `BuilderLesson.url` in `src/data/types.ts`
- [ ] Update all references in `courseBuilderStore.ts` (emptyLesson, addLesson, updateLesson)
- [ ] Update all references in `LessonEditorScreen.tsx`
- [ ] Update UI label from "YouTube URL" → "Video URL" and hint from "YouTube link" → "Any video URL (YouTube, Vimeo, etc.)"

**Lesson CRUD in `LessonEditorScreen`:**
- [ ] **Add Lesson** → `createLesson(subjectId, { title, url, description? })`:
  - `subjectId` comes from the route params or `courseBuilderStore` active subject
  - On success: `courseBuilderStore.addLesson()` with real `lessonId` and server-assigned `order`
  - Loading state on Add button
- [ ] **Update Lesson** → `updateLesson(lessonId, patch)` on save
- [ ] **Delete Lesson** → confirmation → `deleteLesson(lessonId)` → `courseBuilderStore.removeLesson()`

**Attachment CRUD:**
- [ ] **Upload attachment** button:
  1. Call `DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] })`
  2. Client-side validation:
     - File extension/mimeType must be PDF, DOC, or DOCX → toast "Only PDF, DOC, and DOCX files are accepted."
     - File size ≤ 25 MB → toast "File exceeds the 25 MB limit."
  3. Call `uploadAttachment(subjectId, { uri: result.uri, name: result.name, type: result.mimeType })`
  4. Note: `uploadAttachment` must build a `FormData` and call `fetch` directly (not `apiFetch`) since it's `multipart/form-data`; attach the Firebase token manually via `getAuthToken()`
  5. On success: `courseBuilderStore.addAttachment()` with returned `ApiAttachment`
  6. Show loading indicator on the upload button during upload

- [ ] **Delete attachment** → `deleteAttachment(id)` → `courseBuilderStore.removeAttachment()`

---

## 📁 Files to Touch

**New:** none

**Modified:**
- `src/data/types.ts` — `BuilderLesson.youtubeUrl` → `url`
- `src/store/courseBuilderStore.ts` — rename field, update addLesson to accept real `lessonId`
- `src/screens/admin/LessonEditorScreen.tsx` — wire all lesson + attachment CRUD

**Deleted:** none

---

## 🔗 Dependencies
- **Requires:** Sprint 1 (subjects.ts + attachments.ts) + Sprint 4 (real `subjectId` in store)
- **Blocks:** Sprint 6 (edge-case polish for lesson editor)
- **External:** Requires authenticated admin session (Firebase + backend)

---

## ✅ Acceptance Criteria
- [ ] All tasks checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No `youtubeUrl` reference remains anywhere in the codebase
- [ ] Video URL input labeled "Video URL" and accepts any URL (not just YouTube)
- [ ] Attachment upload uses `FormData` with field name `file`
- [ ] File type validation rejects non-PDF/DOC/DOCX before calling the API
- [ ] File size validation rejects > 25 MB before calling the API
- [ ] Upload loading indicator shown during multipart request

---

## 🧪 Verification

```bash
npx tsc --noEmit

# Confirm no youtubeUrl references remain
grep -rn "youtubeUrl" src/ 2>&1 || echo "CLEAN"
```

Manual test on device (requires Firebase auth + backend):
- [ ] Add lesson with any video URL → lesson appears in list
- [ ] Upload PDF → appears in attachment list
- [ ] Try uploading a .jpg → error toast shown, no upload
- [ ] Delete attachment → removed from list

---

## 📝 Notes

- `expo-document-picker` was installed in Sprint 1. Use `DocumentPicker.getDocumentAsync()` from `expo-document-picker`.
- The `uploadAttachment` function in `attachments.ts` cannot use `apiFetch` because `apiFetch` always sends `Content-Type: application/json`. Use native `fetch` with `FormData` and manually set the `Authorization` header:
  ```ts
  const token = await getAuthToken();
  const form = new FormData();
  form.append('file', { uri, name, type } as any);
  await fetch(`${BASE_URL}/subjects/${subjectId}/attachments`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  ```
- `courseBuilderStore.addLesson()` currently generates a local ID. After this sprint it must accept the real server-assigned `lessonId` and `order` from the API response.

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

**Next:** [`sprint-06-edge-cases-polish.md`](./sprint-06-edge-cases-polish.md)
