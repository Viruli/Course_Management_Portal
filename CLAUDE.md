# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`slp-mobile` — the Expo / React Native mobile frontend for a Course Management Portal (CMP). The app is a **progressively-integrated design build**: UI and navigation are complete; backend integration is being wired one feature at a time. The API contract lives in `.claude/Blueprint/blueprint_mobile.md` (architecture) and API Reference v1.1.0/v1.2.0 in `.claude/_specs/`. The app must remain Expo Go-compatible until Firebase / native packages are required.

Reference design lives in `src/CMP/` — the original web prototype (plain HTML + React via CDN). Not bundled; treat as a styling reference only.

## Environment setup

Copy `.env.example` to `.env` and fill in your local values before starting. Metro will not expose `EXPO_PUBLIC_*` vars unless they are in `.env` at the project root.

```bash
cp .env.example .env
```

Required env vars:
```
EXPO_PUBLIC_API_BASE_URL=http://<your-machine-ip>:3000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

## Common commands

```bash
# Start Expo dev server
npx expo start --lan          # same Wi-Fi as phone
npx expo start --tunnel       # different networks (ngrok)
npx expo start --clear        # add when Metro cache seems stale

# TypeScript check — only quality gate (no Jest/lint scripts exist)
npx tsc --noEmit

# Force-bundle to surface Metro errors without scanning QR
curl "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false"

# Reload all connected devices
curl -X POST http://localhost:8081/reload

# Verify pinned dep versions match the Expo SDK
npx expo install --check
npx expo install --fix
```

## High-level architecture

### Role-based routing

`src/store/appStore.ts` holds a single `role` (`'public' | 'student' | 'admin' | 'super'`). `RootNavigator` switches the entire navigator tree:

- `'public'` → `AuthFlow` (Splash / Onboarding / SignIn / SignUp / Pending)
- `'student'` → `StudentTabs`
- `'admin'` → `AdminTabs`
- `'super'` → `SuperAdminTabs`

**Role naming:** the API returns `role: 'super_admin'`; the app uses `'super'`. `toAppRole()` in `src/services/auth.ts` handles the mapping at sign-in time.

Sign-in is now fully wired via Firebase: `loginUser(email, password)` in `src/services/auth.ts` calls Firebase `signInWithEmailAndPassword`, then `GET /me` to fetch the API profile. On backend 5xx, it falls back to reading the role from the Firebase JWT custom claims so admin sign-in survives a crashed backend. Demo accounts (still usable against mock data):

| Role | Email |
|---|---|
| Student | `anjali.silva@edupath.lk` |
| Admin | `sahan.w@edupath.lk` |
| Super Admin | `dilani.r@edupath.lk` |

### Authentication flow

Firebase JS SDK (`firebase@^12`) — no native modules, keeping Expo Go compatibility.

1. `loginUser(email, password)` → Firebase `signInWithEmailAndPassword` → get ID token
2. `GET /me` with token → `ApiUserProfile`; on 5xx falls back to JWT custom claims
3. Status checks: reject `pending_approval`, `rejected`, `suspended` before setting role
4. `toAppRole()` maps `super_admin` → `'super'`; sets `appStore.role`

Token handling: `getAuthToken()` calls `auth.currentUser?.getIdToken()` on every request — no local token storage. A `401` response with `TOKEN_REVOKED` or `INVALID_TOKEN` triggers `handleRevoked()` → force sign-out and reset to `'public'`.

Sign-out: `performLogout()` → POST `/auth/logout` + Firebase `signOut()` + clear `profileStore` + reset role. Offline fallback toasts `'Signed out locally. Session will expire within 1 hour.'`

### API service layer

All backend calls go through `src/services/`:

- `api.ts` — `apiFetch<T>(path, options)` base client. Reads `EXPO_PUBLIC_API_BASE_URL`, auto-attaches Firebase ID token, enforces 15 s timeout, normalises every error into a typed `ApiError`. Returns `ApiResult<T>` `{ data, status, requestId, url, durationMs }`.

Currently wired service files:

| File | Covers |
|---|---|
| `auth.ts` | register, login, logout, token-refresh, login-failure tracking |
| `courses.ts` | student catalog + admin CRUD (list, fetch, publish, archive, update, delete) |
| `semesters.ts` | create / update semesters |
| `subjects.ts` | create / update subjects |
| `lessons.ts` | list / create / update lessons per subject |
| `enrollments.ts` | admin enrollment queue (list, approve, reject) |
| `studentEnrollments.ts` | student enrollment lifecycle (enroll, list mine, withdraw) |
| `progress.ts` | subject completion + course progress % (mark complete, last-accessed, get progress) |
| `registrations.ts` | admin registration queue (list, approve, reject) |
| `attachments.ts` | file upload / download |
| `profile.ts` | update own profile fields, change password |
| `userManagement.ts` | super-admin user roster (list, get, suspend, reactivate) |
| `auditLog.ts` | super-admin paginated audit log (category, action, target filters) |
| `storage.ts` | persistent local caching |
| `getAuthToken.ts` | convenience wrapper for Firebase ID token |
| `firebase.ts` | Firebase app initialisation (Auth, Storage) |

**Adding a new service call:**
```ts
import { apiFetch } from './api';

