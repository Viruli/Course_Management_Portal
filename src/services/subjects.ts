import { apiFetch, ApiResult } from './api';

// ─── v1.2.0 §17 Subject + Lesson data models ─────────────────────────────────

// The deployed backend's Subject shape actually mirrors a Lesson: it owns its
// own description, YouTube video, and attachment list (the v1.2.0 doc is out
// of date on this).
export interface ApiSubject {
  id:             string;
  semesterId:     string;
  courseId:       string;
  title:          string;
  description:    string;
  youtubeVideoId: string | null;
  attachmentIds:  string[];
  order:          number;
  deletedAt:      string | null;
  createdAt:      string;
  updatedAt:      string;
}

// The deployed backend's Lesson uses a full `url` field (v1.1.0 semantics),
// not the `youtubeVideoId` shape claimed by the v1.2.0 doc.
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

// ─── Subject CRUD ────────────────────────────────────────────────────────────
// Backend accepts title (required) plus the same optional content fields as
// lessons: description, raw youtubeVideoId, attachmentIds.

// Fallback list endpoint — used only when the course-detail embedded tree
// doesn't include subjects.
export function listSubjects(semesterId: string): Promise<ApiResult<ApiSubject[]>> {
  return apiFetch<ApiSubject[]>(`/semesters/${semesterId}/subjects`, {
    method: 'GET',
    tag:    'subjects.list',
  });
}

export function createSubject(
  semesterId: string,
  payload: {
    title:           string;
    description?:    string;
    youtubeVideoId?: string | null;
    attachmentIds?:  string[];
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
    title?:          string;
    description?:    string;
    youtubeVideoId?: string | null;
    attachmentIds?:  string[];
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

// ─── Lesson CRUD (v1.2.0 §6.4–6.7) ────────────────────────────────────────────
// Lessons hold the actual learning content: description, raw youtubeVideoId,
// and an attachmentIds array that references Attachment documents owned by the
// parent Subject. `order` is server-assigned.

export function listLessons(subjectId: string): Promise<ApiResult<ApiLesson[]>> {
  return apiFetch<ApiLesson[]>(`/subjects/${subjectId}/lessons`, {
    method: 'GET',
    tag:    'lessons.list',
  });
}

export function createLesson(
  subjectId: string,
  payload: {
    title:        string;
    url:          string;        // required by deployed backend
    description?: string;
  },
): Promise<ApiResult<ApiLesson>> {
  return apiFetch<ApiLesson>(`/subjects/${subjectId}/lessons`, {
    method: 'POST',
    body:   payload,
    tag:    'lessons.create',
  });
}

export function updateLesson(
  id: string,
  patch: {
    title?:       string;
    url?:         string;
    description?: string;
  },
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

// v1.2.0 stores the raw 11-char YouTube video ID. Accept either a pasted URL or
// a bare ID and return the canonical ID (or null if neither).
export function youtubeIdFromInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return null;
}
