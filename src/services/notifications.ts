import { apiFetch, ApiResult } from './api';

export type NotificationCategory =
  | 'registration_approved'
  | 'registration_rejected'
  | 'enrollment_pending'
  | 'enrollment_approved'
  | 'enrollment_rejected'
  | 'course_published'
  | 'system';

export interface ApiNotification {
  id:        string;
  userUid:   string;
  category:  NotificationCategory;
  title:     string;
  body:      string;
  payload:   Record<string, unknown>;
  readAt:    string | null;   // null = unread; ISO string = read
  createdAt: string;
}

interface PaginatedNotifications {
  items:      ApiNotification[];
  nextCursor: string | null;
  total:      number;
}

export function listNotifications(params?: {
  read?:   'true' | 'false';
  cursor?: string;
}): Promise<ApiResult<PaginatedNotifications>> {
  const query = new URLSearchParams({ limit: '50' });
  if (params?.read   !== undefined) query.set('read',   params.read);
  if (params?.cursor !== undefined) query.set('cursor', params.cursor);
  return apiFetch<PaginatedNotifications>(`/me/notifications?${query.toString()}`, {
    method: 'GET',
    tag:    'notifications.list',
  });
}

export function markNotificationRead(
  id: string,
): Promise<ApiResult<{ id: string; readAt: string }>> {
  return apiFetch(`/me/notifications/${id}/read`, {
    method: 'POST',
    tag:    'notifications.markRead',
    // No body — must not send body for this endpoint
  });
}

export function markAllNotificationsRead(): Promise<ApiResult<{ markedCount: number }>> {
  return apiFetch<{ markedCount: number }>('/me/notifications/read-all', {
    method: 'POST',
    tag:    'notifications.markAll',
    // No body — must not send body for this endpoint
  });
}
