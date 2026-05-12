---
name: feature-spec
description: Create a feature spec file and feature branch from a short description
argument-hint: Short feature description (paragraph or sentence)
allowed-tools: Read, Write, Glob, Bash
---

# Feature Spec Creator (CMP Mobile)

Generates a per-feature spec markdown file and creates a fresh git branch for the work. Designed for the CMP React Native / Expo frontend.

## Workflow

### 1. Git Check
Run `git status`. If there are uncommitted changes (modified, staged, or untracked source files), **stop and ask the user**:

```
⚠️  You have uncommitted changes:
<short summary>

Commit them, stash them, or discard before creating a new feature branch?
```

Wait for the user to act before continuing. Do **not** auto-commit or auto-stash.

### 2. Parse $ARGUMENTS
From the user's paragraph, derive:

- **Title** — Title Case, ≤ 80 chars (e.g. `"Sign In With Email and Password"`)
- **Slug** — kebab-case, `a-z0-9-` only, ≤ 40 chars (e.g. `sign-in-email-password`)
- **Branch** — `feat/<slug>`
- **Spec number** — next available `NNN` from `.claude/_specs/` (3 digits, zero-padded)

If the description is too vague to derive a title/slug, ask the user one clarifying question before continuing.

### 3. Confirm With User
Before creating anything, show the user:

```
About to create:
  Branch: feat/<slug>
  Spec:   .claude/_specs/NNN-<slug>.md
  Title:  <Title>

Proceed? (y/n)
```

Wait for confirmation.

### 4. Create Branch
```bash
git switch -c feat/<slug>
```
If the branch already exists locally, append `-2`, `-3`, … until unique.

### 5. Load Context
Read for context before writing the spec:
- `CLAUDE.md` — project conventions
- `.claude/Blueprint/blueprint_mobile.md` — target architecture
- `.claude/_specs/template.md` — spec template
- API reference section relevant to the feature (if the user pasted it earlier in the conversation, use that; otherwise leave the API Contract section as a TODO)

### 6. Write `.claude/_specs/NNN-<slug>.md`
Use `.claude/_specs/template.md` verbatim and fill in only the sections you can confidently infer from the user's paragraph. Leave the rest as `_TODO_` markers so the user fills them in.

**Rules:**
- Describe WHAT, not HOW. Don't pre-decide implementation details.
- Use plain language; no code blocks unless quoting the API contract.
- Reference exact paths (`src/screens/...`) for affected files when obvious.
- Mark anything you're guessing with `(?)`.

### 7. Report
```
✅ Feature spec created.

Branch:  feat/<slug>     (switched)
Spec:    .claude/_specs/NNN-<slug>.md
Title:   <Title>

📚 Context loaded:
  - CLAUDE.md
  - .claude/Blueprint/blueprint_mobile.md
  - <other refs>

Next:
  1. Open the spec, fill the _TODO_ sections.
  2. git add .claude/_specs/NNN-<slug>.md
  3. git commit -m "docs(spec): add <slug>"
```

Do **not** auto-commit the new spec file.

## Errors

| Issue | Action |
|-------|--------|
| Dirty working dir | Stop, show summary, ask user to commit/stash |
| Paragraph too vague | Ask one clarifying question (goal? user? endpoint?) |
| Branch already exists | Append `-2`, `-3`, … |
| `.claude/_specs/template.md` missing | Stop, tell the user the template is missing |
| User answers `n` to confirmation | Abort cleanly, no changes made |

## Example

Input:
```
/feature-spec Wire the sign-in screen to POST /auth/login via Firebase and store the ID token so the user lands on their role's tab stack after a successful login.
```

Output:
```
About to create:
  Branch: feat/auth-signin
  Spec:   .claude/_specs/002-auth-signin.md
  Title:  Sign In With Firebase Auth

Proceed? (y/n)

[after y]

✅ Feature spec created.
Branch:  feat/auth-signin     (switched)
Spec:    .claude/_specs/002-auth-signin.md
📚 Context loaded:
  - CLAUDE.md
  - .claude/Blueprint/blueprint_mobile.md
  - API Reference §2 (Auth)

Next:
  1. Open the spec, fill the _TODO_ sections.
  2. git add .claude/_specs/002-auth-signin.md
  3. git commit -m "docs(spec): add auth-signin"
```

---
v1.0.0
