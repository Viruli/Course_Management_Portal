import { apiFetch, ApiResult } from './api';

export interface ApiUser {
  uid:             string;
  email:           string;
  role:            string;
  status:          'pending_approval' | 'approved' | 'rejected' | 'suspended';
  firstName:       string;
  lastName:        string;
  enrolledCourses: number;
  createdAt:       string;
}

export interface ApiUserEnrollment {
  courseId:          string;
  courseTitle:       string;
  enrollmentState:   string;
  completionPercent: number;
  approvedAt?:       string;
}

export interface ApiUserDetail extends ApiUser {
  profilePhotoUrl: string | null;
  enrollments:     ApiUserEnrollment[];
}

interface PaginatedUsers {
  items:      ApiUser[];
  nextCursor: string | null;
  total:      number;
}

export function listUsers(params: {
  status?: string;
  role?:   string;
  q?:      string;
  cursor?: string;
} = {}): Promise<ApiResult<PaginatedUsers>> {
  const query = new URLSearchParams({ limit: '25' });
  if (params.status) query.set('status', params.status);
  if (params.role)   query.set('role',   params.role);
  if (params.q)      query.set('q',      params.q);
  if (params.cursor) query.set('cursor', params.cursor);
  return apiFetch<PaginatedUsers>(`/users?${query.toString()}`, {
    method: 'GET',
    tag:    'users.list',
  });
}

export function getUserById(uid: string): Promise<ApiResult<ApiUserDetail>> {
  return apiFetch<ApiUserDetail>(`/users/${uid}`, {
    method: 'GET',
    tag:    'users.getById',
  });
}

export function suspendUser(
  uid: string,
  reason?: string,
): Promise<ApiResult<{ uid: string; status: string }>> {
  const body = reason?.trim() ? { reason: reason.trim() } : {};
  return apiFetch(`/users/${uid}/suspend`, {
    method: 'POST',
    body,
    tag:    'users.suspend',
  });
}

export function reactivateUser(
  uid: string,
): Promise<ApiResult<{ uid: string; status: string }>> {
  return apiFetch(`/users/${uid}/reactivate`, {
    method: 'POST',
    tag:    'users.reactivate',
    // No body — must not send body for this endpoint
  });
}
