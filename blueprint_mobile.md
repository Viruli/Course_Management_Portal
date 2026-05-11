u# CMP — Mobile Frontend Blueprint
## Course Management Portal · `slp-mobile`
### React Native · Zustand · TailwindRN (NativeWind) · Firebase JS SDK · Offline-first

**Version:** 1.0.0
**Date:** 07 May 2026
**Organisation:** Future CX Lanka (Pvt) Ltd
**Status:** Release Baseline

---

## Table of Contents

1. [Overview and Goals](#1-overview-and-goals)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Folder Structure](#4-folder-structure)
5. [State Management — Zustand](#5-state-management--zustand)
6. [API Layer](#6-api-layer)
7. [Offline Architecture](#7-offline-architecture)
8. [Navigation Architecture](#8-navigation-architecture)
9. [Authentication Flow](#9-authentication-flow)
10. [Theme System and Dark Mode](#10-theme-system-and-dark-mode)
11. [Responsive Design and Screen Sizes](#11-responsive-design-and-screen-sizes)
12. [Reusable UI Components](#12-reusable-ui-components)
13. [Screen Catalogue — Student Role](#13-screen-catalogue--student-role)
14. [Screen Catalogue — Admin Role](#14-screen-catalogue--admin-role)
15. [Screen Catalogue — Super Admin Role](#15-screen-catalogue--super-admin-role)
16. [Firebase Integration](#16-firebase-integration)
17. [Push Notification Integration (FCM + APNs)](#17-push-notification-integration-fcm--apns)
18. [YouTube Player Integration](#18-youtube-player-integration)
19. [Attachment Download Flow](#19-attachment-download-flow)
20. [Offline-first Profile Editing (FR-STU-004)](#20-offline-first-profile-editing-fr-stu-004)
21. [Testing Strategy](#21-testing-strategy)
22. [Environment Configuration](#22-environment-configuration)
23. [Build and CI/CD](#23-build-and-cicd)
24. [SRS Requirement Traceability](#24-srs-requirement-traceability)

---

## 1. Overview and Goals

`slp-mobile` is the React Native application for the Course Management Portal. It targets iOS 15+ and Android 10+ (API level 29+), serves three user roles (Student, Admin, Super Admin), and delivers a first-class offline experience for learning content.

### Key Product Goals

| Goal | Implementation |
|------|---------------|
| **Offline availability** | MMKV-backed Zustand persist, React Query offline cache, attachment local storage |
| **Responsive layout** | NativeWind + custom `useBreakpoint` hook covering phone (360px+), large phone, tablet |
| **Dark mode** | System-aware + user-override theme stored in MMKV |
| **Secure storage** | Firebase tokens and profile drafts in Keychain (iOS) / EncryptedSharedPreferences (Android) |
| **Reusable UI** | Atomic component library built with NativeWind — Button, Card, Badge, Avatar, Modal, Form fields |
| **Clean architecture** | Presentation → Application (Zustand/React Query) → Domain → Infrastructure (API/Firebase) |

### Supported Platforms

| Platform | Min Version | Notes |
|----------|:-----------:|-------|
| iOS | 15.0 | iPhone 8 and newer |
| Android | 10 (API 29) | Devices with ≥3 GB RAM |

---

## 2. Technology Stack

| Concern | Library | Version | Rationale |
|---------|---------|:-------:|-----------|
| Framework | React Native | 0.74+ | Cross-platform foundation |
| Routing / Navigation | React Navigation 7 | latest | Industry standard; native stack + bottom tabs |
| Styling | NativeWind 4 (Tailwind CSS) | 4.x | Utility-first; shared design tokens |
| State — global | **Zustand** | 4.x | Minimal boilerplate, excellent TypeScript, built-in persist |
| State — server / cache | **TanStack Query (React Query)** | 5.x | Cache, stale-while-revalidate, offline, retry, pagination |
| Persist storage | MMKV + `zustand-persist` | latest | 10× faster than AsyncStorage; synchronous reads |
| Secure storage | `react-native-keychain` | latest | Keychain (iOS) / EncryptedSharedPreferences (Android) |
| Firebase | `@react-native-firebase/*` | 20.x | Auth, FCM — native modules, better than JS SDK on mobile |
| HTTP client | Axios | 1.x | Interceptors for token injection + retry |
| Forms | React Hook Form | 7.x | Performant, Zod schema validation |
| Validation | Zod | 3.x | Shared schemas; matches backend validation |
| YouTube | `react-native-youtube-iframe` | latest | Official IFrame API; 90% watch-threshold event |
| Offline files | `react-native-fs` | latest | Attachment caching to device storage |
| Date formatting | `date-fns` | 3.x | Lightweight, tree-shakeable |
| Icons | `react-native-vector-icons` (MaterialCommunityIcons) | latest | |
| Animations | `react-native-reanimated` 3 | 3.x | Gestures and transitions |
| Splash / App icon | `react-native-bootsplash` | latest | Native splash screen |
| Deep links | React Navigation linking config | built-in | Universal links + custom scheme |
| Testing | Jest + React Native Testing Library | latest | Unit + integration tests |
| E2E | Detox | 20.x | E2E test runner for critical flows |

### Why Zustand over Redux Toolkit

- No boilerplate (no slices, reducers, action creators)
- Slice-based stores composed freely — `useAuthStore`, `useThemeStore`, `useSyncQueueStore`
- First-class MMKV persist with a one-liner
- Lighter bundle; synchronous MMKV reads avoid flash-of-unauthenticated-state on launch
- TanStack Query handles all server-state caching; Zustand owns only client-side UI/auth state

---

## 3. Architecture Overview

```
+-----------------------------------------------------+
|                  PRESENTATION LAYER                 |
|  React Native Screens + NativeWind components       |
|  React Navigation stacks / tabs                     |
+-----------------------------------------------------+
|               APPLICATION LAYER                     |
|  Zustand stores (auth, theme, syncQueue)            |
|  TanStack Query hooks (useCoursesQuery, etc.)       |
|  Custom hooks (useBreakpoint, useOffline, etc.)     |
+-----------------------------------------------------+
|                  DOMAIN LAYER                       |
|  TypeScript interfaces (User, Course, Enrollment…)  |
|  Zod validation schemas                             |
|  Business logic helpers (formatProgress, etc.)      |
+-----------------------------------------------------+
|              INFRASTRUCTURE LAYER                   |
|  apiClient (Axios + Firebase token interceptor)     |
|  firebaseAuth (react-native-firebase/auth)          |
|  secureStorage (react-native-keychain)              |
|  mmkvStorage (MMKV)                                 |
|  fileCache (react-native-fs)                        |
+-----------------------------------------------------+
|             EXTERNAL SERVICES                       |
|  CMP Backend API (api/v1)                           |
|  Firebase Auth + FCM                                |
|  YouTube IFrame Player                              |
|  Firebase Cloud Storage (signed URLs)               |
+-----------------------------------------------------+
```

---

## 4. Folder Structure

```
slp-mobile/
├── src/
│   ├── app/                          # Navigation root, deep link config
│   │   ├── index.tsx                 # Root navigator — auth gate
│   │   ├── linking.ts                # Deep link + universal link config
│   │   └── RootNavigator.tsx
│   │
│   ├── navigation/
│   │   ├── AuthNavigator.tsx         # Unauthenticated stack
│   │   ├── StudentNavigator.tsx      # Bottom tabs + nested stacks
│   │   ├── AdminNavigator.tsx        # Bottom tabs for Admin role
│   │   ├── SuperAdminNavigator.tsx   # Super Admin tabs
│   │   └── types.ts                  # RootStackParamList + all param types
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── PendingApprovalScreen.tsx
│   │   ├── student/
│   │   │   ├── CourseCatalogScreen.tsx
│   │   │   ├── CourseDetailScreen.tsx
│   │   │   ├── MyCoursesScreen.tsx
│   │   │   ├── SubjectPlayerScreen.tsx
│   │   │   ├── CourseProgressScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── NotificationsScreen.tsx
│   │   ├── admin/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── CourseListScreen.tsx
│   │   │   ├── CourseEditorScreen.tsx
│   │   │   ├── SemesterEditorScreen.tsx
│   │   │   ├── SubjectEditorScreen.tsx
│   │   │   ├── RegistrationQueueScreen.tsx
│   │   │   ├── EnrollmentQueueScreen.tsx
│   │   │   ├── StudentListScreen.tsx
│   │   │   └── StudentDetailScreen.tsx
│   │   └── superadmin/
│   │       ├── AdminListScreen.tsx
│   │       ├── CreateAdminScreen.tsx
│   │       └── AuditLogScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # Atomic / reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── TextInput.tsx
│   │   │   ├── PasswordInput.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── SectionHeader.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── PullToRefresh.tsx
│   │   │   ├── InfiniteScrollList.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── course/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── SemesterAccordion.tsx
│   │   │   ├── SubjectListItem.tsx
│   │   │   ├── CourseStateBadge.tsx
│   │   │   └── ProgressCircle.tsx
│   │   ├── player/
│   │   │   ├── YouTubePlayer.tsx     # 90% threshold + autoComplete
│   │   │   └── AttachmentList.tsx
│   │   ├── notifications/
│   │   │   └── NotificationItem.tsx
│   │   └── layout/
│   │       ├── ScreenContainer.tsx   # Safe area + KeyboardAvoidingView
│   │       ├── TabBar.tsx            # Custom bottom tab bar
│   │       └── Header.tsx            # Custom navigation header
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── themeStore.ts
│   │   ├── syncQueueStore.ts         # Offline sync queue (profile edits)
│   │   └── uiStore.ts                # Toasts, loading, modals
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useBreakpoint.ts          # Responsive layout helper
│   │   ├── useOffline.ts             # NetInfo online/offline status
│   │   ├── useAuth.ts                # Auth gate + token refresh
│   │   ├── useToast.ts
│   │   ├── useConfirmDialog.ts
│   │   └── useInfiniteScroll.ts
│   │
│   ├── queries/                      # TanStack Query hooks (API calls)
│   │   ├── queryClient.ts            # QueryClient config + MMKV persister
│   │   ├── auth/
│   │   │   ├── useRegisterMutation.ts
│   │   │   └── useLogoutMutation.ts
│   │   ├── courses/
│   │   │   ├── useCoursesQuery.ts
│   │   │   ├── useCourseDetailQuery.ts
│   │   │   ├── useCreateCourseMutation.ts
│   │   │   ├── useUpdateCourseMutation.ts
│   │   │   └── usePublishCourseMutation.ts
│   │   ├── enrollments/
│   │   │   ├── useMyEnrollmentsQuery.ts
│   │   │   ├── useEnrollMutation.ts
│   │   │   ├── useWithdrawMutation.ts
│   │   │   ├── useAdminEnrollmentQueueQuery.ts
│   │   │   ├── useApproveEnrollmentMutation.ts
│   │   │   └── useRejectEnrollmentMutation.ts
│   │   ├── registrations/
│   │   │   ├── useAdminRegistrationQueueQuery.ts
│   │   │   ├── useApproveRegistrationMutation.ts
│   │   │   ├── useRejectRegistrationMutation.ts
│   │   │   └── useBulkApproveRegistrationsMutation.ts
│   │   ├── progress/
│   │   │   ├── useCourseProgressQuery.ts
│   │   │   ├── useSubjectProgressQuery.ts
│   │   │   └── useMarkCompleteMutation.ts
│   │   ├── notifications/
│   │   │   ├── useNotificationsQuery.ts
│   │   │   ├── useMarkReadMutation.ts
│   │   │   └── useMarkAllReadMutation.ts
│   │   ├── users/
│   │   │   ├── useProfileQuery.ts
│   │   │   ├── useUpdateProfileMutation.ts
│   │   │   ├── useUserListQuery.ts
│   │   │   └── useSuspendUserMutation.ts
│   │   └── superadmin/
│   │       ├── useAdminListQuery.ts
│   │       ├── useCreateAdminMutation.ts
│   │       └── useAuditLogQuery.ts
│   │
│   ├── infrastructure/               # Infrastructure adapters
│   │   ├── apiClient.ts              # Axios instance + interceptors
│   │   ├── firebaseAuth.ts           # @react-native-firebase/auth wrapper
│   │   ├── secureStorage.ts          # react-native-keychain wrapper
│   │   ├── mmkvStorage.ts            # MMKV singleton
│   │   └── fileCache.ts              # RNFS attachment cache
│   │
│   ├── domain/                       # TypeScript types + schemas
│   │   ├── types.ts                  # All TypeScript interfaces (mirrored from API doc)
│   │   ├── schemas.ts                # Zod validation schemas
│   │   └── constants.ts              # API base URLs, limits, etc.
│   │
│   ├── theme/
│   │   ├── colors.ts                 # Light and dark colour tokens
│   │   ├── typography.ts             # Font sizes, weights, line heights
│   │   ├── spacing.ts                # Standard spacing scale
│   │   └── shadows.ts                # Platform-specific shadow presets
│   │
│   └── utils/
│       ├── formatters.ts             # formatDate, formatFileSize, formatPercent
│       ├── validators.ts             # Password, email, YouTube URL helpers
│       └── errorMessages.ts          # API error code -> user-friendly string
│
├── android/                          # Android native project
├── ios/                              # iOS native project
├── .env.development
├── .env.staging
├── .env.production
├── app.json
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 5. State Management — Zustand

### `authStore.ts`

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVLoader } from './mmkvStorage';
import type { User } from '../domain/types';

interface AuthState {
  user:           User | null;
  firebaseUid:    string | null;
  role:           'student' | 'admin' | 'super_admin' | null;
  status:         'pending_approval' | 'approved' | 'rejected' | 'suspended' | null;
  isHydrated:     boolean;
  // Actions
  setUser:        (user: User) => void;
  clearAuth:      () => void;
  setHydrated:    () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      firebaseUid: null,
      role:        null,
      status:      null,
      isHydrated:  false,

      setUser: (user) => set({
        user,
        firebaseUid: user.uid,
        role:        user.role,
        status:      user.status,
      }),
      clearAuth: () => set({
        user: null, firebaseUid: null, role: null, status: null,
      }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name:    'cmp-auth',
      storage: createJSONStorage(() => MMKVLoader),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);
```

### `themeStore.ts`

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVLoader } from './mmkvStorage';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode:           ThemeMode;
  resolvedTheme:  'light' | 'dark';
  setMode:        (mode: ThemeMode) => void;
  syncSystem:     () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode:          'system',
      resolvedTheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',

      setMode: (mode) => {
        const resolved = mode === 'system'
          ? (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light')
          : mode;
        set({ mode, resolvedTheme: resolved });
      },
      syncSystem: () => {
        if (get().mode === 'system') {
          set({ resolvedTheme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light' });
        }
      },
    }),
    {
      name:    'cmp-theme',
      storage: createJSONStorage(() => MMKVLoader),
    }
  )
);
```

### `syncQueueStore.ts` — Offline Profile Edit Queue

```typescript
// src/stores/syncQueueStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKVLoader } from './mmkvStorage';

export type SyncStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

interface ProfileEdit {
  id:        string;
  payload:   { firstName?: string; lastName?: string; profilePhotoUrl?: string };
  status:    SyncStatus;
  createdAt: string;
}

interface SyncQueueState {
  queue:   ProfileEdit[];
  enqueue: (edit: Omit<ProfileEdit, 'id' | 'status' | 'createdAt'>) => void;
  setStatus: (id: string, status: SyncStatus) => void;
  remove:  (id: string) => void;
  clearUploaded: () => void;
}

export const useSyncQueueStore = create<SyncQueueState>()(
  persist(
    (set) => ({
      queue: [],
      enqueue: (edit) => set((s) => ({
        queue: [...s.queue, {
          ...edit,
          id:        crypto.randomUUID(),
          status:    'pending',
          createdAt: new Date().toISOString(),
        }],
      })),
      setStatus: (id, status) => set((s) => ({
        queue: s.queue.map(e => e.id === id ? { ...e, status } : e),
      })),
      remove:  (id)    => set((s) => ({ queue: s.queue.filter(e => e.id !== id) })),
      clearUploaded: () => set((s) => ({
        queue: s.queue.filter(e => e.status !== 'uploaded'),
      })),
    }),
    {
      name:    'cmp-sync-queue',
      storage: createJSONStorage(() => MMKVLoader),
    }
  )
);
```

### `uiStore.ts`

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info'; }

interface UIState {
  toasts:      Toast[];
  showToast:   (message: string, type?: Toast['type']) => void;
  hideToast:   (id: string) => void;
  isLoading:   boolean;
  setLoading:  (v: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  toasts:    [],
  isLoading: false,
  showToast: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },
  hideToast:  (id)  => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })),
  setLoading: (v)   => set({ isLoading: v }),
}));
```

---

## 6. API Layer

### `apiClient.ts`

```typescript
// src/infrastructure/apiClient.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import auth from '@react-native-firebase/auth';
import { Config } from '../domain/constants';

const apiClient: AxiosInstance = axios.create({
  baseURL:        Config.API_BASE_URL,   // https://api.yourdomain.com/api/v1
  timeout:        15_000,
  headers:        { 'Content-Type': 'application/json' },
});

// Attach Firebase ID token to every request
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const currentUser = auth().currentUser;
  if (currentUser) {
    // forceRefresh=false — Firebase SDK auto-refreshes when < 5 min remaining
    const token = await currentUser.getIdToken(false);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Map backend error codes to user-friendly messages
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const code    = error.response?.data?.error?.code;
    const message = error.response?.data?.error?.message;
    // TOKEN_REVOKED means force logout
    if (code === 'TOKEN_REVOKED' || code === 'TOKEN_EXPIRED') {
      auth().signOut(); // triggers onAuthStateChanged -> navigate to login
    }
    return Promise.reject({ code, message, raw: error });
  }
);

export default apiClient;
```

### `queryClient.ts`

```typescript
// src/queries/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'react-query-cache' });

// MMKV adapter for TanStack Query persister
const mmkvAsyncAdapter = {
  getItem:    async (key: string) => storage.getString(key) ?? null,
  setItem:    async (key: string, value: string) => { storage.set(key, value); },
  removeItem: async (key: string) => { storage.delete(key); },
};

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: mmkvAsyncAdapter,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  5 * 60 * 1000,     // 5 minutes
      gcTime:     24 * 60 * 60 * 1000, // 24 hours (survives app restart via persister)
      retry:      2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      networkMode: 'offlineFirst',    // Return cached data immediately when offline
    },
    mutations: {
      networkMode: 'online',
      retry:       1,
    },
  },
});
```

### Example Query Hook

```typescript
// src/queries/courses/useCoursesQuery.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../../infrastructure/apiClient';
import type { PaginatedResponse, Course } from '../../domain/types';

export function useCoursesQuery(params?: { q?: string; state?: string }) {
  return useInfiniteQuery({
    queryKey:     ['courses', params],
    queryFn:      async ({ pageParam }) => {
      const { data } = await apiClient.get<PaginatedResponse<Course>>('/courses', {
        params: { ...params, cursor: pageParam, limit: 20 },
      });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime:    5 * 60 * 1000,
  });
}
```

### Example Mutation Hook

```typescript
// src/queries/enrollments/useEnrollMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../infrastructure/apiClient';
import { useUIStore } from '../../stores/uiStore';

export function useEnrollMutation() {
  const qc        = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: (courseId: string) =>
      apiClient.post(`/courses/${courseId}/enroll`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-enrollments'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      showToast('Enrollment request submitted!', 'success');
    },
    onError: (err: any) => {
      showToast(err.message ?? 'Failed to submit enrollment.', 'error');
    },
  });
}
```

---

## 7. Offline Architecture

### Strategy Overview

```
App launches
      |
      +-- MMKV hydrates Zustand stores synchronously (no flash)
      |
      +-- TanStack Query reads MMKV-persisted cache (stale-while-revalidate)
      |
      +-- NetInfo checks connectivity
            |
       Online? --> fetch fresh data in background, update cache
            |
       Offline? --> serve stale cache, show offline banner
                    queue mutations (profile edits) for later
```

### What Is Cached Offline

| Data | Cache Strategy | Duration |
|------|---------------|----------|
| Course catalog (published) | TanStack Query + MMKV persister | 24 hours |
| Course detail + semester/subject tree | TanStack Query + MMKV persister | 24 hours |
| My enrollments | TanStack Query + MMKV persister | 24 hours |
| Course progress | TanStack Query + MMKV persister | 24 hours |
| Notifications | TanStack Query + MMKV persister | 24 hours |
| User profile | Zustand authStore + MMKV | Until logout |
| Profile edits (offline) | syncQueueStore + MMKV | Until synced |
| Downloaded attachments | react-native-fs local files | Explicit user delete |

### `useOffline.ts`

```typescript
// src/hooks/useOffline.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useSyncQueueStore } from '../stores/syncQueueStore';
import { useProfileSyncService } from '../queries/users/useUpdateProfileMutation';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const syncProfile = useProfileSyncService();
  const queue       = useSyncQueueStore((s) => s.queue);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);

      // When connectivity restores, flush the offline sync queue
      if (online && queue.some(e => e.status === 'pending')) {
        syncProfile.flushQueue();
      }
    });
    return unsubscribe;
  }, [queue]);

  return { isOnline };
}
```

### Offline Sync Service (Profile Edits — FR-STU-004)

```typescript
// src/queries/users/useUpdateProfileMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../infrastructure/apiClient';
import { useSyncQueueStore } from '../../stores/syncQueueStore';
import { useOffline } from '../../hooks/useOffline';

export function useUpdateProfileMutation() {
  const qc        = useQueryClient();
  const { isOnline } = useOffline();
  const { enqueue, setStatus, remove } = useSyncQueueStore();

  return {
    mutate: async (payload: { firstName?: string; lastName?: string; profilePhotoUrl?: string }) => {
      if (!isOnline) {
        // Offline: queue locally and show pending status to user
        enqueue({ payload });
        return { status: 'queued' };
      }
      // Online: post immediately
      const { data } = await apiClient.patch('/me', payload);
      qc.invalidateQueries({ queryKey: ['profile'] });
      return data;
    },

    flushQueue: async () => {
      const pending = useSyncQueueStore.getState().queue.filter(e => e.status === 'pending');
      for (const item of pending) {
        setStatus(item.id, 'uploading');
        try {
          await apiClient.patch('/me', item.payload);
          setStatus(item.id, 'uploaded');
          qc.invalidateQueries({ queryKey: ['profile'] });
        } catch {
          setStatus(item.id, 'failed');
        }
      }
    },
  };
}
```

---

## 8. Navigation Architecture

### Navigator Hierarchy

```
RootNavigator
├── SplashScreen                      (shown while MMKV hydrates)
├── AuthNavigator (Stack)             ← no session
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── PendingApprovalScreen         ← status = pending_approval
│
├── StudentNavigator (Bottom Tabs)    ← role = student + status = approved
│   ├── Tab: Catalog
│   │   └── CourseCatalogScreen
│   │       └── CourseDetailScreen (Stack)
│   ├── Tab: My Courses
│   │   └── MyCoursesScreen
│   │       ├── CourseProgressScreen (Stack)
│   │       └── SubjectPlayerScreen  (Stack, full-screen modal)
│   ├── Tab: Notifications
│   │   └── NotificationsScreen
│   └── Tab: Profile
│       └── ProfileScreen
│
├── AdminNavigator (Bottom Tabs)      ← role = admin | super_admin
│   ├── Tab: Dashboard
│   │   └── DashboardScreen
│   ├── Tab: Courses
│   │   └── CourseListScreen
│   │       ├── CourseEditorScreen (Stack)
│   │       │   ├── SemesterEditorScreen
│   │       │   └── SubjectEditorScreen
│   │       └── CourseDetailScreen (preview)
│   ├── Tab: Approvals
│   │   ├── RegistrationQueueScreen
│   │   └── EnrollmentQueueScreen
│   ├── Tab: Students
│   │   └── StudentListScreen
│   │       └── StudentDetailScreen (Stack)
│   └── Tab: Notifications
│       └── NotificationsScreen
│
└── SuperAdminNavigator               ← role = super_admin (extends AdminNavigator)
    └── Tab: Admin Mgmt (extra tab)
        ├── AdminListScreen
        ├── CreateAdminScreen (Stack)
        └── AuditLogScreen
```

### `navigation/types.ts`

```typescript
// src/navigation/types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login:             undefined;
  Register:          undefined;
  ForgotPassword:    undefined;
  PendingApproval:   undefined;
};

export type StudentTabParamList = {
  CatalogTab:        undefined;
  MyCoursesTab:      undefined;
  NotificationsTab:  undefined;
  ProfileTab:        undefined;
};

export type CatalogStackParamList = {
  CourseCatalog:     undefined;
  CourseDetail:      { courseId: string };
};

export type MyCoursesStackParamList = {
  MyCourses:         undefined;
  CourseProgress:    { courseId: string; courseTitle: string };
  SubjectPlayer:     { subjectId: string; courseId: string; semesterName: string };
};

export type AdminTabParamList = {
  Dashboard:         undefined;
  Courses:           undefined;
  Approvals:         undefined;
  Students:          undefined;
  Notifications:     undefined;
};

export type CoursesMgmtStackParamList = {
  CourseList:        undefined;
  CourseEditor:      { courseId?: string };   // undefined = new
  SemesterEditor:    { courseId: string; semesterId?: string };
  SubjectEditor:     { semesterId: string; subjectId?: string };
};

export type StudentMgmtStackParamList = {
  StudentList:       undefined;
  StudentDetail:     { uid: string };
};

export type SuperAdminStackParamList = {
  AdminList:         undefined;
  CreateAdmin:       undefined;
  AdminDetail:       { uid: string };
  AuditLog:          undefined;
};

// Screen prop helpers
export type LoginScreenProps   = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type SubjectPlayerProps = NativeStackScreenProps<MyCoursesStackParamList, 'SubjectPlayer'>;
export type CourseEditorProps  = NativeStackScreenProps<CoursesMgmtStackParamList, 'CourseEditor'>;
```

---

## 9. Authentication Flow

### Firebase Auth Integration

```typescript
// src/infrastructure/firebaseAuth.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { useAuthStore } from '../stores/authStore';
import apiClient from './apiClient';

// Called once at app root — listens for Firebase Auth state changes
export function bootstrapAuth(onReady: () => void) {
  return auth().onAuthStateChanged(async (firebaseUser: FirebaseAuthTypes.User | null) => {
    if (!firebaseUser) {
      useAuthStore.getState().clearAuth();
      onReady();
      return;
    }
    try {
      // Fetch backend profile to get role + status
      const { data } = await apiClient.get('/me');
      useAuthStore.getState().setUser(data);
    } catch {
      // Token may be revoked — clear auth
      useAuthStore.getState().clearAuth();
      await auth().signOut();
    }
    onReady();
  });
}

export async function loginWithEmail(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
}

export async function logout() {
  await apiClient.post('/auth/logout').catch(() => {}); // best-effort server revoke
  await auth().signOut();
}

export async function sendPasswordReset(email: string) {
  await apiClient.post('/auth/password-reset', { email });
}
```

### Auth Gate in RootNavigator

```typescript
// src/app/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { bootstrapAuth } from '../infrastructure/firebaseAuth';
import { useAuthStore } from '../stores/authStore';
import { AuthNavigator } from '../navigation/AuthNavigator';
import { StudentNavigator } from '../navigation/StudentNavigator';
import { AdminNavigator } from '../navigation/AdminNavigator';
import { SuperAdminNavigator } from '../navigation/SuperAdminNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';

export function RootNavigator() {
  const [ready, setReady] = useState(false);
  const { user, role, status, isHydrated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = bootstrapAuth(() => setReady(true));
    return unsubscribe;
  }, []);

  // Wait for MMKV hydration + Firebase auth check
  if (!isHydrated || !ready) return <SplashScreen />;

  if (!user) return <AuthNavigator />;

  if (status === 'pending_approval') return <PendingApprovalScreen />;
  if (status === 'rejected')         return <AuthNavigator />;  // show login with message
  if (status === 'suspended')        return <AuthNavigator />;

  if (role === 'super_admin')        return <SuperAdminNavigator />;
  if (role === 'admin')              return <AdminNavigator />;
  return <StudentNavigator />;
}
```

---

## 10. Theme System and Dark Mode

### `theme/colors.ts`

```typescript
// src/theme/colors.ts
export const lightColors = {
  // Background
  background:      '#FFFFFF',
  surface:         '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  // Text
  textPrimary:     '#0F172A',
  textSecondary:   '#475569',
  textDisabled:    '#94A3B8',
  textInverse:     '#FFFFFF',
  // Brand
  primary:         '#2563EB',
  primaryHover:    '#1D4ED8',
  primaryForeground:'#FFFFFF',
  // States
  success:         '#16A34A',
  successBg:       '#F0FDF4',
  warning:         '#D97706',
  warningBg:       '#FFFBEB',
  error:           '#DC2626',
  errorBg:         '#FEF2F2',
  info:            '#0284C7',
  // Borders
  border:          '#E2E8F0',
  borderFocus:     '#2563EB',
  // Status badge colours
  draft:           '#6366F1',
  published:       '#16A34A',
  archived:        '#64748B',
  pending:         '#D97706',
  approved:        '#16A34A',
  rejected:        '#DC2626',
};

export const darkColors: typeof lightColors = {
  background:       '#0F172A',
  surface:          '#1E293B',
  surfaceElevated:  '#334155',
  textPrimary:      '#F1F5F9',
  textSecondary:    '#94A3B8',
  textDisabled:     '#475569',
  textInverse:      '#0F172A',
  primary:          '#3B82F6',
  primaryHover:     '#60A5FA',
  primaryForeground:'#0F172A',
  success:          '#22C55E',
  successBg:        '#052E16',
  warning:          '#F59E0B',
  warningBg:        '#1C1400',
  error:            '#EF4444',
  errorBg:          '#2D0000',
  info:             '#38BDF8',
  border:           '#334155',
  borderFocus:      '#3B82F6',
  draft:            '#818CF8',
  published:        '#22C55E',
  archived:         '#94A3B8',
  pending:          '#F59E0B',
  approved:         '#22C55E',
  rejected:         '#EF4444',
};
```

### `tailwind.config.js`

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',             // NativeWind uses className="dark:..." with colorScheme
  theme: {
    extend: {
      colors: {
        primary:    '#2563EB',
        surface:    '#F8FAFC',
        muted:      '#94A3B8',
        success:    '#16A34A',
        warning:    '#D97706',
        danger:     '#DC2626',
      },
      fontFamily: {
        sans:   ['Inter-Regular'],
        medium: ['Inter-Medium'],
        bold:   ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};
```

### Theme Provider

```typescript
// src/app/ThemeProvider.tsx
import React, { useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { syncSystem } = useThemeStore();
  const systemScheme   = useColorScheme();

  useEffect(() => {
    syncSystem();
    const sub = Appearance.addChangeListener(syncSystem);
    return () => sub.remove();
  }, [systemScheme]);

  return <>{children}</>;
}
```

### Using Theme in Components

```typescript
// Example component using NativeWind + theme
import { useThemeStore } from '../stores/themeStore';

function Card({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === 'dark';

  return (
    <View className={`rounded-xl p-4 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
      {children}
    </View>
  );
}
```

---

## 11. Responsive Design and Screen Sizes

### Breakpoints

```typescript
// src/hooks/useBreakpoint.ts
import { useWindowDimensions } from 'react-native';

// Breakpoints aligned with Tailwind (adapted for dp)
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface BreakpointInfo {
  width:      number;
  height:     number;
  bp:         Breakpoint;
  isPhone:    boolean;   // width < 480
  isLargePhone: boolean; // 480 <= width < 768
  isTablet:   boolean;   // width >= 768
  isLandscape: boolean;
  // Responsive value helper
  val: <T>(values: { xs: T; sm?: T; md?: T; lg?: T }) => T;
}

export function useBreakpoint(): BreakpointInfo {
  const { width, height } = useWindowDimensions();

  const bp: Breakpoint =
    width < 360  ? 'xs' :
    width < 480  ? 'sm' :
    width < 768  ? 'md' :
    width < 1024 ? 'lg' : 'xl';

  return {
    width, height, bp,
    isPhone:      width < 480,
    isLargePhone: width >= 480 && width < 768,
    isTablet:     width >= 768,
    isLandscape:  width > height,
    val: (values) =>
      values[bp] ?? values['lg'] ?? values['md'] ?? values['sm'] ?? values['xs'],
  };
}
```

### Responsive Grid Usage

```typescript
// CourseCatalogScreen.tsx — responsive grid
import { useBreakpoint } from '../../hooks/useBreakpoint';

function CourseCatalogScreen() {
  const { isTablet, val } = useBreakpoint();

  const numColumns = val({ xs: 1, sm: 1, md: 2, lg: 3 });

  return (
    <FlatList
      data={courses}
      numColumns={numColumns}
      key={numColumns}                // force re-mount on column change
      renderItem={({ item }) => (
        <CourseCard
          course={item}
          style={{
            flex: 1,
            margin: isTablet ? 8 : 4,
            maxWidth: isTablet ? '33%' : '100%',
          }}
        />
      )}
    />
  );
}
```

### Safe Area and Status Bar

```typescript
// src/components/layout/ScreenContainer.tsx
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children:    React.ReactNode;
  scrollable?: boolean;
  padded?:     boolean;
  className?:  string;
}

export function ScreenContainer({ children, scrollable = true, padded = true, className }: Props) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      className={`flex-1 ${padded ? 'px-4' : ''} ${className ?? ''}`}
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      ) : content}
    </KeyboardAvoidingView>
  );
}
```

---

## 12. Reusable UI Components

### `Button.tsx`

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label:     string;
  onPress:   () => void;
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary active:bg-blue-700',
  secondary: 'bg-slate-100 dark:bg-slate-700 active:bg-slate-200',
  outline:   'border border-primary',
  ghost:     'bg-transparent',
  danger:    'bg-red-600 active:bg-red-700',
};
const textClasses: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-slate-800 dark:text-slate-100',
  outline:   'text-primary',
  ghost:     'text-primary',
  danger:    'text-white',
};
const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};
const textSizeClasses: Record<Size, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
};

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading, disabled, fullWidth, leftIcon,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#2563EB'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text className={`${textClasses[variant]} ${textSizeClasses[size]} ${leftIcon ? 'ml-2' : ''}`}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
```

### `TextInput.tsx`

```typescript
// src/components/ui/TextInput.tsx
import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, Text, View, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label?:       string;
  error?:       string;
  hint?:        string;
  required?:    boolean;
}

export const TextInput = forwardRef<RNTextInput, Props>(
  ({ label, error, hint, required, className, ...props }, ref) => {
    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
            {label}{required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}
        <RNTextInput
          ref={ref}
          className={[
            'px-4 py-3 rounded-xl text-base text-slate-900 dark:text-slate-100',
            'bg-slate-50 dark:bg-slate-800',
            error
              ? 'border-2 border-red-500'
              : 'border border-slate-200 dark:border-slate-600',
            'focus:border-primary dark:focus:border-blue-400',
            className ?? '',
          ].join(' ')}
          placeholderTextColor="#94A3B8"
          {...props}
        />
        {error && (
          <Text className="text-xs text-red-500 mt-1">{error}</Text>
        )}
        {hint && !error && (
          <Text className="text-xs text-slate-400 mt-1">{hint}</Text>
        )}
      </View>
    );
  }
);
```

### `Badge.tsx`

```typescript
// src/components/ui/Badge.tsx
import React from 'react';
import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'draft' | 'published' | 'archived' | 'pending' | 'approved' | 'rejected';

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  success:   { bg: 'bg-green-100 dark:bg-green-900',   text: 'text-green-700 dark:text-green-300' },
  warning:   { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  error:     { bg: 'bg-red-100 dark:bg-red-900',       text: 'text-red-700 dark:text-red-300' },
  info:      { bg: 'bg-blue-100 dark:bg-blue-900',     text: 'text-blue-700 dark:text-blue-300' },
  neutral:   { bg: 'bg-slate-100 dark:bg-slate-700',   text: 'text-slate-600 dark:text-slate-300' },
  draft:     { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-700 dark:text-indigo-300' },
  published: { bg: 'bg-green-100 dark:bg-green-900',   text: 'text-green-700 dark:text-green-300' },
  archived:  { bg: 'bg-slate-100 dark:bg-slate-700',   text: 'text-slate-600 dark:text-slate-300' },
  pending:   { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  approved:  { bg: 'bg-green-100 dark:bg-green-900',   text: 'text-green-700 dark:text-green-300' },
  rejected:  { bg: 'bg-red-100 dark:bg-red-900',       text: 'text-red-700 dark:text-red-300' },
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  const { bg, text } = variantClasses[variant];
  return (
    <View className={`px-2.5 py-0.5 rounded-full self-start ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
```

### `EmptyState.tsx`

```typescript
// src/components/ui/EmptyState.tsx
import React from 'react';
import { Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from './Button';

interface Props {
  icon:        string;
  title:       string;
  description?: string;
  actionLabel?: string;
  onAction?:   () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <MaterialCommunityIcons name={icon} size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
      <Text className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">{title}</Text>
      {description && (
        <Text className="text-base text-slate-500 dark:text-slate-400 text-center mb-6">{description}</Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} />
      )}
    </View>
  );
}
```

### `ProgressBar.tsx`

```typescript
// src/components/ui/ProgressBar.tsx
import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Props {
  percent:   number;    // 0-100
  showLabel?: boolean;
  color?:    string;
}

export function ProgressBar({ percent, showLabel = true, color = 'bg-primary' }: Props) {
  const animStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(Math.max(percent, 0), 100)}%` as any, { duration: 600 }),
  }));

  return (
    <View>
      {showLabel && (
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400">Progress</Text>
          <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">{percent.toFixed(1)}%</Text>
        </View>
      )}
      <View className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <Animated.View className={`h-full ${color} rounded-full`} style={animStyle} />
      </View>
    </View>
  );
}
```

### `InfiniteScrollList.tsx`

```typescript
// src/components/ui/InfiniteScrollList.tsx
import React from 'react';
import { ActivityIndicator, FlatList, FlatListProps, View } from 'react-native';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';

interface Props<T> extends Omit<FlatListProps<T>, 'data'> {
  data:             T[];
  isLoading:        boolean;
  isFetchingNextPage: boolean;
  hasNextPage?:     boolean;
  onEndReached:     () => void;
  emptyIcon:        string;
  emptyTitle:       string;
  emptyDescription?: string;
  skeletonCount?:   number;
}

export function InfiniteScrollList<T extends { id: string }>({
  data, isLoading, isFetchingNextPage, hasNextPage, onEndReached,
  emptyIcon, emptyTitle, emptyDescription, skeletonCount = 5, ...rest
}: Props<T>) {
  if (isLoading) {
    return (
      <View className="p-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl mb-3" />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" className="my-4" />
        ) : null
      }
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  );
}
```

---

## 13. Screen Catalogue — Student Role

### `LoginScreen.tsx`

```typescript
// src/screens/auth/LoginScreen.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { TextInput } from '../../components/ui/TextInput';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Button } from '../../components/ui/Button';
import { loginWithEmail } from '../../infrastructure/firebaseAuth';
import { useUIStore } from '../../stores/uiStore';
import type { LoginScreenProps } from '../../navigation/types';

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const showToast = useUIStore((s) => s.showToast);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      await loginWithEmail(email, password);
      // onAuthStateChanged in RootNavigator handles redirect
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-disabled')      showToast('Your account has been suspended.', 'error');
      else if (code === 'auth/invalid-credential') showToast('Invalid email or password.', 'error');
      else showToast('Login failed. Please try again.', 'error');
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View className="flex-1 justify-center">
        {/* Logo / Heading */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</Text>
          <Text className="text-base text-slate-500 dark:text-slate-400 mt-2">
            Sign in to your CMP account
          </Text>
        </View>

        {/* Form */}
        <Controller
          control={control} name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              label="Email" required
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control} name="password"
          render={({ field: { onChange, value, onBlur } }) => (
            <PasswordInput
              label="Password" required
              value={value} onChangeText={onChange} onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Button
          label="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          fullWidth
          size="lg"
        />

        <Button
          label="Forgot password?"
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
          fullWidth
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500 dark:text-slate-400">Don't have an account? </Text>
          <Text
            className="text-primary font-semibold"
            onPress={() => navigation.navigate('Register')}
          >
            Register
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
```

### `SubjectPlayerScreen.tsx` — Core Learning Screen

```typescript
// src/screens/student/SubjectPlayerScreen.tsx
import React, { useCallback, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { YouTubePlayer } from '../../components/player/YouTubePlayer';
import { AttachmentList } from '../../components/player/AttachmentList';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useSubjectProgressQuery } from '../../queries/progress/useSubjectProgressQuery';
import { useMarkCompleteMutation } from '../../queries/progress/useMarkCompleteMutation';
import type { SubjectPlayerProps } from '../../navigation/types';

export function SubjectPlayerScreen({ route, navigation }: SubjectPlayerProps) {
  const { subjectId, courseId, semesterName } = route.params;
  const { data: progress } = useSubjectProgressQuery(subjectId);
  const markComplete = useMarkCompleteMutation();
  const isCompleted = progress?.state === 'completed';

  const handleAutoComplete = useCallback(() => {
    if (!isCompleted) {
      markComplete.mutate({ subjectId, source: 'auto' });
    }
  }, [subjectId, isCompleted]);

  const handleManualComplete = () => {
    markComplete.mutate({ subjectId, source: 'manual' });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <Text className="text-xs text-slate-500 dark:text-slate-400 mb-2">{semesterName}</Text>

        {/* Video Player */}
        <YouTubePlayer
          videoId={route.params.youtubeVideoId}
          onNinetyPercent={handleAutoComplete}
        />

        {/* Subject title + status */}
        <View className="flex-row items-center justify-between mt-4 mb-2">
          <Text className="text-xl font-bold text-slate-900 dark:text-white flex-1 mr-2">
            {route.params.title}
          </Text>
          {isCompleted && <Badge label="Completed" variant="success" />}
        </View>

        <Text className="text-base text-slate-600 dark:text-slate-300 mb-4">
          {route.params.description}
        </Text>

        {/* Attachments */}
        <AttachmentList
          attachments={route.params.attachments ?? []}
          subjectId={subjectId}
          courseId={courseId}
        />

        {/* Mark complete button */}
        {!isCompleted && (
          <Button
            label="Mark as Complete"
            onPress={handleManualComplete}
            loading={markComplete.isPending}
            fullWidth
            size="lg"
          />
        )}

        {isCompleted && (
          <Button
            label="Back to Course"
            variant="secondary"
            onPress={() => navigation.goBack()}
            fullWidth
            size="lg"
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
```

### `CourseCatalogScreen.tsx`

Key features: infinite scroll, search, responsive grid, offline-first cache.

```typescript
// src/screens/student/CourseCatalogScreen.tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { SearchBar } from '../../components/ui/SearchBar';
import { InfiniteScrollList } from '../../components/ui/InfiniteScrollList';
import { CourseCard } from '../../components/course/CourseCard';
import { useCoursesQuery } from '../../queries/courses/useCoursesQuery';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export function CourseCatalogScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const { isTablet } = useBreakpoint();
  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage,
  } = useCoursesQuery({ q: search || undefined });

  const courses = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <ScreenContainer padded={false}>
      <View className="px-4 pt-4">
        <SearchBar
          placeholder="Search courses..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <InfiniteScrollList
        data={courses}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onEndReached={fetchNextPage}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet' : 'phone'}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        emptyIcon="book-open-variant"
        emptyTitle="No courses found"
        emptyDescription="Check back later for new courses"
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </ScreenContainer>
  );
}
```

---

## 14. Screen Catalogue — Admin Role

### `RegistrationQueueScreen.tsx`

```typescript
// src/screens/admin/RegistrationQueueScreen.tsx
import React from 'react';
import { Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { InfiniteScrollList } from '../../components/ui/InfiniteScrollList';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAdminRegistrationQueueQuery } from '../../queries/registrations/useAdminRegistrationQueueQuery';
import { useApproveRegistrationMutation } from '../../queries/registrations/useApproveRegistrationMutation';
import { useRejectRegistrationMutation } from '../../queries/registrations/useRejectRegistrationMutation';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

export function RegistrationQueueScreen() {
  const { confirm, confirmDialog, closeDialog } = useConfirmDialog();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAdminRegistrationQueueQuery({ status: 'pending' });
  const approve = useApproveRegistrationMutation();
  const reject  = useRejectRegistrationMutation();

  const registrations = data?.pages.flatMap(p => p.items) ?? [];

  return (
    <ScreenContainer padded={false}>
      <InfiniteScrollList
        data={registrations}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onEndReached={fetchNextPage}
        contentContainerStyle={{ padding: 16 }}
        emptyIcon="account-clock"
        emptyTitle="No pending registrations"
        emptyDescription="All caught up!"
        renderItem={({ item }) => (
          <View className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900 dark:text-white">
                  {item.firstName} {item.lastName}
                </Text>
                <Text className="text-sm text-slate-500 dark:text-slate-400">{item.email}</Text>
                <Text className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(item.submittedAt).toLocaleDateString()}
                </Text>
              </View>
              <Badge label="Pending" variant="pending" />
            </View>
            <View className="flex-row gap-3 mt-4">
              <Button
                label="Approve"
                variant="primary"
                size="sm"
                loading={approve.isPending}
                onPress={() => confirm({
                  title:       'Approve Registration',
                  message:     `Approve ${item.firstName}'s account?`,
                  confirmLabel:'Approve',
                  onConfirm:   () => approve.mutate(item.id),
                })}
              />
              <Button
                label="Reject"
                variant="danger"
                size="sm"
                onPress={() => confirm({
                  title:       'Reject Registration',
                  message:     `Reject ${item.firstName}'s account? This cannot be undone.`,
                  confirmLabel:'Reject',
                  destructive: true,
                  onConfirm:   () => reject.mutate(item.id),
                })}
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      <ConfirmDialog {...confirmDialog} onCancel={closeDialog} />
    </ScreenContainer>
  );
}
```

### Admin Dashboard Screen (quick metrics)

```typescript
// src/screens/admin/DashboardScreen.tsx
// Shows:
// - Pending registrations count badge (tappable -> RegistrationQueue)
// - Pending enrollments count badge (tappable -> EnrollmentQueue)
// - Published courses count
// - Recent notifications
// Implemented using usePendingCountsQuery (GET /admin/registrations?status=pending&limit=1 -> total)
```

---

## 15. Screen Catalogue — Super Admin Role

### `AuditLogScreen.tsx`

```typescript
// src/screens/superadmin/AuditLogScreen.tsx
// Features:
// - Infinite scroll of audit log entries (GET /audit-log)
// - Filter by actorUid, action type, target type, date range
// - Displays: actor email, action, target, timestamp
// - Uses useAuditLogQuery infinite query hook
```

### `AdminListScreen.tsx`

```typescript
// src/screens/superadmin/AdminListScreen.tsx
// Features:
// - List admin accounts with status badges (approved / suspended)
// - Search by name/email
// - Tap to view AdminDetailScreen
// - Suspend / Reactivate actions with ConfirmDialog
// - FAB (Floating Action Button) -> CreateAdminScreen
```

---

## 16. Firebase Integration

### `@react-native-firebase/auth` Setup

```typescript
// src/infrastructure/firebaseAuth.ts (extended)
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { secureStorage } from './secureStorage';

// Store FCM token securely and sync to backend profile
export async function registerFcmToken() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) return;

  const token = await messaging().getToken();
  if (token) {
    // Store locally
    await secureStorage.set('fcmToken', token);
    // Sync to backend — PATCH /me { fcmToken: token }
    await apiClient.patch('/me', { fcmToken: token }).catch(() => {});
  }

  // Handle token refresh
  return messaging().onTokenRefresh(async (newToken) => {
    await secureStorage.set('fcmToken', newToken);
    await apiClient.patch('/me', { fcmToken: newToken }).catch(() => {});
  });
}
```

### `secureStorage.ts`

```typescript
// src/infrastructure/secureStorage.ts
import * as Keychain from 'react-native-keychain';

// Wraps react-native-keychain for CMP-scoped key/value storage
// Uses Keychain on iOS, EncryptedSharedPreferences on Android
export const secureStorage = {
  set: async (key: string, value: string) => {
    await Keychain.setGenericPassword(key, value, {
      service:           `com.futurecx.cmp.${key}`,
      accessible:        Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel:     Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
  },
  get: async (key: string): Promise<string | null> => {
    const result = await Keychain.getGenericPassword({ service: `com.futurecx.cmp.${key}` });
    return result ? result.password : null;
  },
  remove: async (key: string) => {
    await Keychain.resetGenericPassword({ service: `com.futurecx.cmp.${key}` });
  },
};
```

---

## 17. Push Notification Integration (FCM + APNs)

### Notification Handler

```typescript
// src/infrastructure/notificationHandler.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { queryClient } from '../queries/queryClient';

type NotifPayload = {
  category: string;
  courseId?: string;
  enrollmentId?: string;
};

// Background + killed state handler (registered in index.js)
export function setupBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const payload = remoteMessage.data as NotifPayload;
    await displayLocalNotification(remoteMessage.notification?.title ?? '', remoteMessage.notification?.body ?? '', payload);
  });
}

// Foreground handler
export function useForegroundNotifications() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const payload = remoteMessage.data as NotifPayload;
      // Invalidate notifications query to update badge count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Show local notification while app is open
      await displayLocalNotification(
        remoteMessage.notification?.title ?? '',
        remoteMessage.notification?.body ?? '',
        payload
      );
    });
    return unsubscribe;
  }, []);
}

async function displayLocalNotification(title: string, body: string, payload: NotifPayload) {
  const channelId = await notifee.createChannel({
    id:         'cmp-main',
    name:       'CMP Notifications',
    importance: AndroidImportance.HIGH,
  });
  await notifee.displayNotification({
    title, body,
    data:    payload,
    android: { channelId, pressAction: { id: 'default' } },
    ios:     { sound: 'default' },
  });
}

// Deep link from notification tap
export function handleNotificationTap(navigation: any) {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    const payload = remoteMessage.data as NotifPayload;
    routeToPayload(navigation, payload);
  });

  messaging().getInitialNotification().then((remoteMessage) => {
    if (remoteMessage) routeToPayload(navigation, remoteMessage.data as NotifPayload);
  });
}

function routeToPayload(navigation: any, payload: NotifPayload) {
  if (payload.courseId && payload.category?.startsWith('enrollment')) {
    navigation.navigate('MyCourses');
  }
}
```

---

## 18. YouTube Player Integration

```typescript
// src/components/player/YouTubePlayer.tsx
import React, { useCallback, useRef } from 'react';
import { View, Text } from 'react-native';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface Props {
  videoId:         string;
  onNinetyPercent: () => void;   // Triggers FR-STU-013 auto-complete
}

export function YouTubePlayer({ videoId, onNinetyPercent }: Props) {
  const playerRef      = useRef<YoutubeIframeRef>(null);
  const triggered90    = useRef(false);
  const { width }      = useBreakpoint();

  // Poll playback to detect 90% threshold
  const onChangeState   = useCallback((state: string) => {
    if (state === 'playing') {
      const interval = setInterval(async () => {
        const current  = await playerRef.current?.getCurrentTime() ?? 0;
        const duration = await playerRef.current?.getDuration()    ?? 0;
        if (!triggered90.current && duration > 0 && current / duration >= 0.9) {
          triggered90.current = true;
          clearInterval(interval);
          onNinetyPercent();
        }
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [onNinetyPercent]);

  return (
    <View className="rounded-xl overflow-hidden bg-black">
      <YoutubePlayer
        ref={playerRef}
        height={width * (9 / 16)}    // 16:9 aspect ratio, full width
        videoId={videoId}
        onChangeState={onChangeState}
        webViewProps={{
          allowsFullscreenVideo:      true,
          allowsInlineMediaPlayback:  true,
          mediaPlaybackRequiresUserAction: false,
        }}
      />
    </View>
  );
}
```

---

## 19. Attachment Download Flow

```typescript
// src/components/player/AttachmentList.tsx
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { FileViewer } from 'react-native-file-viewer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import apiClient from '../../infrastructure/apiClient';
import { formatFileSize } from '../../utils/formatters';

interface Attachment {
  id: string; fileName: string; mimeType: string; sizeBytes: number;
}

export function AttachmentList({ attachments, subjectId, courseId }: {
  attachments: Attachment[]; subjectId: string; courseId: string;
}) {
  if (!attachments.length) return null;

  const handleDownload = async (attachment: Attachment) => {
    const localPath = `${RNFS.CachesDirectoryPath}/cmp/${attachment.id}_${attachment.fileName}`;
    const exists    = await RNFS.exists(localPath);

    if (!exists) {
      // Get signed download URL from backend
      const { data } = await apiClient.get(`/attachments/${attachment.id}/download-url`);
      const { downloadUrl } = data;

      // Download to local cache
      await RNFS.downloadFile({
        fromUrl:  downloadUrl,
        toFile:   localPath,
        mkdir:    true,
      }).promise;
    }

    // Open with device's file viewer
    await FileViewer.open(localPath, { showOpenWithDialog: true });
  };

  return (
    <View className="mt-4">
      <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
        Attachments ({attachments.length})
      </Text>
      {attachments.map((a) => (
        <TouchableOpacity
          key={a.id}
          onPress={() => handleDownload(a).catch(() =>
            Alert.alert('Error', 'Failed to open attachment. Please try again.')
          )}
          className="flex-row items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-2"
        >
          <MaterialCommunityIcons name="file-document-outline" size={24} className="text-primary mr-3" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-800 dark:text-slate-100" numberOfLines={1}>
              {a.fileName}
            </Text>
            <Text className="text-xs text-slate-400">{formatFileSize(a.sizeBytes)}</Text>
          </View>
          <MaterialCommunityIcons name="download-outline" size={20} className="text-slate-400" />
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

---

## 20. Offline-first Profile Editing (FR-STU-004)

The profile edit flow is fully offline-capable per the SRS requirement.

```
User edits profile (online or offline)
         |
     Online? ──Yes──> PATCH /me immediately
         |            invalidate profile query
         |
        No (offline)
         |
         +-> enqueue edit in syncQueueStore (MMKV-persisted)
         |   status = 'pending'
         |
         +-> show "Saved locally — will sync when online" toast
         |
         +-> ProfileScreen displays pending badge
         |
[Later: device comes online]
         |
NetInfo fires isConnected=true
         |
useOffline.ts calls syncProfile.flushQueue()
         |
for each pending item:
  PATCH /me with payload
  status = 'uploaded'  (on success)
  status = 'failed'    (on error)
         |
invalidate profile query -> refresh UI
show "Profile synced" toast
```

### Profile Screen with Sync Status

```typescript
// ProfileScreen shows sync queue status
const pendingEdits = useSyncQueueStore(s => s.queue.filter(e => e.status === 'pending'));
const failedEdits  = useSyncQueueStore(s => s.queue.filter(e => e.status === 'failed'));

// Render a status banner:
// "1 change pending sync" (orange)
// "1 change failed to sync — tap to retry" (red)
// "All changes synced" (green, auto-dismiss)
```

---

## 21. Testing Strategy

### Test Pyramid

```
             +------------------+
             |    E2E (Detox)   |    ~15 flows
             | Register, Login, |
             | Enroll, Complete |
             +------------------+
          +--|  Integration     |--+
          |  | React Query +    |  |  ~30 tests
          |  | API mocks (MSW)  |  |  (screens with query states)
          +--+------------------+--+
      +---|     Unit Tests          |---+
      |   | Zod schemas · formatters|   |  ~50+ tests
      |   | stores · components     |   |
      +---+-------------------------+---+
```

### Unit Tests — Form Validation (Zod Schemas)

```typescript
// src/domain/__tests__/schemas.test.ts
import { registerSchema, loginSchema, profileUpdateSchema } from '../schemas';

describe('registerSchema', () => {
  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse({
      firstName: 'Viruli',
      lastName:  'Weerasinghe',
      email:     'viruli@example.com',
      password:  'SecurePass@2026',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase', () => {
    const result = registerSchema.safeParse({
      firstName: 'Viruli', lastName: 'W', email: 'v@e.com', password: 'lowercase@2026',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/uppercase/i);
  });

  it('rejects password shorter than 10 characters', () => {
    const result = registerSchema.safeParse({
      firstName: 'V', lastName: 'W', email: 'v@e.com', password: 'Short@1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      firstName: 'V', lastName: 'W', email: 'not-an-email', password: 'SecurePass@2026',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });
});

describe('profileUpdateSchema', () => {
  it('allows partial update with only firstName', () => {
    const result = profileUpdateSchema.safeParse({ firstName: 'Viruli' });
    expect(result.success).toBe(true);
  });

  it('rejects empty firstName', () => {
    const result = profileUpdateSchema.safeParse({ firstName: '' });
    expect(result.success).toBe(false);
  });
});
```

### Unit Tests — Zustand Store

```typescript
// src/stores/__tests__/syncQueueStore.test.ts
import { useSyncQueueStore } from '../syncQueueStore';

describe('syncQueueStore', () => {
  beforeEach(() => useSyncQueueStore.setState({ queue: [] }));

  it('enqueues a profile edit with pending status', () => {
    useSyncQueueStore.getState().enqueue({ payload: { firstName: 'Viruli' } });
    const queue = useSyncQueueStore.getState().queue;
    expect(queue).toHaveLength(1);
    expect(queue[0].status).toBe('pending');
    expect(queue[0].payload.firstName).toBe('Viruli');
  });

  it('updates status of an item', () => {
    useSyncQueueStore.getState().enqueue({ payload: { firstName: 'V' } });
    const id = useSyncQueueStore.getState().queue[0].id;
    useSyncQueueStore.getState().setStatus(id, 'uploaded');
    expect(useSyncQueueStore.getState().queue[0].status).toBe('uploaded');
  });

  it('clears uploaded items', () => {
    useSyncQueueStore.getState().enqueue({ payload: { firstName: 'V' } });
    const id = useSyncQueueStore.getState().queue[0].id;
    useSyncQueueStore.getState().setStatus(id, 'uploaded');
    useSyncQueueStore.getState().clearUploaded();
    expect(useSyncQueueStore.getState().queue).toHaveLength(0);
  });
});
```

### Integration Test — Student Enrollment Flow (core screen flow)

```typescript
// src/screens/student/__tests__/enrollmentFlow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CourseDetailScreen } from '../CourseDetailScreen';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../queries/queryClient';

const server = setupServer(
  rest.get('*/courses/course-abc', (req, res, ctx) =>
    res(ctx.json({
      id: 'course-abc', title: 'TypeScript Basics',
      state: 'published', description: 'Learn TS', semesters: [],
    }))
  ),
  rest.post('*/courses/course-abc/enroll', (req, res, ctx) =>
    res(ctx.status(201), ctx.json({ id: 'enr-1', courseId: 'course-abc', state: 'pending' }))
  ),
  rest.get('*/me/enrollments', (req, res, ctx) =>
    res(ctx.json({ items: [], nextCursor: null, total: 0 }))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

it('shows Enroll button and submits enrollment request', async () => {
  const { getByText, getByTestId } = render(
    <CourseDetailScreen route={{ params: { courseId: 'course-abc' } } as any} navigation={{} as any} />,
    { wrapper }
  );

  await waitFor(() => expect(getByText('TypeScript Basics')).toBeTruthy());

  const enrollBtn = getByTestId('enroll-button');
  expect(enrollBtn).toBeTruthy();

  fireEvent.press(enrollBtn);

  await waitFor(() => {
    expect(getByText('Enrollment request submitted!')).toBeTruthy();
  });
});
```

### Detox E2E Tests (Core Flows)

```typescript
// e2e/flows/registration.e2e.ts
// Flow: Launch app -> Register -> See PendingApproval screen

// e2e/flows/login.e2e.ts
// Flow: Launch app -> Login -> See Dashboard -> Logout

// e2e/flows/enrollment.e2e.ts
// Flow: Login as student -> Browse catalog -> View course -> Enroll -> See pending status

// e2e/flows/subjectComplete.e2e.ts
// Flow: Login -> My Courses -> Open enrolled course -> Open subject -> Mark complete -> Progress updated

// e2e/flows/offlineProfileEdit.e2e.ts
// Flow: Disable network -> Edit profile -> See "pending" status -> Enable network -> See "synced"
```

---

## 22. Environment Configuration

```bash
# .env.development
API_BASE_URL=http://localhost:3000/api/v1
FIREBASE_API_KEY=AIzaSy...dev
FIREBASE_AUTH_DOMAIN=cmp-dev.firebaseapp.com
FIREBASE_PROJECT_ID=cmp-dev
FIREBASE_STORAGE_BUCKET=cmp-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abc123
ENABLE_FLIPPER=true

# .env.staging
API_BASE_URL=https://api-staging.yourdomain.com/api/v1
FIREBASE_PROJECT_ID=cmp-staging
# ... staging Firebase config

# .env.production
API_BASE_URL=https://api.yourdomain.com/api/v1
FIREBASE_PROJECT_ID=cmp-production
# ... production Firebase config
ENABLE_FLIPPER=false
```

### `domain/constants.ts`

```typescript
// src/domain/constants.ts
import Config from 'react-native-config';

export const AppConfig = {
  API_BASE_URL:   Config.API_BASE_URL ?? 'http://localhost:3000/api/v1',
  MAX_FILE_SIZE:  25 * 1024 * 1024,   // 25 MB (match backend)
  QUERY_STALE_MS: 5 * 60 * 1000,
  QUERY_GC_MS:    24 * 60 * 60 * 1000,
};

export const API_PATHS = {
  REGISTER:           '/auth/register',
  LOGOUT:             '/auth/logout',
  PASSWORD_RESET:     '/auth/password-reset',
  ME:                 '/me',
  CHANGE_PASSWORD:    '/me/change-password',
  COURSES:            '/courses',
  MY_ENROLLMENTS:     '/me/enrollments',
  MY_NOTIFICATIONS:   '/me/notifications',
  ADMIN_REGISTRATIONS:'/admin/registrations',
  ADMIN_ENROLLMENTS:  '/admin/enrollments',
  USERS:              '/users',
  SUPER_ADMIN_ADMINS: '/super-admin/admins',
  AUDIT_LOG:          '/audit-log',
} as const;
```

---

## 23. Build and CI/CD

### Package.json Scripts

```json
{
  "scripts": {
    "start":           "react-native start",
    "android":         "react-native run-android",
    "ios":             "react-native run-ios",
    "test":            "jest --coverage",
    "test:e2e:ios":    "detox test --configuration ios.sim.release",
    "test:e2e:android":"detox test --configuration android.emu.release",
    "lint":            "eslint src --ext .ts,.tsx",
    "type-check":      "tsc --noEmit",
    "build:ios":       "react-native build-ios --mode Release",
    "build:android":   "cd android && ./gradlew assembleRelease"
  }
}
```

### CI/CD Pipeline

```
On every PR:
  1. npm ci
  2. tsc --noEmit (type-check)
  3. ESLint
  4. Jest unit + integration tests (coverage >= 75%)

On merge to main:
  5. Build Android APK (Fastlane / Gradle)
  6. Build iOS IPA (Fastlane / Xcode)
  7. Detox E2E tests on simulators
  8. Upload to Firebase App Distribution (staging)

On release tag (vX.Y.Z):
  9. Upload to Google Play (internal track)
  10. Upload to App Store Connect (TestFlight)
  11. Slack notification with build link
```

---

## 24. SRS Requirement Traceability

| SRS Requirement | Screen / Component | Implementation |
|-----------------|-------------------|----------------|
| FR-AUTH-001 Student register | `RegisterScreen` | `useRegisterMutation` → `POST /auth/register`; Zod `registerSchema` |
| FR-AUTH-002 Password strength | `RegisterScreen`, `PasswordInput` | `registerSchema` — min 10, upper, lower, digit, symbol |
| FR-AUTH-003 Pending approval | `PendingApprovalScreen` | Auth gate in `RootNavigator` checks `status === 'pending_approval'` |
| FR-AUTH-004 Login | `LoginScreen` | Firebase Auth `signInWithEmailAndPassword` + status check |
| FR-AUTH-005 Password reset | `ForgotPasswordScreen` | `POST /auth/password-reset` |
| FR-AUTH-006 Logout | Profile tab → Logout button | `logout()` → `POST /auth/logout` + `auth().signOut()` |
| FR-AUTH-007 Token verification | `apiClient.ts` | Firebase token attached via Axios interceptor on every request |
| FR-AUTH-008 Lockout after 10 attempts | Firebase Auth | Server-side `TrackLoginAttemptsUseCase`; client shows generic error |
| FR-STU-001 Registration | `RegisterScreen` | Full form with real-time Zod validation |
| FR-STU-003 Edit profile | `ProfileScreen` | `useUpdateProfileMutation` → `PATCH /me` |
| FR-STU-004 Offline profile editing | `ProfileScreen`, `syncQueueStore` | MMKV-persisted edit queue; flushed on reconnect |
| FR-STU-005 Browse published courses | `CourseCatalogScreen` | `useCoursesQuery` → `GET /courses`; cached offline 24h |
| FR-STU-006 View course detail | `CourseDetailScreen` | `useCourseDetailQuery` → `GET /courses/:id` |
| FR-STU-007 Apply for enrollment | `CourseDetailScreen` | `useEnrollMutation` → `POST /courses/:id/enroll` |
| FR-STU-008 View enrolled courses | `MyCoursesScreen` | `useMyEnrollmentsQuery` → `GET /me/enrollments` |
| FR-STU-009 Continue learning | `MyCoursesScreen` | Reads `lastAccessedSubjectId` from course progress; deep links to `SubjectPlayerScreen` |
| FR-STU-010 Consume lesson content | `SubjectPlayerScreen` | `YouTubePlayer` + `AttachmentList` (signed download URLs) |
| FR-STU-011 Mark subject complete | `SubjectPlayerScreen` | `useMarkCompleteMutation` → `POST /progress/subjects/:id/complete` |
| FR-STU-012 View course progress | `CourseProgressScreen` | `useCourseProgressQuery` → `GET /me/progress/courses/:id`; `ProgressBar` component |
| FR-STU-013 Auto-complete on 90% watch | `YouTubePlayer` | 3-second polling; calls `onNinetyPercent` → `markComplete({ source: 'auto' })` |
| FR-ENR-001 Registration queue | `RegistrationQueueScreen` | `useAdminRegistrationQueueQuery` → `GET /admin/registrations` |
| FR-ENR-002 Approve registration | `RegistrationQueueScreen` | `useApproveRegistrationMutation` → `POST /admin/registrations/:id/approve` |
| FR-ENR-003 Reject registration | `RegistrationQueueScreen` | `useRejectRegistrationMutation` → `POST /admin/registrations/:id/reject` |
| FR-ENR-004 Submit enrollment | `CourseDetailScreen` | `useEnrollMutation`; prevents duplicate via server 409 handling |
| FR-ENR-005 Enrollment queue | `EnrollmentQueueScreen` | `useAdminEnrollmentQueueQuery` → `GET /admin/enrollments` |
| FR-ENR-006 Approve enrollment | `EnrollmentQueueScreen` | `useApproveEnrollmentMutation` → `POST /admin/enrollments/:id/approve` |
| FR-ENR-007 Reject enrollment | `EnrollmentQueueScreen` | `useRejectEnrollmentMutation` → with optional reason |
| FR-ENR-009 Withdraw enrollment | `MyCoursesScreen` | `useWithdrawMutation` → `POST /enrollments/:id/withdraw` |
| FR-ENR-011 Bulk approve | `RegistrationQueueScreen` | `useBulkApproveRegistrationsMutation` → `POST /admin/registrations/bulk-approve` |
| FR-NOT-001 View notifications | `NotificationsScreen` | `useNotificationsQuery` → `GET /me/notifications`; `unreadCount` badge on tab |
| FR-NOT-006 Mark notification read | `NotificationItem` | `useMarkReadMutation` → `POST /me/notifications/:id/read`; "Mark all read" button |
| FR-NOT-007 Push notifications | `notificationHandler.ts` | FCM + APNs integration; `@notifee/react-native` for local display |
| FR-CRS-001 Create course | `CourseEditorScreen` | `useCreateCourseMutation` → `POST /courses`; form with Zod validation |
| FR-CRS-004 Publish course | `CourseEditorScreen` | `usePublishCourseMutation` → `POST /courses/:id/publish` |
| FR-CRS-006 Add semester | `SemesterEditorScreen` | `useCreateSemesterMutation` → `POST /courses/:id/semesters` |
| FR-CRS-008 Add subject | `SubjectEditorScreen` | `useCreateSubjectMutation` → `POST /semesters/:id/subjects` |
| FR-CRS-009 YouTube validation | `SubjectEditorScreen` | Zod `youtubeUrlSchema` validates on client; server validates on save |
| FR-CRS-010 Attachment upload | `SubjectEditorScreen` | `POST /subjects/:id/attachments` via signed URL; MIME + size validation |
| FR-ADM-009 View student list | `StudentListScreen` | `useUserListQuery` → `GET /users`; search + status filter |
| FR-ADM-010 Suspend student | `StudentDetailScreen` | `useSuspendUserMutation` → `POST /users/:uid/suspend` with `ConfirmDialog` |
| FR-ADM-011 Bulk approve | `RegistrationQueueScreen` | Select all button + bulk approve mutation |
| FR-SADM-001 Create admin | `CreateAdminScreen` | `useCreateAdminMutation` → `POST /super-admin/admins` |
| FR-SADM-002 List admins | `AdminListScreen` | `useAdminListQuery` → `GET /super-admin/admins` |
| FR-SADM-003 Suspend admin | `AdminListScreen` | `useSuspendAdminMutation` → `POST /super-admin/admins/:uid/suspend` |
| FR-SADM-007 View audit log | `AuditLogScreen` | `useAuditLogQuery` → `GET /audit-log` with filters |
| NFR-SEC-013 Mobile secure storage | `secureStorage.ts` | `react-native-keychain` — Keychain (iOS), EncryptedSharedPreferences (Android) |
| NFR-USB-001 Responsive | All screens | `useBreakpoint` hook; NativeWind responsive classes; tablet grid |
| NFR-USB-006 Loading states | All screens | `Skeleton`, `ActivityIndicator`, `LoadingOverlay` components |
| NFR-USB-007 Empty states | All list screens | `EmptyState` component with icon + action button |
| NFR-USB-008 Destructive confirmations | Suspend / Reject / Delete actions | `ConfirmDialog` with explicit cancel |
| NFR-SCL-006 Offline availability | Offline architecture | TanStack Query + MMKV persister; `syncQueueStore` for writes |

---

*© 2026 Future CX Lanka (Pvt) Ltd — Confidential*
*Document version: 1.0.0 | Paired with SRS dated 07 May 2026, CMP Backend Blueprint v1.0.0, and CMP API Reference v1.0.0*
