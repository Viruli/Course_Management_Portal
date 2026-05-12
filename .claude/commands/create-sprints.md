---
name: create-sprints
description: Break down an implementation plan into individual sprint files
argument-hint: Plan slug, date prefix, or path (e.g. auth-signin | 2026-05-12 | .claude/_plan/2026-05-12-auth-signin.md)
allowed-tools: Read, Write, Glob, Bash
---

# Create Sprints from Implementation Plan (CMP Mobile)

Takes a plan from `.claude/_plan/` and explodes each phase into its own sprint markdown file under `.claude/_sprints/<plan-slug>/`. Designed for the CMP React Native / Expo frontend.

> Sprints in this project are **units of work, not git branches**. They live as markdown files on the existing feature branch (`feat/<slug>`). Do not create per-sprint git branches.

## Workflow

### Step 1: Resolve the Plan File

Parse `$ARGUMENTS`:
- **Full path** (`.claude/_plan/...md`) → use as-is
- **Plan slug** (`auth-signin`) → glob `.claude/_plan/*<slug>*.md`
- **Date prefix** (`2026-05-12`) → glob `.claude/_plan/<date>*.md`
- **No argument or no match** → list all files in `.claude/_plan/` and ask user to choose

If still ambiguous (multiple matches), ask the user to pick one.

### Step 2: Read the Plan
Read the plan file. Extract:
- Plan title (`# Implementation Plan: <Title>`)
- Linked spec (`**Spec:**`)
- Branch (`**Branch:**`)
- All `### Phase N: <Name>` sections and the checklist items under each
- Estimated effort if present

If the plan has no `### Phase` sections, stop:
```
❌ No phases found in the plan.
The plan must contain sections like:
  ### Phase 1: Service Layer
  ### Phase 2: State
Please update the plan first.
```

### Step 3: Derive Sprint Folder Name

From plan filename `YYYY-MM-DD-<slug>.md` → folder slug `<slug>`.
Folder path: `.claude/_sprints/<slug>/`

If the folder already exists:
```
⚠️  Sprint folder already exists: .claude/_sprints/<slug>/
Options:
  1. Append -v2 → .claude/_sprints/<slug>-v2/
  2. Overwrite (deletes existing sprint files)
  3. Abort
Choose (1/2/3):
```
Wait for the user to choose. Default to **Abort** if no response.

### Step 4: Confirm With User
Before writing anything, show:
```
About to create:
  Folder:  .claude/_sprints/<slug>/
  Sprints: <N>     (from plan phases)
  Plan:    .claude/_plan/<plan-file>.md
  Spec:    .claude/_specs/NNN-<slug>.md
  Branch:  <current branch from git rev-parse --abbrev-ref HEAD>

Files that will be created:
  - README.md                                (sprint index)
  - sprint-01-<phase1-slug>.md
  - sprint-02-<phase2-slug>.md
  - ...

Proceed? (y/n)
```
Wait for confirmation.

### Step 5: Create Folder
```bash
mkdir -p .claude/_sprints/<slug>
```

### Step 6: Write One Sprint File Per Phase

Filename: `sprint-NN-<phase-slug>.md`
- `NN` zero-padded 2-digit phase number
- `<phase-slug>` = kebab-case of the phase name, ≤ 40 chars

Each file follows this template verbatim:

```markdown
# Sprint <N>: <Phase Name>

**Plan:** [`.claude/_plan/<plan-file>.md`](../../_plan/<plan-file>.md)
**Spec:** [`.claude/_specs/NNN-<slug>.md`](../../_specs/NNN-<slug>.md)
**Branch:** `feat/<slug>`
**Status:** 🟡 Not Started
**Estimated:** <X hours> · **Actual:** ___
**Started:** ___ · **Completed:** ___

---

## 🎯 Sprint Goal
_One sentence: what this sprint delivers._

---

## 📋 Tasks
_Extracted from Phase <N> of the plan. Check off as you go._

- [ ] _TODO from plan_
- [ ] _TODO from plan_

---

## 📁 Files to Touch

**New:**
- `src/services/<file>.ts` — _TODO_

**Modified:**
- `src/screens/<area>/<Screen>.tsx` — _TODO_
- `src/store/<store>.ts` — _TODO_

**Deleted:**
- _TODO or "none"_

---

## 🔗 Dependencies
- **Requires:** Sprint <N-1> complete (or "none" for Sprint 1)
- **Blocks:**  Sprint <N+1>
- **External:** _TODO (e.g. backend running on http://192.168.x.x:3000, Expo Go installed)_

---

## ✅ Acceptance Criteria
- [ ] All tasks above checked off
- [ ] `npx tsc --noEmit` passes
- [ ] No new `console.error` introduced
- [ ] Mobile-specific criteria for this sprint: _TODO_

---

## 🧪 Verification
```bash
# Typecheck (only required gate)
npx tsc --noEmit

