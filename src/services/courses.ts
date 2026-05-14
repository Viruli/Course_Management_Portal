import { apiFetch, ApiResult } from './api';

// ─── Types (API v1.2.0) ──────────────────────────────────────────────────────

export type CourseState = 'draft' | 'published' | 'archived';

// The v1.2.0 spec doc only lists `title`, but the deployed backend also requires
// `description` on create and returns it on read. `coverImageUrl` and
// `createdByName` are tolerated but optional — backend may omit them.
export interface ApiCourse {
  id:             string;
  title:          string;
  description:    string;
  state:          CourseState;
  semesterCount:  number;
  createdBy:      string;
  publishedAt:    string | null;
  deletedAt:      string | null;
  createdAt:      string;
  updatedAt:      string;
  // Optional extras that the backend may or may not return:
  coverImageUrl?: string | null;
  createdByName?: string;
}

// Embedded subject inside GET /courses/:id (v1.2.0 §4.2 / §17 CourseDetail):
// only id/title/order/createdAt/updatedAt. No semesterId, no description.
export interface ApiSubjectInTree {
  id:        string;
  title:     string;
  order:     number;
  createdAt: string;
  updatedAt: string;
}

// Embedded semester inside GET /courses/:id: id/title/subjectCount/order/+timestamps,
// plus the nested subjects array.
export interface ApiSemesterInTree {
  id:           string;
  title:        string;
  subjectCount: number;
  order:        number;
  subjects:     ApiSubjectInTree[];
  createdAt:    string;
  updatedAt:    string;
}

export interface ApiCourseDetail extends ApiCourse {
  semesters: ApiSemesterInTree[];
}

interface PaginatedCourses {
  items:      ApiCourse[];
  nextCursor: string | null;
  total:      number;
}

// ─── Course CRUD + lifecycle ──────────────────────────────────────────────────

export function listCourses(params: {
  state?:  string;
  q?:      string;
  cursor?: string;
  limit?:  number;
} = {}): Promise<ApiResult<PaginatedCourses>> {
  const query = new URLSearchParams();
  if (params.state)  query.set('state',  params.state);
  if (params.q)      query.set('q',      params.q);
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.limit)  query.set('limit',  String(params.limit));
  const qs = query.toString();
  return apiFetch<PaginatedCourses>(`/courses${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    tag:    'courses.list',
  });
}

export function getCourseById(id: string): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}`, {
    method: 'GET',
    tag:    'courses.getById',
  });
}

// v1.2.0 spec lists only `title`, but the deployed backend requires `description`
// too (the spec is out of date). `coverImageUrl` is optional.
export function createCourse(payload: {
  title:         string;
  description:   string;
  coverImageUrl?: string;
}): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>('/courses', {
    method: 'POST',
    body:   payload,
    tag:    'courses.create',
  });
}

export function updateCourse(
  id: string,
  patch: { title?: string; description?: string; coverImageUrl?: string },
): Promise<ApiResult<ApiCourse>> {
  return apiFetch<ApiCourse>(`/courses/${id}`, {
    method: 'PATCH',
    body:   patch,
    tag:    'courses.update',
  });
}

export function publishCourse(id: string): Promise<ApiResult<ApiCourse>> {
  return apiFetch<ApiCourse>(`/courses/${id}/publish`, {
    method: 'POST',
    tag:    'courses.publish',
  });
}

export function unpublishCourse(id: string): Promise<ApiResult<ApiCourse>> {
  return apiFetch<ApiCourse>(`/courses/${id}/unpublish`, {
    method: 'POST',
    tag:    'courses.unpublish',
  });
}

export function archiveCourse(id: string): Promise<ApiResult<ApiCourse>> {
  return apiFetch<ApiCourse>(`/courses/${id}/archive`, {
    method: 'POST',
    tag:    'courses.archive',
  });
}

export function deleteCourse(id: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/courses/${id}`, {
    method: 'DELETE',
    tag:    'courses.delete',
  });
}
