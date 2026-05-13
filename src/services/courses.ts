import { apiFetch, ApiResult } from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiAttachmentItem {
  id:         string;
  fileName:   string;
  mimeType:   string;
  sizeBytes:  number;
  uploadedAt: string;
}

export interface ApiSubjectDetail {
  id:             string;
  semesterId:     string;
  title:          string;
  description:    string;
  youtubeVideoId: string;
  sortOrder:      number;
  attachments:    ApiAttachmentItem[];
  createdAt:      string;
  updatedAt:      string;
}

export interface ApiSemesterDetail {
  id:           string;
  courseId:     string;
  name:         string;
  sortOrder:    number;
  subjectCount: number;
  subjects:     ApiSubjectDetail[];
  createdAt:    string;
  updatedAt:    string;
}

export type CourseState = 'draft' | 'published' | 'archived';

export interface ApiCourse {
  id:            string;
  title:         string;
  description:   string;
  coverImageUrl: string | null;
  state:         CourseState;
  semesterCount: number;
  createdBy:     string;
  createdByName: string;
  publishedAt:   string | null;
  createdAt:     string;
  updatedAt:     string;
}

export interface ApiCourseDetail extends ApiCourse {
  semesters: ApiSemesterDetail[];
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

export function createCourse(payload: {
  title:          string;
  description:    string;
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
): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}`, {
    method: 'PATCH',
    body:   patch,
    tag:    'courses.update',
  });
}

export function publishCourse(id: string): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}/publish`, {
    method: 'POST',
    tag:    'courses.publish',
  });
}

export function unpublishCourse(id: string): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}/unpublish`, {
    method: 'POST',
    tag:    'courses.unpublish',
  });
}

export function archiveCourse(id: string): Promise<ApiResult<ApiCourseDetail>> {
  return apiFetch<ApiCourseDetail>(`/courses/${id}/archive`, {
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
