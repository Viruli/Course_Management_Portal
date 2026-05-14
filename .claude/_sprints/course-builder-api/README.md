# Sprints: Course Builder and Catalog API Integration

**Plan:** [`.claude/_plan/2026-05-13-course-builder-api.md`](../../_plan/2026-05-13-course-builder-api.md)
**Spec:** [`.claude/_specs/004-course-builder-api.md`](../../_specs/004-course-builder-api.md)
**Branch:** `feat/course-builder-api`
**Created:** 2026-05-13
**Sprints:** 7

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 2 h | ~40 min | 2026-05-13 | 2026-05-13 |
| 2 | Student Course Catalog | 🟢 Complete | 2 h | ~45 min | 2026-05-13 | 2026-05-13 |
| 3 | Admin Course List | 🟢 Complete | 2–3 h | ~1 h | 2026-05-13 | 2026-05-13 |
| 4 | Course Builder: Semester & Subject CRUD | 🟢 Complete | 3 h | ~1 h | 2026-05-13 | 2026-05-13 |
| 5 | Lesson Editor: Lesson & Attachment CRUD | 🟢 Complete | 3 h | ~45 min | 2026-05-13 | 2026-05-13 |
| 6 | Edge Cases & Polish | 🟢 Complete | 1–2 h | ~15 min | 2026-05-13 | 2026-05-13 |
| 7 | Manual Test on Device | 🔴 Blocked | 2 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 15–17 h · Sprints 1–6 can be completed without the backend running.

---

## ⚠️ API Compatibility Notes

| Rule | Sprint |
|---|---|
| `POST /courses` body: `{ title, description, coverImageUrl? }` — no `type` field | Sprints 1 + 3 |
| `POST /semesters/:id/subjects` body: `youtubeVideoUrl` (full URL, not 11-char ID) | Sprints 1 + 4 |
| `POST /subjects/:id/lessons` body: `url` (any video URL, not `youtubeUrl`) | Sprints 1 + 5 |
| `BuilderLesson.youtubeUrl` → `url` renamed throughout codebase | Sprint 5 |
| Attachment upload: `multipart/form-data`, field name `file`, via native `fetch` (not `apiFetch`) | Sprints 1 + 5 |
| `GET /courses` is public — Sprint 2 testable without Firebase auth | Sprint 2 |
| `courseBuilderStore.addSemester`/`addSubject`/`addLesson` accept real server IDs, not local `uid()` | Sprints 3 + 4 + 5 |
| CourseType picker removed from builder UI | Sprint 4 |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — Student Course Catalog](./sprint-02-student-course-catalog.md)
3. [Sprint 3 — Admin Course List](./sprint-03-admin-course-list.md)
4. [Sprint 4 — Course Builder: Semester & Subject CRUD](./sprint-04-course-builder-semester-subject-crud.md)
5. [Sprint 5 — Lesson Editor: Lesson & Attachment CRUD](./sprint-05-lesson-editor-lesson-attachment-crud.md)
6. [Sprint 6 — Edge Cases & Polish](./sprint-06-edge-cases-polish.md)
7. [Sprint 7 — Manual Test on Device](./sprint-07-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 7 — Manual Test on Device 🔴 Blocked (backend + Firebase pending)
**Progress:** 6 / 7 sprints complete

---

## 🔍 Finding the next sprint

```bash
# Git Bash / WSL
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/course-builder-api/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/course-builder-api/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-course-builder-api.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/004-course-builder-api.md` → **Status: shipped**
3. Push `feat/course-builder-api` and open PR into `main`
4. Reference spec + sprint folder in the PR description
