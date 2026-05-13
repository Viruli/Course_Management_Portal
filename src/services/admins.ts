import { apiFetch, ApiResult } from './api';
import type { ApiUserProfile } from './auth';

export interface CreateAdminPayload {
  firstName:       string;
  lastName:        string;
  email:           string;
  initialPassword: string;
}

export function createAdmin(payload: CreateAdminPayload): Promise<ApiResult<ApiUserProfile>> {
  return apiFetch<ApiUserProfile>('/super-admin/admins', {
    method: 'POST',
    body: payload,
    tag: 'admins.create',
    redactFields: ['initialPassword'],
  });
}

export function promoteToAdmin(uid: string): Promise<ApiResult<ApiUserProfile>> {
  return apiFetch<ApiUserProfile>(`/super-admin/users/${uid}/make-admin`, {
    method: 'POST',
    tag: 'admins.promote',
  });
}