export function getMyProfile(token: string) {
  return apiFetch<UserProfile>('/me', {
    method: 'GET',
    tag: 'profile.getMe',    // appears in DebugPanel
    redactFields: [],
  });
}
```

**Pagination pattern** (registrations, enrollments, user management, audit log): responses include `{ data[], nextCursor, total }`. Build query strings with `URLSearchParams`.

**Error handling pattern in screens:**
```ts
import { ApiError } from '../../services/api';

try {
  const result = await someServiceCall();
  // result.data is the typed response
} catch (err) {
  if (err instanceof ApiError) {
    if (err.code === 'SPECIFIC_CODE') { /* handle */ }
    else toast.error(err.message);
  } else {
    toast.error('Something went wrong.');
  }
}
```

`ApiError` carries `.code` (machine-readable), `.status` (HTTP), `.details` (field-level validation from 400 responses), and `.requestId`.

**Enrollment error codes** (used in `CourseDetailScreen` and `studentEnrollments.ts`):
- `ENROLLMENT_PENDING` — student already has a pending request; show status instead of re-enroll button
- `ALREADY_ENROLLED` — active enrollment exists
- `COOLOFF_ACTIVE` — re-enrollment blocked after withdrawal; show remaining cooloff time
- `COURSE_NOT_FOUND` — course was archived/deleted after screen loaded

After catching an enrollment error, re-fetch `listMyEnrollments()` to get current state rather than deriving it from the error response.

**Progress tracking pattern:**
- `updateLastAccessed(subjectId, ctx)` — fire-and-forget on every subject view; never await, never show errors
- `markSubjectComplete(subjectId, ctx)` — called explicitly when student finishes; update local `completed` map optimistically, then confirm via `getSubjectProgress()`
- `getCourseProgress(courseId)` — fetched on demand (e.g., `MyLearningScreen` fetches in parallel for all approved enrollments using `Promise.allSettled`)
- Progress state is per-screen (not global); there is no progress Zustand store

### Debug infrastructure

`src/store/debugStore.ts` — in-memory log (max 50 entries) of every `apiFetch` call. Auto-populated when a `tag` is passed.

`src/components/DebugPanel.tsx` — drop into any screen during development:
```tsx
<DebugPanel tags={['auth.register']} title="Sign up debug" />
```
Hidden automatically when `debugStore.enabled` is false or the tag has no entries.

### State (Zustand stores)

All in `src/store/`. No persistence layer yet — all stores are in-memory only.

- `appStore` — current role + `publicStep` (which auth screen to show)
- `profileStore` — dual-layer: real `apiProfile` (populated at sign-in) **and** mock `profiles` per role. Not-yet-wired screens still render mock data.
- `usersStore` — full user roster seeded from `SAMPLE_USERS`; mutated by approve/suspend
- `approvalsStore` — registration + enrolment queues; approve/reject mutates here. Includes `approveAllEnrolments()` for batch approval (returns `{ approved, failed }`).
- `notificationsStore` — keyed by audience (`'student'` / `'admin'`), with read-state
- `courseBuilderStore` — in-progress course; shared between `CourseBuilderScreen` and `LessonEditorScreen`
- `themeStore` — user preference (`light | dark | system`) + resolved OS scheme
- `uiStore` — toast queue. Use `toast.success(msg) / toast.info(msg) / toast.error(msg)` from anywhere (non-hook-safe)
- `debugStore` — API call log; dev tooling only

`ToastHost` is mounted once at the root in `App.tsx`. Toasts auto-dismiss after ~2.6 s.

### Theming

`src/theme/colors.ts` exports `lightColors` and `darkColors`. **Critical token rules:**

- `colors.brand` (#152A24) — **constant** in both modes. Use for brand backgrounds, primary buttons, active nav pills.
- `colors.primary` — **adaptive**. Light mode = brand; dark mode = #EEF2EE. Use for text and icons so contrast flips with the surface.
- `surface`, `pageBg`, `surface2`, `lightGray`, `stroke`, `stroke2`, `bodyGreen`, `muted`, `*Bg` tokens — all adaptive.
- `accent` (lime #BCE955), semantic colours (success/warning/error), `white` — constant.

**`useThemedStyles` pattern — required for all components:**
```tsx
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

