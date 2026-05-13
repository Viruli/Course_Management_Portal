# Sprints: Profile Management, Password Reset and Admin Creation

**Plan:** [`.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md`](../../_plan/2026-05-13-profile-mgmt-password-reset-admin.md)
**Spec:** [`.claude/_specs/002-profile-mgmt-password-reset-admin.md`](../../_specs/002-profile-mgmt-password-reset-admin.md)
**Branch:** `feat/profile-mgmt-password-reset-admin`
**Created:** 2026-05-13
**Sprints:** 7

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 1–2 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 2 | Profile Display — Real Data | 🟢 Complete | 1 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 3 | Edit Profile + Change Password | 🟢 Complete | 2 h | ~40 min | 2026-05-13 | 2026-05-13 |
| 4 | Password Reset Flow | 🟢 Complete | 1–2 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 5 | Super Admin: Create Admin + Promote | 🟢 Complete | 2–3 h | ~1 h | 2026-05-13 | 2026-05-13 |
| 6 | Edge Cases & Polish | 🟢 Complete | 1 h | ~15 min | 2026-05-13 | 2026-05-13 |
| 7 | Manual Test on Device | 🔴 Blocked | 1–2 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 9–13 h · Sprints 1–6 can be completed without a running backend.

---

## ⚠️ API Compatibility Notes
These decisions are baked into the sprint tasks to prevent backend integration issues:

| Rule | Sprint where enforced |
|---|---|
| `PATCH /me` body = `{ firstName?, lastName? }` only (no photo URL) | Sprint 1 + Sprint 3 |
| `POST /me/change-password` body = `{ newPassword }` only — no `currentPassword` | Sprint 1 + Sprint 3 |
| Password validation = 10+ chars + upper/lower/number/special (API policy) | Sprint 3 |
| `POST /auth/password-reset` always returns 200 — no enum attack | Sprint 4 |
| `initialPassword` redacted in DebugPanel logs | Sprint 1 |
| `createAdmin` vs `promoteToAdmin` are two distinct endpoints — never conflated | Sprint 5 |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — Profile Display: Real Data](./sprint-02-profile-display-real-data.md)
3. [Sprint 3 — Edit Profile + Change Password](./sprint-03-edit-profile-change-password.md)
4. [Sprint 4 — Password Reset Flow](./sprint-04-password-reset-flow.md)
5. [Sprint 5 — Super Admin: Create Admin + Promote](./sprint-05-super-admin-create-admin-promote.md)
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
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/profile-mgmt-password-reset-admin/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/profile-mgmt-password-reset-admin/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-profile-mgmt-password-reset-admin.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/002-profile-mgmt-password-reset-admin.md` → **Status: shipped**
3. Push `feat/profile-mgmt-password-reset-admin` and open PR into `main`
4. Reference spec + sprint folder in the PR description
