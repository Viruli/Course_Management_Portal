# Sprints: Student Enrollment, Progress Tracking and Attachment Downloads

**Plan:** [`.claude/_plan/2026-05-13-student-learning.md`](../../_plan/2026-05-13-student-learning.md)
**Spec:** [`.claude/_specs/005-student-learning.md`](../../_specs/005-student-learning.md)
**Branch:** `feat/student-learning`
**Created:** 2026-05-13
**Sprints:** 5

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 1 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 2 | UI Wiring — Enrollment | 🟢 Complete | 2 h | ~45 min | 2026-05-13 | 2026-05-13 |
| 3 | UI Wiring — Progress + Lesson Player | 🟢 Complete | 2–3 h | ~40 min | 2026-05-13 | 2026-05-13 |
| 4 | Edge Cases & Polish | 🟢 Complete | 1 h | ~15 min | 2026-05-13 | 2026-05-13 |
| 5 | Manual Test on Device | 🔴 Blocked | 2 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 8–9 h · Sprints 1–4 can be completed without the backend running.

---

## ⚠️ API Compatibility Notes

| Rule | Sprint |
|---|---|
| `POST /progress/subjects/:id/complete` body = `{ courseId, semesterId }` — BOTH required | Sprints 1 + 3 |
| `POST /progress/subjects/:id/access` — same, both required | Sprints 1 + 3 |
| `POST /courses/:id/enroll` — no body sent | Sprint 1 |
| `POST /enrollments/:id/withdraw` — no body sent | Sprint 1 |
| Attachment `downloadUrl` expires in 15 min — call `Linking.openURL` immediately, never cache | Sprint 3 |
| `getSubjectProgress` returns 404 if not yet accessed — treat as `not_started`, not an error | Sprint 3 + 4 |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — UI Wiring: Enrollment](./sprint-02-ui-wiring-enrollment.md)
3. [Sprint 3 — UI Wiring: Progress + Lesson Player](./sprint-03-ui-wiring-progress-lesson-player.md)
4. [Sprint 4 — Edge Cases & Polish](./sprint-04-edge-cases-polish.md)
5. [Sprint 5 — Manual Test on Device](./sprint-05-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 5 — Manual Test on Device 🔴 Blocked (needs approved enrollment + backend)
**Progress:** 4 / 5 sprints complete

---

## 🔍 Finding the next sprint

```bash
# Git Bash / WSL
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/student-learning/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/student-learning/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-student-learning.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/005-student-learning.md` → **Status: shipped**
3. Push `feat/student-learning` and open PR into `main`
4. Reference spec + sprint folder in the PR description
