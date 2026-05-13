import { apiFetch, ApiResult } from './api';

export interface ApiEnrollment {
  id:          string;
  courseId:    string;
  courseTitle: string;
  studentUid:  string;
  state:       'pending' | 'approved' | 'rejected' | 'withdrawn';
  approvedAt?: string;
  rejectedAt?: string;
  createdAt:   string;
  updatedAt:   string;
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
