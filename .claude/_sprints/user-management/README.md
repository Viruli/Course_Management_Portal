# Sprints: User Management, Admin Management and Audit Log Integration

**Plan:** [`.claude/_plan/2026-05-13-user-management.md`](../../_plan/2026-05-13-user-management.md)
**Spec:** [`.claude/_specs/007-user-management.md`](../../_specs/007-user-management.md)
**Branch:** `feat/user-management`
**Created:** 2026-05-13
**Sprints:** 6

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 1 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 2 | User Management UI | 🟢 Complete | 2 h | ~45 min | 2026-05-13 | 2026-05-13 |
| 3 | Admin Management UI | 🟢 Complete | 1–2 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 4 | Audit Log UI | 🟢 Complete | 1–2 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 5 | Edge Cases & Polish | 🟢 Complete | 1 h | ~10 min | 2026-05-13 | 2026-05-13 |
| 6 | Manual Test on Device | 🔴 Blocked | 1–2 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 7–10 h · Sprints 1–5 can be completed without the backend.

---

## ⚠️ API Compatibility Notes

| Rule | Sprint |
|---|---|
| `reactivateUser` and `reactivateAdmin` send **no body** | Sprint 1 |
| `suspendUser`/`suspendAdmin` only send `reason` when non-empty | Sprint 1 |
| `deleteAdmin` returns `204 No Content` → `ApiResult<undefined>` | Sprint 1 |
| Audit `actor` is `{ uid, email }` object — display `actor?.email ?? 'System'` | Sprints 1 + 4 |
| Audit timestamp field is `when` (not `createdAt`) | Sprint 4 |
| Filter pills map to `category` API param, not `tone` | Sprint 4 |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — User Management UI](./sprint-02-user-management-ui.md)
3. [Sprint 3 — Admin Management UI](./sprint-03-admin-management-ui.md)
4. [Sprint 4 — Audit Log UI](./sprint-04-audit-log-ui.md)
5. [Sprint 5 — Edge Cases & Polish](./sprint-05-edge-cases-polish.md)
6. [Sprint 6 — Manual Test on Device](./sprint-06-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 6 — Manual Test on Device 🔴 Blocked (needs backend + admin/super admin)
**Progress:** 5 / 6 sprints complete

---

## 🔍 Finding the next sprint

```bash
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/user-management/sprint-*.md | head -1
```

```powershell
Select-String -Path .claude/_sprints/user-management/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-user-management.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/007-user-management.md` → **Status: shipped**
3. Push `feat/user-management` and open PR into `main`
4. Reference spec + sprint folder in the PR description