# Start Metro for manual testing
npx expo start --lan --clear
```

Manual test on device:
- [ ] _TODO — happy path_
- [ ] _TODO — at least one error path_

---

## 📝 Notes
_Sprint-specific gotchas, decisions, or context._

---

## 🐛 Issues Encountered
_Fill in as blockers come up. Delete the section if none._

| Issue | Resolution | Time lost |
|-------|------------|-----------|
|       |            |           |

---

## 📊 Retrospective
_Fill at the end of the sprint. Skip if not useful._

- **What went well:**
- **What could improve:**
- **Action items for next sprint:**

---

**Next:** [`sprint-<N+1>-<next-phase-slug>.md`](./sprint-<N+1>-<next-phase-slug>.md)
```

Fill checked-out fields from the plan where possible; leave `_TODO_` markers for anything you're uncertain about.

### Step 7: Write `README.md` (sprint index)

```markdown
# Sprints: <Plan Title>

**Plan:** [`.claude/_plan/<plan-file>.md`](../../_plan/<plan-file>.md)
**Spec:** [`.claude/_specs/NNN-<slug>.md`](../../_specs/NNN-<slug>.md)
**Branch:** `feat/<slug>`
**Created:** <YYYY-MM-DD>
**Sprints:** <N>

---

## 🏃 Overview

| # | Sprint | Status | Est. | Actual | Started | Done |
|---|--------|--------|------|--------|---------|------|
| 1 | <Phase 1 name> | 🟡 Not Started | <X>h | — | — | — |
| 2 | <Phase 2 name> | 🟡 Not Started | <X>h | — | — | — |

**Status legend:** 🟡 Not Started · 🔵 In Progress · 🟢 Complete · 🔴 Blocked · ⏸ Paused

---

## 📂 Sprint Files

1. [Sprint 1 — <Phase 1>](./sprint-01-<slug>.md)
2. [Sprint 2 — <Phase 2>](./sprint-02-<slug>.md)
...

---

## 🎯 Current Sprint
**Active:** Sprint 1 — <Phase 1 name>
**Progress:** 0 / <total tasks> tasks (0%)

---

## 🔍 Finding the next sprint

Open the next file whose status is 🟡 or 🔵:

```bash
# Git Bash / WSL
grep -l "🟡 Not Started\|🔵 In Progress" .claude/_sprints/<slug>/sprint-*.md | head -1
```

```powershell
# PowerShell
Select-String -Path .claude/_sprints/<slug>/sprint-*.md -Pattern "🟡 Not Started|🔵 In Progress" -List | Select-Object -First 1
```

---

## ✅ Closing the loop
When all sprints are 🟢:
1. Update the plan's status to 🟢 Complete.
2. Update the spec's status to `shipped`.
3. Open a PR for `feat/<slug>` into `main`.
4. Reference this sprint folder and the spec in the PR description.
```

### Step 8: Report

```
✅ Sprints created.

Folder:  .claude/_sprints/<slug>/
Plan:    .claude/_plan/<plan-file>.md
Spec:    .claude/_specs/NNN-<slug>.md
Branch:  feat/<slug>
Sprints: <N>

Files written:
  - README.md
  - sprint-01-<phase1-slug>.md
  - sprint-02-<phase2-slug>.md
  ...

Next:
  1. Open .claude/_sprints/<slug>/README.md and skim.
  2. Start Sprint 1, flip its status to 🔵 In Progress.
  3. Check off tasks as you complete them.
  4. When done with a sprint, flip to 🟢 and move to the next.
  5. When all 🟢, follow the closing-the-loop steps in the README.
```

Do **not** auto-commit the new files.

## Errors

| Issue | Action |
|-------|--------|
| `$ARGUMENTS` empty | List `.claude/_plan/*.md`, ask user to choose |
| Plan file not found | Show available plans, ask user to pick |
| No `### Phase` sections in plan | Stop with the message in Step 2 |
| Sprint folder already exists | Ask user (Append -v2 / Overwrite / Abort) |
| User answers `n` to confirmation | Abort cleanly, no files written |

## Example

Input:
```
/create-sprints auth-signin
```

Output:
```
About to create:
  Folder:  .claude/_sprints/auth-signin/
  Sprints: 5
  Plan:    .claude/_plan/2026-05-12-auth-signin.md
  Spec:    .claude/_specs/002-auth-signin.md
  Branch:  feat/auth-signin

Files that will be created:
  - README.md
  - sprint-01-service-layer.md
  - sprint-02-state.md
  - sprint-03-ui-wiring.md
  - sprint-04-edge-cases.md
  - sprint-05-manual-test.md

Proceed? (y/n)

[after y]

✅ Sprints created.
Folder:  .claude/_sprints/auth-signin/
Sprints: 5
```

---

## Pipeline Recap

```
/feature-spec <paragraph>
   → .claude/_specs/NNN-<slug>.md      (+ creates feat/<slug>)

/create-plan <slug>
   → .claude/_plan/YYYY-MM-DD-<slug>.md (after Claude proposes a plan in chat)

/create-sprints <slug>
   → .claude/_sprints/<slug>/sprint-NN-*.md  (one file per phase)
```

Each step happens **on the same feature branch**. Sprints do not create new branches.

---
v1.0.0
