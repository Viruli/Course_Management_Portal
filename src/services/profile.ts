import { apiFetch, ApiResult } from './api';
import type { ApiUserProfile } from './auth';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?:  string;
  // profilePhotoUrl deferred — requires cloud storage upload first
}

export function updateMyProfile(patch: UpdateProfilePayload): Promise<ApiResult<ApiUserProfile>> {
  return apiFetch<ApiUserProfile>('/me', {
    method: 'PATCH',
    body: patch,
    tag: 'profile.update',
  });
}

export function changePassword(newPassword: string): Promise<ApiResult<{ message: string }>> {
  return apiFetch<{ message: string }>('/me/change-password', {
    method: 'POST',
    body: { newPassword },
    tag: 'profile.changePassword',
    redactFields: ['newPassword'],
  });
}
