import { apiFetch, ApiResult } from './api';

export interface ApiSemester {
  id:           string;
  courseId:     string;
  name:         string;
  sortOrder:    number;
  subjectCount: number;
  createdAt:    string;
  updatedAt:    string;
}

export function createSemester(
  courseId: string,
  payload: { name: string; sortOrder: number },
): Promise<ApiResult<ApiSemester>> {
  return apiFetch<ApiSemester>(`/courses/${courseId}/semesters`, {
    method: 'POST',
    body:   payload,
    tag:    'semesters.create',
  });
}

export function updateSemester(
  id: string,
  patch: { name?: string; sortOrder?: number },
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
