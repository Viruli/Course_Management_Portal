import { apiFetch, ApiResult } from './api';

// v1.2.0 §17 Semester data model.
export interface ApiSemester {
  id:           string;
  courseId:     string;
  title:        string;
  subjectCount: number;
  order:        number;
  deletedAt:    string | null;
  createdAt:    string;
  updatedAt:    string;
}

// v1.2.0 §5.1 — POST /courses/:id/semesters accepts ONLY `title`. The server
// auto-assigns `order` as the next sequential position. There is no list
// endpoint in v1.2.0; semesters are retrieved via GET /courses/:id embedded tree.

// Fallback list endpoint — not documented in v1.2.0 but commonly available.
// Use only when GET /courses/:id does not return an embedded semesters[] tree.
export function listSemesters(courseId: string): Promise<ApiResult<ApiSemester[]>> {
  return apiFetch<ApiSemester[]>(`/courses/${courseId}/semesters`, {
    method: 'GET',
    tag:    'semesters.list',
  });
}

export function createSemester(
  courseId: string,
  payload: { title: string },
): Promise<ApiResult<ApiSemester>> {
  return apiFetch<ApiSemester>(`/courses/${courseId}/semesters`, {
    method: 'POST',
    body:   payload,
    tag:    'semesters.create',
  });
}

export function updateSemester(
  id: string,
  patch: { title?: string },
): Promise<ApiResult<ApiSemester>> {
  return apiFetch<ApiSemester>(`/semesters/${id}`, {
    method: 'PATCH',
    body:   patch,
    tag:    'semesters.update',
  });
}

export function deleteSemester(id: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/semesters/${id}`, {
    method: 'DELETE',
    tag:    'semesters.delete',
  });
}
