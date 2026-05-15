import { apiFetch, ApiResult } from './api';

// The GET /me/enrollments response (§8.2) returns IDs and timestamps only.
// courseTitle is not in the spec — kept optional in case the backend adds it.
export interface ApiEnrollment {
  id:           string;
  courseId:     string;
  studentUid:   string;
  state:        'pending' | 'approved' | 'rejected' | 'withdrawn';
  reason?:      string | null;
  approvedAt?:  string | null;
  rejectedAt?:  string | null;
  withdrawnAt?: string | null;
  createdAt:    string;
  updatedAt:    string;
  courseTitle?: string;   // optional — backend may include this
}

interface PaginatedEnrollments {
  items:      ApiEnrollment[];
  nextCursor: string | null;
  total:      number;
}

export function enrollInCourse(courseId: string): Promise<ApiResult<ApiEnrollment>> {
  return apiFetch<ApiEnrollment>(`/courses/${courseId}/enroll`, {
    method: 'POST',
    tag:    'enrollment.enroll',
    // No body — the API takes no request body for enrolment
  });
}

export function listMyEnrollments(cursor?: string): Promise<ApiResult<PaginatedEnrollments>> {
  const qs = cursor ? `?limit=50&cursor=${cursor}` : '?limit=50';
  return apiFetch<PaginatedEnrollments>(`/me/enrollments${qs}`, {
    method: 'GET',
    tag:    'enrollment.list',
  });
}

export function withdrawEnrollment(enrollmentId: string): Promise<ApiResult<ApiEnrollment>> {
  return apiFetch<ApiEnrollment>(`/enrollments/${enrollmentId}/withdraw`, {
    method: 'POST',
    tag:    'enrollment.withdraw',
    // No body
  });
}
