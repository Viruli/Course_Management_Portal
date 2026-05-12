# <Title>

**Spec ID:** NNN-<slug>
**Branch:** `feat/<slug>`
**Status:** draft | in-progress | shipped
**Created:** YYYY-MM-DD

---

## Overview
_One short paragraph: what this feature delivers and why it exists._

## User Stories
- As a **<role>**, I want **<goal>**, so that **<benefit>**.

## API Contract
_Reference: API Reference §X.X — `<METHOD /path>`_

- **Endpoint:** `METHOD /path`
- **Auth:** none | bearer (role)
- **Request body:**
  ```json
  { ... }
  ```
- **Success response:** `2xx`
  ```json
  { ... }
  ```
- **Error codes handled:**
  - `CODE_1` → behaviour
  - `CODE_2` → behaviour

## Screens / Navigation
- **New screens:** _TODO_
- **Modified screens:** _TODO_
- **Navigation changes:** _TODO_

## State / Stores
- **Stores touched:** _TODO (e.g. appStore, profileStore)_
- **New state:** _TODO_
- **Server data caching strategy:** local / Zustand / TanStack Query (?)

## UI States
- **Loading:** _TODO_
- **Empty:** _TODO_
- **Error:** _TODO_
- **Offline / network failure:** _TODO_

## Functional Requirements
- [ ] _TODO_

## Non-Functional Requirements
- [ ] **Performance** — 60 fps on lists, no jank when navigating
- [ ] **Accessibility** — touch targets ≥ 44pt, works in dark mode, screen-reader labels
- [ ] **Security** — token handled per project policy, no secrets logged
- [ ] **Offline behaviour** — graceful degradation when network fails

## Acceptance Criteria
- [ ] _Testable criterion_

## Mock vs Real
- **Replaces mock:** _TODO (which mock data this feature unhooks)_
- **Still mocked:** _TODO_

## Out of Scope
- _TODO_

## Definition of Done
- [ ] Spec doc updated (Status → shipped)
- [ ] API call wired through `src/services/`
- [ ] Loading + error states implemented
- [ ] Empty / edge cases handled
- [ ] `npx tsc --noEmit` passes
- [ ] Manual test on phone via Expo Go (happy path + 1 error path)
- [ ] No `console.error`, no leftover `toast.info('… coming soon')` on the touched flow
- [ ] PR description references this spec

## References Used
- `CLAUDE.md`
- `.claude/Blueprint/blueprint_mobile.md`
- API Reference §X.X
