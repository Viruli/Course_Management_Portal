---
name: run-sprint
description: Execute and track progress on a sprint under .claude/_sprints/
argument-hint: Sprint number, slug, folder, file path, or empty to auto-detect
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Run Sprint (CMP Mobile)

Walks through a sprint task-by-task, updates the sprint file as work progresses, runs verification (`npx tsc --noEmit` + manual Expo Go test prompts), and offers to commit when done.

> **Branch rule:** sprints do **not** get their own git branches. All work happens on the existing `feat/<slug>` branch the spec was created on. The command should never run `git switch -c`.

## Workflow

### Step 1: Identify the Sprint

Parse `$ARGUMENTS`:

| Input form | Interpretation |
|---|---|
| _empty_ | Auto-detect: scan `.claude/_sprints/*/` for the first sprint not marked 🟢. If multiple folders qualify, ask the user to pick. |
| Single digit (`2`) | Sprint number within the **current feature folder** (derived from current branch `feat/<slug>` → `.claude/_sprints/<slug>/`). |
| Slug (`auth-signin`) | Folder mode: `.claude/_sprints/auth-signin/` — run all incomplete sprints sequentially. |
| Folder path (`.claude/_sprints/auth-signin/` or `@_sprints/auth-signin`) | Folder mode. |
| File path (`.claude/_sprints/auth-signin/sprint-02-state.md`) | Single-sprint mode for that file. |

**Detect mode:**
- **Single sprint mode** → resolve to one file, work it end-to-end.
- **Folder mode** → list all sprints in order, find first incomplete, then iterate.

Confirm the resolution with the user before proceeding:
```
🏃 Sprint run

Mode:    <single | folder>
Folder:  .claude/_sprints/<slug>/
Sprint:  sprint-NN-<phase-slug>.md  (Phase <N>: <Name>)
Branch:  <current branch from git rev-parse --abbrev-ref HEAD>

Proceed? (y/n)
```

### Step 2: Sanity Check Branch
Run `git rev-parse --abbrev-ref HEAD`. If the current branch does not match `feat/<slug>` for the resolved sprint folder, **warn but allow override**:
```
⚠️  You're on <branch>, but this sprint belongs to feat/<slug>.
Continue anyway? (y/n)
```
Do **not** auto-switch branches.

### Step 3: Folder Mode Overview (skip if single-sprint)
List all sprint files in the folder with their status:
```
📂 Folder: .claude/_sprints/<slug>/

  1. 🟢 Complete       sprint-01-service-layer.md
  2. 🔵 In Progress    sprint-02-state.md          (2/4 tasks)
  3. 🟡 Not Started    sprint-03-ui-wiring.md
  4. 🟡 Not Started    sprint-04-edge-cases.md
  5. 🟡 Not Started    sprint-05-manual-test.md

Starting at Sprint 2 (first incomplete).
Run all remaining sequentially? (y/n)
```

### Step 4: Load the Sprint
Read the sprint file. Extract:
- Sprint number, phase name, current status
- All tasks (lines starting with `- [ ]` or `- [x]`)
- "Files to Touch" entries
- Acceptance Criteria
- Verification steps
- Manual test items

### Step 5: Dependency Check
For sprint `N > 1`, verify sprint `N-1` is 🟢 Complete by reading its file. If not:
```
⚠️  Sprint <N-1> is not complete (<status>).

Options:
  1. Switch to Sprint <N-1> and finish it first
  2. Continue with Sprint <N> anyway (not recommended)
  3. Abort
Choose (1/2/3):
```
In folder mode, **enforce ordering** — option 2 is hidden, only 1 or 3.

### Step 6: Mark Sprint In Progress
Edit the sprint file:
- `**Status:**` → `🔵 In Progress`
- `**Started:**` → current ISO datetime (only set if blank)

### Step 7: Walk Through Tasks
For each unchecked (`- [ ]`) task, in order:

