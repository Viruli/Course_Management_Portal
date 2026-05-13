# Sprints: Admin Registration and Enrollment Queue Integration

**Plan:** [`.claude/_plan/2026-05-13-admin-queues.md`](../../_plan/2026-05-13-admin-queues.md)
**Spec:** [`.claude/_specs/003-admin-queues.md`](../../_specs/003-admin-queues.md)
**Branch:** `feat/admin-queues`
**Created:** 2026-05-13
**Sprints:** 6

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 1 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 2 | Store Update | 🟢 Complete | 1–2 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 3 | UI Wiring — RegistrationsScreen | 🟢 Complete | 2 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 4 | UI Wiring — EnrolmentsScreen + Modal | 🟢 Complete | 2 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 5 | Edge Cases & Polish | 🟢 Complete | 1 h | ~10 min | 2026-05-13 | 2026-05-13 |
| 6 | Manual Test on Device | 🔴 Blocked | 1–2 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 8–10 h · Sprints 1–5 can be completed without a running backend.

---

## ⚠️ API Compatibility Notes

| Rule | Sprint |
|---|---|
| `rejectRegistration` / `rejectEnrollment` only include `reason` when non-empty — never `{ "reason": "" }` | Sprint 1 |
| `bulkApproveRegistrations` body: `{ "registrationIds": [...] }` exactly | Sprint 1 |
| `ApiRegistration` / `ApiAdminEnrollment` types defined in service files — not from `data/types.ts` | Sprint 1 |
| Pessimistic updates — list only changes after successful API response | Sprint 2 |
| "Approve all enrollments" loops individual calls (no batch enrollment endpoint) | Sprint 2 |
| "Note" button removed from `EnrolmentsScreen` (no API endpoint exists) | Sprint 4 |
| Both admin and super_admin use identical queue endpoints | No UI change needed |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — Store Update](./sprint-02-store-update.md)
3. [Sprint 3 — UI Wiring: RegistrationsScreen](./sprint-03-ui-wiring-registrations.md)
4. [Sprint 4 — UI Wiring: EnrolmentsScreen + RejectReasonModal](./sprint-04-ui-wiring-enrolments-modal.md)
5. [Sprint 5 — Edge Cases & Polish](./sprint-05-edge-cases-polish.md)
6. [Sprint 6 — Manual Test on Device](./sprint-06-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 6 — Manual Test on Device 🔴 Blocked (backend + Firebase pending)
**Progress:** 5 / 6 sprints complete

---

## 🔍 Finding the next sprint

```bash
# Git Bash / WSL
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/admin-queues/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/admin-queues/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-admin-queues.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/003-admin-queues.md` → **Status: shipped**
3. Push `feat/admin-queues` and open PR into `main`
4. Reference spec + sprint folder in the PR description
