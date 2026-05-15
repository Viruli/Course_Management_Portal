import { apiFetch, ApiResult } from './api';

// The API (§10.1) returns only core IDs and timestamps.
// studentName / studentEmail / courseTitle are NOT in the spec response;
// they are kept as optional in case a future backend version adds them.
export interface ApiAdminEnrollment {
  id:           string;
  studentUid:   string;
  courseId:     string;
  state:        'pending' | 'approved' | 'rejected' | 'withdrawn';
  reason:       string | null;
  approvedAt:   string | null;
  rejectedAt:   string | null;
  withdrawnAt:  string | null;
  createdAt:    string;
  updatedAt:    string;
  // Optional extras the backend may include:
  studentName?:  string;
  studentEmail?: string;
  courseTitle?:  string;
  submittedAt?:  string;
}

interface PaginatedEnrollments {
  items:      ApiAdminEnrollment[];
  nextCursor: string | null;
  total:      number;
}

export function listAdminEnrollments(params: {
  status?:   string;
  courseId?: string;
  cursor?:   string;
  limit?:    number;
}): Promise<ApiResult<PaginatedEnrollments>> {
  const query = new URLSearchParams();
  if (params.status)   query.set('status',   params.status);
  if (params.courseId) query.set('courseId', params.courseId);
  if (params.cursor)   query.set('cursor',   params.cursor);
  if (params.limit)    query.set('limit',    String(params.limit));

  const qs = query.toString();
  return apiFetch<PaginatedEnrollments>(`/admin/enrollments${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    tag:    'enrollments.list',
  });
}

export function approveEnrollment(
  id: string,
): Promise<ApiResult<{ id: string; courseId: string; state: string; approvedAt: string }>> {
  return apiFetch(`/admin/enrollments/${id}/approve`, {
    method: 'POST',
    tag:    'enrollments.approve',
  });
}

export function rejectEnrollment(
  id: string,
  reason?: string,
): Promise<ApiResult<{ id: string; courseId: string; state: string; rejectedAt: string; reason?: string }>> {
  const body = reason && reason.trim() ? { reason: reason.trim() } : {};
  return apiFetch(`/admin/enrollments/${id}/reject`, {
    method: 'POST',
    body,
    tag:    'enrollments.reject',
  });
}
