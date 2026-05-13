# Sprints: Auth Sign-In, Logout and Token Management

**Plan:** [`.claude/_plan/2026-05-13-auth-signin-logout.md`](../../_plan/2026-05-13-auth-signin-logout.md)
**Spec:** [`.claude/_specs/001-auth-signin-logout.md`](../../_specs/001-auth-signin-logout.md)
**Branch:** `feat/auth-signin-logout`
**Created:** 2026-05-13
**Sprints:** 6

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Foundation — Firebase SDK + Service Layer | 🟢 Complete | 3–4 h | ~1 h | 2026-05-13 | 2026-05-13 |
| 2 | State | 🟢 Complete | 1 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 3 | UI Wiring — Sign-In | 🟢 Complete | 2–3 h | ~45 min | 2026-05-13 | 2026-05-13 |
| 4 | UI Wiring — Logout | 🟢 Complete | 1–2 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 5 | Edge Cases & Polish | 🟢 Complete | 1–2 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 6 | Manual Test on Device | 🔴 Blocked | 1–2 h | — | 2026-05-13 | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 9–14 h

---

## 📂 Sprint Files

1. [Sprint 1 — Foundation: Firebase SDK + Service Layer](./sprint-01-foundation-firebase-sdk-service-layer.md)
2. [Sprint 2 — State](./sprint-02-state.md)
3. [Sprint 3 — UI Wiring: Sign-In](./sprint-03-ui-wiring-sign-in.md)
4. [Sprint 4 — UI Wiring: Logout](./sprint-04-ui-wiring-logout.md)
5. [Sprint 5 — Edge Cases & Polish](./sprint-05-edge-cases-polish.md)
6. [Sprint 6 — Manual Test on Device](./sprint-06-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 6 — Manual Test on Device 🔴 Blocked (Firebase config pending)
**Progress:** 5 / 6 sprints complete · Sprint 6 blocked on Firebase config

---

## ⚠️ Known Blocker
Sprint 6 (and partial Sprint 1 testing) requires the **Firebase project config** from the backend team. Code can be fully written with placeholder env vars — only end-to-end device testing is blocked.

---

## 🔍 Finding the next sprint

```bash
# Git Bash / WSL
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/auth-signin-logout/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/auth-signin-logout/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. Update `.claude/_plan/2026-05-13-auth-signin-logout.md` → **Status: 🟢 Complete**
2. Update `.claude/_specs/001-auth-signin-logout.md` → **Status: shipped**
3. Push `feat/auth-signin-logout` and open PR into `main`
4. Reference this sprint folder and the spec in the PR description
