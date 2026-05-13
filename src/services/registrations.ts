import { apiFetch, ApiResult } from './api';

export interface ApiRegistration {
  id:          string;
  studentUid:  string;
  firstName:   string;
  lastName:    string;
  email:       string;
  status:      'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface BulkApproveResult {
  approved: string[];
  failed:   { id: string; reason: string }[];
}

interface PaginatedRegistrations {
  items:      ApiRegistration[];
  nextCursor: string | null;
  total:      number;
}

export function listRegistrations(params: {
  status?: string;
  q?:      string;
  cursor?: string;
  limit?:  number;
}): Promise<ApiResult<PaginatedRegistrations>> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.q)      query.set('q',      params.q);
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.limit)  query.set('limit',  String(params.limit));

  const qs = query.toString();
  return apiFetch<PaginatedRegistrations>(`/admin/registrations${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    tag:    'registrations.list',
  });
}

export function approveRegistration(id: string): Promise<ApiResult<{ message: string; studentUid: string }>> {
  return apiFetch(`/admin/registrations/${id}/approve`, {
    method: 'POST',
    tag:    'registrations.approve',
  });
}

export function rejectRegistration(
  id: string,
  reason?: string,
): Promise<ApiResult<{ message: string; studentUid: string }>> {
  const body = reason && reason.trim() ? { reason: reason.trim() } : {};
  return apiFetch(`/admin/registrations/${id}/reject`, {
    method: 'POST',
    body,
    tag:    'registrations.reject',
  });
}

export function bulkApproveRegistrations(
  ids: string[],
): Promise<ApiResult<BulkApproveResult>> {
  return apiFetch<BulkApproveResult>('/admin/registrations/bulk-approve', {
    method: 'POST',
    body:   { registrationIds: ids },
    tag:    'registrations.bulkApprove',
  });
}
