# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`slp-mobile` — the Expo / React Native mobile frontend for a Course Management Portal. **Currently a design build with no backend connected**: every flow is wired to mock data and Zustand state. The original PRD at `.claude/Blueprint/blueprint_mobile.md` describes a target architecture using Firebase, MMKV, Keychain, TanStack Query, etc. — none of that is wired yet. The codebase intentionally uses Expo-Go-compatible alternatives so the app can be opened on a phone without a custom dev client.

Reference design lives in `src/CMP/` — that's the original web prototype (plain HTML + React via CDN). It is not part of the RN bundle; treat it as a styling reference.

## Common commands

The dev server is usually already running on `http://localhost:8081`. All commands assume the project root.

```bash
# Start Expo dev server (most useful flags)
npx expo start --lan         # same Wi-Fi as phone
npx expo start --tunnel      # different networks (ngrok)
npx expo start --clear       # add when Metro cache seems stale

# TypeScript check (no test suite exists yet)
npx tsc --noEmit

# Force-bundle to surface Metro errors without scanning QR
# (returns 200 + bytes on success; throws with the error JS on failure)
curl "http://localhost:8081/index.bundle?platform=android&dev=true&minify=false"

# Reload all connected devices
curl -X POST http://localhost:8081/reload

# Verify dep versions match the Expo SDK
npx expo install --check     # report
npx expo install --fix       # auto-pin
```

There are no Jest/Detox configs and no `lint` script. `npx tsc --noEmit` is the only quality gate.

## High-level architecture

### Role-based routing

`src/store/appStore.ts` holds a single `role` value (`'public' | 'student' | 'admin' | 'super'`). `RootNavigator` switches the entire navigator tree based on it:

- `'public'` → `AuthFlow` (Splash / Onboarding / SignIn / SignUp / Pending)
- `'student'` → `StudentTabs`
- `'admin'` → `AdminTabs`
- `'super'` → `SuperAdminTabs`

Login is a mock: `AuthFlow` looks up the entered email in `SAMPLE_USERS` (from `data/mock.ts`) and calls `setRole(user.role)`. Demo accounts:

| Role | Email |
|---|---|
| Student | `anjali.silva@edupath.lk` |
| Admin | `sahan.w@edupath.lk` |
| Super Admin | `dilani.r@edupath.lk` |

Super Admin tabs (Home / Approvals / Users / Courses / More) are a superset of Admin tabs and reuse most Admin screens directly.

### State (Zustand stores)

All state is in `src/store/`. Each store is plain Zustand, no persistence:

- `appStore` — current role
- `profileStore` — per-role profile (firstName/lastName/email/photoUri/etc.)
- `usersStore` — full user roster seeded from `SAMPLE_USERS`; Super Admin role-change and approve/suspend mutate this
- `approvalsStore` — registration + enrolment queues; approve/reject mutates here
- `notificationsStore` — keyed by audience (`'student'` / `'admin'`), with read-state
- `courseBuilderStore` — the course being created/edited; shared between `CourseBuilderScreen` and `LessonEditorScreen` so the Lesson editor screen can read/mutate the parent course
- `themeStore` — user theme preference (`light | dark | system`) + the resolved OS scheme
- `uiStore` — toast queue. Use the helper `toast.success(msg) / toast.info(msg) / toast.error(msg)` from anywhere

The `ToastHost` is mounted once at the top of `App.tsx`.

### Theming

`src/theme/colors.ts` exports `lightColors` and `darkColors`. Same key set, different values.

