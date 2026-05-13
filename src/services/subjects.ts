import { apiFetch, ApiResult } from './api';
import type { ApiAttachmentItem } from './courses';

export interface ApiSubject {
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

export interface ApiLesson {
  id:          string;
  subjectId:   string;
  courseId:    string;
  semesterId:  string;
  title:       string;
  description: string;
  url:         string;
  order:       number;
  deletedAt:   string | null;
  createdAt:   string;
  updatedAt:   string;
}

// ─── Subject CRUD ─────────────────────────────────────────────────────────────

export function createSubject(
  semesterId: string,
  payload: {
    title:           string;
    description:     string;
    youtubeVideoUrl: string;
    sortOrder:       number;
  },
): Promise<ApiResult<ApiSubject>> {
  return apiFetch<ApiSubject>(`/semesters/${semesterId}/subjects`, {
    method: 'POST',
    body:   payload,
    tag:    'subjects.create',
  });
}

export function updateSubject(
  id: string,
  patch: {
    title?:           string;
    description?:     string;
    youtubeVideoUrl?: string;
    sortOrder?:       number;
  },
): Promise<ApiResult<ApiSubject>> {
  return apiFetch<ApiSubject>(`/subjects/${id}`, {
    method: 'PATCH',
    body:   patch,
    tag:    'subjects.update',
  });
}

export function deleteSubject(id: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/subjects/${id}`, {
    method: 'DELETE',
    tag:    'subjects.delete',
  });
}

// ─── Lesson CRUD ──────────────────────────────────────────────────────────────

export function listLessons(subjectId: string): Promise<ApiResult<ApiLesson[]>> {
  return apiFetch<ApiLesson[]>(`/subjects/${subjectId}/lessons`, {
    method: 'GET',
    tag:    'lessons.list',
  });
}

export function createLesson(
  subjectId: string,
  payload: { title: string; url: string; description?: string },
): Promise<ApiResult<ApiLesson>> {
  return apiFetch<ApiLesson>(`/subjects/${subjectId}/lessons`, {
    method: 'POST',
    body:   payload,
    tag:    'lessons.create',
  });
}

export function updateLesson(
  id: string,
  patch: { title?: string; url?: string; description?: string },
): Promise<ApiResult<ApiLesson>> {
  return apiFetch<ApiLesson>(`/lessons/${id}`, {
    method: 'PATCH',
    body:   patch,
    tag:    'lessons.update',
  });
}

export function deleteLesson(id: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/lessons/${id}`, {
    method: 'DELETE',
    tag:    'lessons.delete',
  });
}
