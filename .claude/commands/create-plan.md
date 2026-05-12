---
name: create-plan
description: Save Claude's implementation plan to a markdown file in .claude/_plan/
argument-hint: Brief description of the plan (or the spec ID it implements)
allowed-tools: Read, Write, Glob, Bash
---

# Save Implementation Plan (CMP Mobile)

Captures the implementation plan Claude has produced in the current conversation as a versioned markdown file under `.claude/_plan/`. Designed for the CMP React Native / Expo frontend — each plan implements a spec from `.claude/_specs/`.

## Workflow

### Step 1: Ensure Directory Exists
```bash
mkdir -p .claude/_plan
```

### Step 2: Identify the Plan in the Conversation
Scan the conversation for the most recent implementation plan. A valid plan contains at least:
- **Context** (what feature, what spec)
- **Design Decisions** (table or list)
- **Implementation Steps** (broken into phases)
- **Key Files** (paths affected)
- **Verification** (how we'll know it's done)

If no such plan exists in the conversation, stop and tell the user:
```
❌ No implementation plan found in this conversation.
Ask Claude to draft a plan first, then run /create-plan again.
```

### Step 3: Resolve the Spec
From `$ARGUMENTS` or the conversation, identify which spec this plan implements:
- Look for an explicit spec ID (e.g. `001-auth-register`)
- Or search `.claude/_specs/` for a slug that matches the feature name
- If ambiguous, ask the user which spec this plan is for

### Step 4: Generate Filename
- **Format:** `YYYY-MM-DD-<slug>.md`
- **Date:** today's date (ISO)
- **Slug:** kebab-case, lowercase, `a-z0-9-`, ≤ 50 chars
- **Example:** `2026-05-12-auth-signin.md`

If the filename already exists, append `-v2`, `-v3`, … until unique.

### Step 5: Confirm With User
Before writing, show:
```
About to write:
  File:   .claude/_plan/YYYY-MM-DD-<slug>.md
  Spec:   .claude/_specs/NNN-<slug>.md
  Branch: <current branch from git rev-parse --abbrev-ref HEAD>

Proceed? (y/n)
```
Wait for confirmation.

### Step 6: Format Content
Use the template below verbatim. Fill from the conversation; mark anything missing with `_TODO_`.

```markdown
# Implementation Plan: <Title>

**Spec:** [`.claude/_specs/NNN-<slug>.md`](../_specs/NNN-<slug>.md)
**Branch:** `feat/<slug>`
**Created:** <YYYY-MM-DD>
**Status:** 🟡 Draft
**Estimated effort:** <X days / hours>

---

## 📋 Context
_Why this work exists. Link to the spec, the API doc section, and any related decisions._

- **Spec:** NNN-<slug>
- **API Reference:** §X.X — `<METHOD /path>`
- **Replaces mock:** _TODO_

---

## 🎯 Design Decisions

| # | Decision | Rationale | Affects |
|---|----------|-----------|---------|
| 1 | _TODO_ | _TODO_ | _TODO_ |

_Examples of decisions worth recording: which store owns the data, optimistic vs pessimistic update, how to handle token refresh, fallback behaviour on offline, etc._

---

## 🚀 Implementation Steps

### Phase 1: Service Layer (`src/services/`)
- [ ] _TODO_ — e.g. add `loginWithEmail()` in `src/services/auth.ts`
- [ ] _TODO_ — typed request/response interfaces

### Phase 2: State (`src/store/`)
- [ ] _TODO_ — e.g. update `appStore` to hold the auth token
- [ ] _TODO_ — persistence (AsyncStorage / SecureStore) if required

### Phase 3: UI Wiring (`src/screens/` & `src/components/`)
- [ ] _TODO_ — wire the service call from the screen
- [ ] _TODO_ — loading state on the submit button
- [ ] _TODO_ — error toast / inline error display

### Phase 4: Edge Cases & Polish
- [ ] _TODO_ — empty state
- [ ] _TODO_ — offline / network failure
- [ ] _TODO_ — dark mode check

### Phase 5: Manual Test on Device
- [ ] _TODO_ — happy path
- [ ] _TODO_ — at least one error path
- [ ] _TODO_ — works on Android via Expo Go

---

## 📁 Key Files

| File | Change | Notes |
|------|--------|-------|
| `src/services/<name>.ts` | new / modified | _TODO_ |
| `src/store/<store>.ts` | modified | _TODO_ |
| `src/screens/<area>/<Screen>.tsx` | modified | _TODO_ |

---

## 🧪 Manual Test Plan
_No automated test suite exists; verify on a real device or Expo Go._

- [ ] Start Metro: `npx expo start --lan --clear`
- [ ] Run on Android via Expo Go
- [ ] Happy path: _TODO_
- [ ] Error path: _TODO_
- [ ] Toggle dark mode mid-flow
- [ ] Background → foreground the app (state survives)

---

## ✅ Verification Checklist
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] No `console.error` introduced
- [ ] No leftover `toast.info('… coming soon')` on the touched flow
- [ ] Loading + error UI states present
- [ ] All design decisions implemented
- [ ] All phases completed
- [ ] Spec status updated to `shipped`
- [ ] PR description references the spec

---

## 📝 Progress Tracking

**Status legend:**
- 🟡 Draft — Planning stage
- 🔵 In Progress — Implementation started
- 🟢 Complete — All phases done
- 🔴 Blocked — Waiting on dependency

**Current Phase:** Phase 1
**Completion:** 0%

---

## 📌 Notes
_Open questions, risks, or things to revisit._
```

### Step 7: Save File
Write to `.claude/_plan/<filename>.md`. Do **not** auto-commit.

### Step 8: Report
```
✅ Implementation plan saved.

File:    .claude/_plan/<filename>.md
Spec:    .claude/_specs/NNN-<slug>.md
Branch:  <current branch>
Phases:  <N>
TODOs:   <count of _TODO_ markers — these are intentional placeholders>

Next:
  1. Open the file and fill remaining _TODO_ sections.
  2. Start with Phase 1, check off steps as you go.
  3. Update **Status** as work progresses.
  4. When done, git add .claude/_plan/<filename>.md and commit.
```

## Errors

| Issue | Action |
|-------|--------|
| `.claude/_plan/` cannot be created | Stop, ask user to create it manually |
| No plan in conversation | Stop with the message above |
| Spec cannot be resolved | Ask the user which spec ID this plan implements |
| File already exists | Append `-v2`, `-v3`, … until unique |
| User answers `n` to confirmation | Abort cleanly, no file written |

## Example

Input:
```
/create-plan auth-signin
```

Output:
```
About to write:
  File:   .claude/_plan/2026-05-12-auth-signin.md
  Spec:   .claude/_specs/002-auth-signin.md
  Branch: feat/auth-signin

Proceed? (y/n)

[after y]

✅ Implementation plan saved.
File:    .claude/_plan/2026-05-12-auth-signin.md
Spec:    .claude/_specs/002-auth-signin.md
Branch:  feat/auth-signin
Phases:  5
TODOs:   14
```

---
v1.0.0