**Critical token convention:**
- `colors.brand` (#152A24) is **constant** in both modes. Use this for brand backgrounds — heroes, primary buttons, "dark" avatar variant, active bottom-nav pills.
- `colors.primary` is **adaptive**. In light mode it equals `brand`; in dark mode it's `#EEF2EE`. Use it for **text and icons** so contrast flips with the surface.
- `surface`, `pageBg`, `surface2`, `lightGray`, `stroke`, `stroke2`, `bodyGreen`, `muted`, all the `*Bg` (success/warning/error/info) tokens — adapt.
- `accent` (lime), semantic hues (success/warning/error), and `white` are constant in both modes.

**StyleSheet usage rule:** `StyleSheet.create({…})` runs at module load and captures values once, so module-level styles can't theme themselves. Every component in this codebase uses the `useThemedStyles` pattern:

```tsx
import type { Colors } from '../theme/colors';
import { useColors, useThemedStyles } from '../theme/useThemedStyles';

export function MyScreen() {
  const colors = useColors();                     // for inline JSX color references
  const styles = useThemedStyles(createStyles);   // memo-cached StyleSheet
  return <View style={styles.wrap}>…</View>;
}

const createStyles = (colors: Colors) => StyleSheet.create({
  wrap: { backgroundColor: colors.surface, padding: 16 },
});
```

When adding a new component, follow this pattern. Don't import `colors` at module scope — that import always returns the light palette and won't react to theme changes.

### Course Builder hierarchy

The course authoring flow is the most complex sub-feature. Hierarchy: **Course → Semester → Subject → Lesson → Attachments**. `courseBuilderStore` holds the in-progress course; `CourseBuilderScreen` renders nested accordions; tapping a lesson row navigates to `LessonEditorScreen` which reads and mutates that lesson via the same store. The `SAMPLE_BUILDER_COURSE` constant in `data/mock.ts` is loaded into the store when "Edit" is invoked on any published course (since the design build doesn't persist real per-course content).

### Course view vs builder

Tapping a published course card opens `CourseViewScreen` (read-only) with a 3-dot menu → Edit (→ builder) / Delete (confirmation dialog → local hide). Drafts on the Courses tab go directly to their `Continue` / `Publish` buttons — they do not pass through `CourseViewScreen`.

### Expo Go constraints

The project targets **Expo Go SDK 54**. Pinned versions matter — `npx expo install --check` should always pass. Notable substitutions away from the blueprint:

- No `react-native-mmkv` / `react-native-keychain` / `@react-native-firebase/*` / `@notifee/react-native` / `react-native-fs` — these need a custom dev client. The blueprint references them, but **don't add them back without switching the project away from Expo Go**.
- `expo-image-picker` is used for the profile-photo flow. It needs `mediaTypes: ['images']` (array form) on SDK 54+ — string mode-types are deprecated.
- `lucide-react-native@1.x` dropped a handful of icons (notably `Youtube`). Use `TvMinimalPlay` etc. as replacements.
- React Navigation v7's theme requires a `fonts` block in addition to `colors` — see `RootNavigator.tsx`.
- Reanimated 4 babel plugin is `react-native-worklets/plugin` (not `react-native-reanimated/plugin`). Already set in `babel.config.js`.

### Files and folders

- `App.tsx` — root. Mounts gesture root, safe-area, root navigator, toast host, and the Appearance listener that syncs OS color scheme into `themeStore`.
- `index.ts` — `registerRootComponent(App)`. Required by SDK 53+; no `node_modules/expo/AppEntry.js`.
- `src/CMP/` — original web prototype (HTML + JSX via CDN). Read-only reference, not bundled.
- `src/data/mock.ts` — every list, user, course, etc. seeded into stores at startup.
- `src/data/types.ts` — TS interfaces for everything mock data touches.
- `assets/fonts/` — currently empty. `FONTS_SETUP.md` documents the Figtree + Inter setup that hasn't been done yet; system font is used in the meantime.

## Working notes

- Many buttons that aren't tied to real state call `toast.info('… coming soon.')` to provide feedback without misleading the user. When wiring a new button, prefer real state changes; fall back to a `toast` only when the destination doesn't exist yet.
- Pending registration and enrolment counts on tab badges, dashboard cards, and queue tabs are **all derived from `approvalsStore`** — they update instantly when you approve / reject. Don't hard-code counts.
- The lime role-switcher pill that used to be in `RootNavigator` has been removed; role changes only via login. The OS theme follow-along still works via `themeStore.systemScheme`.