1. Show the task with its context:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Task <M>/<TOTAL>: <Task text>
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Files likely touched:
     - <path 1>
     - <path 2>

   Options:
     • work    — start working with Claude
     • skip    — leave unchecked, move on
     • done    — already done, mark complete
     • notes   — add a note before deciding
     • quit    — pause the sprint
   ```

2. **If "work"** — Claude assists with the task: reads files, proposes edits, runs commands as needed. Stops when the user says the task is done.

3. **When marking the task done**:
   - Ask (optional) for time spent and a short note.
   - Edit the sprint file: `- [ ] <text>` → `- [x] <text>` _(YYYY-MM-DD HH:MM)_
   - Echo new progress count.

### Step 8: Verification
When all tasks are checked (or user explicitly says "verify now"):

1. **Typecheck (automatic):**
   ```bash
   npx tsc --noEmit
   ```
   Report pass/fail. If failing, list the offending files and ask whether to fix before continuing or mark the sprint blocked.

2. **Manual test prompt:**
   ```
   📱 Manual test on device:

   Make sure Metro is running:
     npx expo start --lan --clear

   For each item, confirm it works on Expo Go:
     - [ ] <happy path from sprint file>
     - [ ] <error path from sprint file>
     - [ ] Dark mode toggles correctly on the touched screens
     - [ ] App backgrounds → foregrounds without losing state

   Reply with "all pass", or list which items failed.
   ```

3. **No leftover stub check:**
   ```bash
   git diff -- src | grep -E "toast.info\('.*coming soon\.'\)" || echo "OK"
   ```
   If matches appear on the touched flow, flag them.

### Step 9: Mark Sprint Complete
If verification passes:
- `**Status:**` → `🟢 Complete`
- `**Completed:**` → current ISO datetime
- Optionally fill the **Retrospective** section (ask the user — skip if they decline).
- **Update `README.md`** in the same folder: bump the status, fill the `Completed` column, update the **Current Sprint** and progress percentages.

If verification fails or user pauses:
- Leave `**Status:**` as `🔵 In Progress` (or set 🔴 Blocked if they say so).
- Add a row to the **Issues Encountered** table if applicable.

### Step 10: Commit (Optional)
Show the diff summary and prompt:
```
📦 Commit sprint work? Files changed:

<short git status>

(y) commit on feat/<slug>   (n) skip   (s) show full diff first
```

If `y`:
```bash
git add <touched paths — never -A blindly>
git commit -m "feat(<scope>): complete sprint <N> — <phase name>"
```
- Stage by **path**, not `git add -A`, to avoid committing `.env` or untracked artifacts.
- Stay on `feat/<slug>` — never branch.
- Never `--no-verify` or `--amend` unless the user asks.

### Step 11: Next Sprint (folder mode only)
After a sprint goes 🟢:
```
🎉 Sprint <N>/<TOTAL> complete.

Next: Sprint <N+1> — <Phase name>

  (y) continue   (n) pause   (q) quit folder mode
```
- **continue** → loop back to Step 4 with sprint N+1
- **pause** → leave the folder, print resume command
- **quit** → end the run

When all sprints are 🟢:
```
🎉 All sprints complete for <slug>.

Closing-the-loop checklist (from README.md):
  1. Update plan status → 🟢 Complete
  2. Update spec status → shipped
  3. Push feat/<slug> and open PR into main
  4. Reference .claude/_specs/NNN-<slug>.md and the sprint folder in the PR description.

Do any of these now? (y/n)
```

## Errors

| Issue | Action |
|-------|--------|
| No sprint folders exist | Suggest running `/create-sprints <plan-slug>` first |
| Sprint file not found | List available files and ask the user to pick |
| Sprint already 🟢 Complete | Offer: view summary / reopen / move to next |
| `npx tsc --noEmit` fails | Show first 20 lines of errors, ask: fix now / mark blocked / abort |
| User on wrong branch | Warn once and let them override (don't auto-switch) |
| Uncommitted unrelated changes during commit step | Show them; stage only sprint-related paths |

## Examples

**Single sprint, explicit number on the current branch:**
```
/run-sprint 2
```
Resolves to `.claude/_sprints/auth-signin/sprint-02-state.md` (since branch is `feat/auth-signin`).

**Folder mode by slug:**
```
/run-sprint auth-signin
```
Runs every incomplete sprint in `.claude/_sprints/auth-signin/` in order, confirming between each.

**Auto-detect:**
```
/run-sprint
```
Picks the first 🔵 In Progress sprint anywhere under `.claude/_sprints/`. If none, picks the first 🟡 Not Started.

## Pipeline Recap

```
/feature-spec <paragraph>     →  spec   +  feat/<slug> branch
/create-plan <slug>           →  plan
/create-sprints <slug>        →  sprint files
/run-sprint [<arg>]           →  execute, verify, mark complete, commit
```

All four commands work on the same `feat/<slug>` branch. Only `/feature-spec` creates a new branch; the others operate on whatever branch is checked out.

---
v1.0.0
