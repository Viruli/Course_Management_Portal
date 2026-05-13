import { apiFetch, ApiResult } from './api';

export interface ApiSubjectProgress {
  studentUid:       string;
  subjectId:        string;
  courseId:         string;
  semesterId:       string;
  state:            'not_started' | 'in_progress' | 'completed';
  completionSource?: 'manual' | 'auto';
  completedAt?:     string;
  lastAccessedAt?:  string;
}

export interface ApiCourseProgress {
  courseId:               string;
  studentUid:             string;
  totalSubjects:          number;
  completedCount:         number;
  pendingCount:           number;
  completionPercent:      number;   // 0.0 – 100.0, 1 decimal place
  lastAccessedSubjectId:  string | null;
}

interface ProgressPayload {
  courseId:   string;
  semesterId: string;
}

export function markSubjectComplete(
  subjectId: string,
  payload: ProgressPayload,
): Promise<ApiResult<ApiSubjectProgress>> {
  return apiFetch<ApiSubjectProgress>(`/progress/subjects/${subjectId}/complete`, {
    method: 'POST',
    body:   payload,   // courseId + semesterId both required
    tag:    'progress.complete',
  });
}

export function updateLastAccessed(
  subjectId: string,
  payload: ProgressPayload,
): Promise<ApiResult<{ subjectId: string; lastAccessedAt: string }>> {
  return apiFetch(`/progress/subjects/${subjectId}/access`, {
    method: 'POST',
    body:   payload,   // courseId + semesterId both required
    tag:    'progress.access',
  });
}

export function getCourseProgress(courseId: string): Promise<ApiResult<ApiCourseProgress>> {
  return apiFetch<ApiCourseProgress>(`/me/progress/courses/${courseId}`, {
    method: 'GET',
    tag:    'progress.course',
  });
}

export function getSubjectProgress(subjectId: string): Promise<ApiResult<ApiSubjectProgress>> {
  return apiFetch<ApiSubjectProgress>(`/me/progress/subjects/${subjectId}`, {
    method: 'GET',
    tag:    'progress.subject',
  });
}
