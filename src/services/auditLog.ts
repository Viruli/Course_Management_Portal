import { apiFetch, ApiResult } from './api';

export interface ApiAuditEntry {
  id:         string;
  when:       string;             // ISO 8601 timestamp (NOT createdAt)
  actor:      {
    uid:   string | null;         // null for system events
    email: string | null;
  };
  action:     string;             // e.g. 'registration.approved'
  category:   string | null;     // 'auth'|'user'|'course'|'enrollment'|'progress'|'storage'|'system'
  ip:         string | null;
  targetType: string;
  targetId:   string;
  requestId:  string;
}

interface PaginatedAuditLog {
  items:      ApiAuditEntry[];
  nextCursor: string | null;
  total:      number;
}

export function getAuditLog(params: {
  category?:  string;
  action?:    string;
  targetType?: string;
  targetId?:  string;
  from?:      string;
  to?:        string;
  cursor?:    string;
  limit?:     number;
} = {}): Promise<ApiResult<PaginatedAuditLog>> {
  const query = new URLSearchParams({ limit: String(params.limit ?? 20) });
  if (params.category)   query.set('category',   params.category);
  if (params.action)     query.set('action',      params.action);
  if (params.targetType) query.set('targetType',  params.targetType);
  if (params.targetId)   query.set('targetId',    params.targetId);
  if (params.from)       query.set('from',        params.from);
  if (params.to)         query.set('to',          params.to);
  if (params.cursor)     query.set('cursor',      params.cursor);
  return apiFetch<PaginatedAuditLog>(`/audit-log?${query.toString()}`, {
    method: 'GET',
    tag:    'audit.list',
  });
}
