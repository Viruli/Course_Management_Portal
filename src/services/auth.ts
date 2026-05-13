import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { apiFetch, ApiResult } from './api';
import type { Role } from '../data/types';

// ─── API-aligned types (do NOT use types from src/data/types.ts for these) ──

export type ApiUserRole = 'student' | 'admin' | 'super_admin';
export type ApiUserStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';

export interface ApiUserProfile {
  uid:             string;
  email:           string;
  role:            ApiUserRole;
  roles:           ApiUserRole[];
  status:          ApiUserStatus;
  firstName:       string;
  lastName:        string;
  profilePhotoUrl: string | null;
  createdAt:       string;
  updatedAt:       string;
}

// Maps the API's super_admin to the app's internal 'super' role string.
function toAppRole(apiRole: ApiUserRole): Role {
  if (apiRole === 'super_admin') return 'super';
  return apiRole;
}

// ─── Register ────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
}

export interface RegisterResponse {
  message: string;
}

export function registerStudent(payload: RegisterPayload): Promise<ApiResult<RegisterResponse>> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    tag: 'auth.register',
    redactFields: ['password'],
  });
}

// ─── Track login failure ──────────────────────────────────────────────────────

export interface TrackFailureResponse {
  locked:   boolean;
  attempts: number;
}

export async function trackLoginFailure(email: string): Promise<TrackFailureResponse> {
  try {
    const result = await apiFetch<TrackFailureResponse>('/auth/track-failure', {
      method: 'POST',
      body: { email },
      tag: 'auth.trackFailure',
    });
    return result.data;
  } catch {
    // Never let a failure-tracking error surface to the user.
    return { locked: false, attempts: 0 };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  role:    Role;
  profile: ApiUserProfile;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  // Step 1: Firebase sign-in — throws FirebaseError on bad credentials.
  const credential = await signInWithEmailAndPassword(auth, email, password);

  // Step 2: Fetch the user's profile and role from our backend.
  // If this fails, clean up the Firebase session so we don't leave a half-signed-in state.
  let profile: ApiUserProfile;
  try {
    const result = await apiFetch<ApiUserProfile>('/me', {
      method: 'GET',
      tag: 'auth.getMe',
    });
    profile = result.data;
  } catch (err) {
    await signOut(auth).catch(() => null);
    throw err;
  }

  return {
    role: toAppRole(profile.role),
    profile,
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser(): Promise<{ backendOk: boolean }> {
  let backendOk = false;
  try {
    await apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
      tag: 'auth.logout',
    });
    backendOk = true;
  } catch {
    // Intentionally swallowed — Firebase signOut always runs below.
  }

  await signOut(auth).catch(() => null);
  return { backendOk };
}

// Convenience: call from any screen's sign-out button.
// Handles the full teardown: backend revoke → Firebase signOut → store reset.
export async function performLogout(): Promise<void> {
  const { backendOk } = await logoutUser();

  // Lazy import avoids circular deps (auth ← profileStore/appStore ← auth).
  const [{ useProfileStore }, { useAppStore }, { toast }] = await Promise.all([
    import('../store/profileStore'),
    import('../store/appStore'),
    import('../store/uiStore'),
  ]);

  useProfileStore.getState().clearProfile();
  useAppStore.getState().setRole('public');

  if (!backendOk) {
    // User is logged out locally; backend revocation failed (e.g. offline).
    toast.info('Signed out locally. Session will expire within 1 hour.');
  }
}