export function MyScreen() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  return <View style={styles.wrap}>…</View>;
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: { backgroundColor: colors.surface, padding: 16 },
});
```
Never import colours at module scope — `StyleSheet.create` runs once at load and won't react to theme changes.

### Path alias

`tsconfig.json` maps `@/*` → `./src/*`. Use `@/services/api` instead of relative paths when importing across feature boundaries.

### Course Builder hierarchy

The most complex sub-feature. Frontend hierarchy: **Course → Semester → Subject → Lesson → Attachments**. `courseBuilderStore` holds the in-progress course; `CourseBuilderScreen` renders nested accordions; tapping a lesson navigates to `LessonEditorScreen`. `SAMPLE_BUILDER_COURSE` in `data/mock.ts` is loaded when "Edit" is tapped on any published course.

**API hierarchy (v1.1.0/v1.2.0):** Course → Semester → Subject (with `youtubeVideoId`) → Attachments. The frontend's extra **Lesson** layer is being reconciled with the backend team.

### API compatibility notes

The deployed backend does not always match the versioned spec. Known divergences:

- **Subject fields**: spec lists only id/title/order; deployed backend returns `description`, `youtubeVideoId`, `attachments` — use them when present
- **Lesson video URL**: spec says `youtubeVideoId`; deployed backend uses a full `url` field — `LessonPlayerScreen` extracts the video ID from 4 URL patterns (full, short, embed, shorts)
- **Attachment field names**: v1.1 uses `fileName` / `uploadedAt`; v1.2 uses `filename` / `createdAt` — screens handle both: `att.fileName ?? att.filename`
- **Course create**: spec lists only `title` as required; deployed backend also requires `description`
- **Enrollment enrichment**: `listEnrollments` responses may include optional `studentName`, `studentEmail`, `courseTitle` fields — use them for display with the fallback chain `e.studentName ?? \`User ${uid.slice(0,8)}…\``

### Expo Go constraints

Targets **Expo Go SDK 54**. Do not add packages that require a custom dev client without explicitly switching the project:

- No `react-native-mmkv` / `react-native-keychain` / `@react-native-firebase/*` / `@notifee/react-native` / `react-native-fs`
- `expo-image-picker` — use `mediaTypes: ['images']` (array, not string) on SDK 54+
- `lucide-react-native@1.x` — `Youtube` icon removed; use `TvMinimalPlay` instead
- React Navigation v7 theme requires a `fonts` block alongside `colors` — see `RootNavigator.tsx`
- Reanimated 4 babel plugin is `react-native-worklets/plugin` — already in `babel.config.js`

### Fonts

Figtree (headings) and Inter (body) are specified in the design but **not yet linked**. The app currently falls back to system fonts (San Francisco on iOS, Roboto on Android). Setup steps are in `FONTS_SETUP.md` — requires `.ttf` files in `assets/fonts/`, a `react-native.config.js`, and `npx react-native-asset`. Do not attempt font linking while Expo Go is the target; it requires a custom dev client.

## .claude/ workflow

Four slash commands automate the feature-integration workflow. Run them in order for each new feature:

| Command | What it does |
|---|---|
| `/feature-spec <paragraph>` | Parses description → creates `feat/<slug>` branch → writes `.claude/_specs/NNN-<slug>.md` |
| `/create-plan <slug>` | Saves Claude's in-chat implementation plan to `.claude/_plan/YYYY-MM-DD-<slug>.md` |
| `/create-sprints <slug>` | Explodes the plan into per-phase sprint files under `.claude/_sprints/<slug>/` |
| `/run-sprint [<arg>]` | Walks through a sprint task-by-task, runs `npx tsc --noEmit`, prompts manual Expo Go test, marks complete |

Specs, plans, and sprints are committed on the feature branch and serve as living documentation.

## Working notes

- `src/data/types.ts` contains **mock-era types** that do not match the API v1.1.0 contract. When wiring a new endpoint, define API-aligned interfaces in the service file; do not reuse these mock types for API responses.
- Buttons not yet wired to real state call `toast.info('… coming soon.')`. When wiring a new button, prefer real state changes; fall back to `toast` only when the destination screen doesn't exist yet.
- Pending registration and enrolment counts on tab badges, dashboard cards, and queue tabs are all derived from `approvalsStore` — they update instantly. Never hard-code counts.
- `EditProfileScreen` is shared between student and admin flows — lives in `src/screens/shared/`.
- The OS theme listener is mounted in `App.tsx` and syncs the device colour scheme into `themeStore.systemScheme`.
- `profileStore.apiProfile` holds the real signed-in user; `profileStore.profiles` holds per-role mock data. Screens not yet wired to the real API still read from `profiles`.
- `userManagement.ts` and `auditLog.ts` are super-admin only — the screens that use them must guard with a role check before calling.
- `LessonPlayerScreen` builds a flat ordered subject list across all semesters and fetches their lessons in parallel via `Promise.allSettled()` — individual lesson-fetch failures are silently skipped so one bad subject doesn't break the whole player.
