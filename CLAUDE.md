# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`slp-mobile` — the Expo / React Native mobile frontend for a Course Management Portal (CMP). The app is a **partially-integrated design build**: the UI and navigation are complete with mock data; backend integration is in progress one feature at a time. The API contract lives in `.claude/Blueprint/blueprint_mobile.md` (architecture) and in the conversation history (API Reference v1.1.0). The app must remain Expo Go-compatible until Firebase / native packages are required.

Reference design lives in `src/CMP/` — the original web prototype (plain HTML + React via CDN). Not bundled; treat as a styling reference only.

## Environment setup

Copy `.env.example` to `.env` and fill in your local values before starting. Metro will not expose `EXPO_PUBLIC_*` vars unless they are in `.env` at the project root.

```bash
cp .env.example .env
# Edit .env — set EXPO_PUBLIC_API_BASE_URL to http://<your-machine-ip>:3000/api/v1
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

**Naming discrepancy to be aware of:** the API returns `role: 'super_admin'` but the app uses `'super'`. This mapping needs to happen when wiring `GET /me`.

Sign-in is still partially mocked: `AuthFlow` calls `registerStudent()` (real API) for registration, but sign-in still resolves role from `SAMPLE_USERS` in `data/mock.ts`. Demo accounts:

| Role | Email |
|---|---|
| Student | `anjali.silva@edupath.lk` |
| Admin | `sahan.w@edupath.lk` |
| Super Admin | `dilani.r@edupath.lk` |

### API service layer

All backend calls go through `src/services/`:

- `api.ts` — `apiFetch<T>(path, options)` base client. Reads `EXPO_PUBLIC_API_BASE_URL`, attaches auth headers, handles timeouts, and normalises every error into a typed `ApiError`. Returns `ApiResult<T>` `{ data, status, requestId, url, durationMs }`.
- `auth.ts` — `registerStudent(payload)` — the only wired endpoint so far.

**Adding a new service call:**
```ts
import { apiFetch } from './api';

export function getMyProfile(token: string) {
  return apiFetch<UserProfile>('/me', {
    method: 'GET',
    token,
    tag: 'profile.getMe',          // appears in DebugPanel
    redactFields: [],
  });
}
```

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

`ApiError` carries `.code` (machine-readable, matches the API error codes reference), `.status` (HTTP), `.details` (field-level validation errors from 400 responses), and `.requestId`.

### Debug infrastructure

`src/store/debugStore.ts` — in-memory log (max 50 entries) of every `apiFetch` call. Auto-populated when a `tag` is passed to `apiFetch`. Use the `debug` helper for non-hook contexts.

`src/components/DebugPanel.tsx` — drop into any screen during development:
```tsx
<DebugPanel tags={['auth.register']} title="Sign up debug" />
```
Renders expandable request/response cards including body, status, duration, and error. Hidden automatically when `debugStore.enabled` is false or the tag has no entries.

### State (Zustand stores)

All in `src/store/`. No persistence layer yet.

- `appStore` — current role
- `profileStore` — per-role profile (firstName/lastName/email/photoUri)
- `usersStore` — full user roster seeded from `SAMPLE_USERS`; mutated by approve/suspend actions
- `approvalsStore` — registration + enrolment queues; approve/reject mutates here
- `notificationsStore` — keyed by audience (`'student'` / `'admin'`), with read-state
- `courseBuilderStore` — in-progress course; shared between `CourseBuilderScreen` and `LessonEditorScreen`
- `themeStore` — user theme preference (`light | dark | system`) + resolved OS scheme
- `uiStore` — toast queue. Use `toast.success(msg) / toast.info(msg) / toast.error(msg)` from anywhere
- `debugStore` — API call log; not user-facing, dev tooling only

`ToastHost` is mounted once at the root in `App.tsx`.

### Theming

`src/theme/colors.ts` exports `lightColors` and `darkColors`. **Critical token rules:**

- `colors.brand` (#152A24) — **constant** in both modes. Use for brand backgrounds, primary buttons, active nav pills.
- `colors.primary` — **adaptive**. Light mode = brand; dark mode = #EEF2EE. Use for text and icons so contrast flips with the surface.
- `surface`, `pageBg`, `surface2`, `lightGray`, `stroke`, `stroke2`, `bodyGreen`, `muted`, `*Bg` tokens — all adaptive.
- `accent` (lime), semantic colours (success/warning/error), `white` — constant.

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

### Course Builder hierarchy

The most complex sub-feature. Frontend hierarchy: **Course → Semester → Subject → Lesson → Attachments**. `courseBuilderStore` holds the in-progress course; `CourseBuilderScreen` renders nested accordions; tapping a lesson navigates to `LessonEditorScreen`. `SAMPLE_BUILDER_COURSE` in `data/mock.ts` is loaded when "Edit" is tapped on any published course.

**API hierarchy (v1.1.0):** Course → Semester → Subject (with `youtubeVideoId`) → Lesson (separate entity, §6.4–6.7) → Attachments. The frontend's extra Lesson layer is pending reconciliation with the backend team.

### Expo Go constraints

Targets **Expo Go SDK 54**. Do not add packages that require a custom dev client without explicitly switching the project:

- No `react-native-mmkv` / `react-native-keychain` / `@react-native-firebase/*` / `@notifee/react-native` / `react-native-fs`
- `expo-image-picker` — use `mediaTypes: ['images']` (array, not string) on SDK 54+
- `lucide-react-native@1.x` — `Youtube` icon removed; use `TvMinimalPlay` instead
- React Navigation v7 theme requires a `fonts` block alongside `colors` — see `RootNavigator.tsx`
- Reanimated 4 babel plugin is `react-native-worklets/plugin` — already in `babel.config.js`

## .claude/ workflow

Four slash commands automate the feature-integration workflow. Run them in order for each new feature:

| Command | What it does |
|---|---|
| `/feature-spec <paragraph>` | Parses description → creates `feat/<slug>` branch → writes `.claude/_specs/NNN-<slug>.md` |
| `/create-plan <slug>` | Saves Claude's in-chat implementation plan to `.claude/_plan/YYYY-MM-DD-<slug>.md` |
| `/create-sprints <slug>` | Explodes the plan into per-phase sprint files under `.claude/_sprints/<slug>/` |
| `/run-sprint [<arg>]` | Walks through a sprint task-by-task, runs `npx tsc --noEmit`, prompts manual Expo Go test, marks complete |

Specs, plans, and sprints are committed on the feature branch. They serve as living documentation for the integration work.

## Working notes

- `src/data/types.ts` contains **mock-era types** that do not match the API v1.1.0 contract. When wiring a new endpoint, define API-aligned interfaces in the service file; do not reuse these mock types for API responses.
- Buttons not yet wired to real state call `toast.info('… coming soon.')`. When wiring a new button, prefer real state changes; fall back to `toast` only when the destination screen doesn't exist yet.
- Pending registration and enrolment counts on tab badges, dashboard cards, and queue tabs are all derived from `approvalsStore` — they update instantly. Never hard-code counts.
- `EditProfileScreen` is shared between student and admin flows — lives in `src/screens/shared/`.
- The OS theme listener is mounted in `App.tsx` and syncs the device colour scheme into `themeStore.systemScheme`.
