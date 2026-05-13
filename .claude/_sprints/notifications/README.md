# Sprints: Notifications API Integration

**Plan:** [`.claude/_plan/2026-05-13-notifications.md`](../../_plan/2026-05-13-notifications.md)
**Spec:** [`.claude/_specs/006-notifications.md`](../../_specs/006-notifications.md)
**Branch:** `feat/notifications`
**Created:** 2026-05-13
**Sprints:** 5

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | Service Layer | 🟢 Complete | 30 min | ~10 min | 2026-05-13 | 2026-05-13 |
| 2 | Store Update | 🟢 Complete | 1 h | ~30 min | 2026-05-13 | 2026-05-13 |
| 3 | UI Wiring + Debug Panels | 🟢 Complete | 1–2 h | ~20 min | 2026-05-13 | 2026-05-13 |
| 4 | Edge Cases & Polish | 🟢 Complete | 30 min | ~10 min | 2026-05-13 | 2026-05-13 |
| 5 | Manual Test on Device | 🔴 Blocked | 1 h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

**Total estimate:** 4–5 h · Sprints 1–4 can be completed without the backend.

---

## ⚠️ API Compatibility Notes

| Rule | Sprint |
|---|---|
| `markNotificationRead` — **no body** sent | Sprint 1 |
| `markAllNotificationsRead` — **no body** sent | Sprint 1 |
| `readAt === null` = unread (NOT boolean `!item.read`) | Sprints 2 + 3 |
| Single `items[]` — no `byAudience` split | Sprint 2 |
| `loaded` flag prevents duplicate fetches | Sprint 2 |
| DebugPanel **must be removed** before final PR merge | Sprint 5 note |

---

## 📂 Sprint Files

1. [Sprint 1 — Service Layer](./sprint-01-service-layer.md)
2. [Sprint 2 — Store Update](./sprint-02-store-update.md)
3. [Sprint 3 — UI Wiring + Debug Panels](./sprint-03-ui-wiring-debug-panels.md)
4. [Sprint 4 — Edge Cases & Polish](./sprint-04-edge-cases-polish.md)
5. [Sprint 5 — Manual Test on Device](./sprint-05-manual-test-on-device.md)

---

## 🎯 Current Sprint
**Active:** Sprint 5 — Manual Test on Device 🔴 Blocked (needs backend + notifications generated)
**Progress:** 4 / 5 sprints complete

---

## 🔍 Finding the next sprint

```bash
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/notifications/sprint-*.md | head -1
```

```powershell
Select-String -Path .claude/_sprints/notifications/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the Loop
When all sprints are 🟢:
1. **Remove DebugPanel from `NotificationsScreen.tsx`** (tagged `// DEBUG — remove before PR`)
2. Update `.claude/_plan/2026-05-13-notifications.md` → **Status: 🟢 Complete**
3. Update `.claude/_specs/006-notifications.md` → **Status: shipped**
4. Push `feat/notifications` and open PR into `main`
5. Reference spec + sprint folder in the PR description
