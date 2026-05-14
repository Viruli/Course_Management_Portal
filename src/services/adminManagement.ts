import { apiFetch, ApiResult } from './api';
import type { ApiUser } from './userManagement';

interface PaginatedAdmins {
  items:      ApiUser[];
  nextCursor: string | null;
  total:      number;
}

export function listAdmins(params: {
  status?: string;
  q?:      string;
  cursor?: string;
} = {}): Promise<ApiResult<PaginatedAdmins>> {
  const query = new URLSearchParams({ limit: '25' });
  if (params.status) query.set('status', params.status);
  if (params.q)      query.set('q',      params.q);
  if (params.cursor) query.set('cursor', params.cursor);
  return apiFetch<PaginatedAdmins>(`/super-admin/admins?${query.toString()}`, {
    method: 'GET',
    tag:    'admins.list',
  });
}

export function getAdminById(uid: string): Promise<ApiResult<ApiUser>> {
  return apiFetch<ApiUser>(`/super-admin/admins/${uid}`, {
    method: 'GET',
    tag:    'admins.getById',
  });
}

export function suspendAdmin(
  uid: string,
  reason?: string,
): Promise<ApiResult<ApiUser>> {
  const body = reason?.trim() ? { reason: reason.trim() } : {};
  return apiFetch<ApiUser>(`/super-admin/admins/${uid}/suspend`, {
    method: 'POST',
    body,
    tag:    'admins.suspend',
  });
}

export function reactivateAdmin(uid: string): Promise<ApiResult<ApiUser>> {
  return apiFetch<ApiUser>(`/super-admin/admins/${uid}/reactivate`, {
    method: 'POST',
    tag:    'admins.reactivate',
    // No body — must not send body for this endpoint
  });
}

export function deleteAdmin(uid: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/super-admin/admins/${uid}`, {
    method: 'DELETE',
    tag:    'admins.delete',
  });
}
