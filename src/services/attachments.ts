import { apiFetch, ApiResult } from './api';
import { getAuthToken } from './getAuthToken';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// v1.2.0 §17 Attachment data model.
export interface ApiAttachment {
  id:          string;
  subjectId:   string;
  courseId:    string;
  filename:    string;
  mimeType:    string;
  sizeBytes:   number;
  storagePath: string;
  createdAt:   string;
}

export interface AttachmentDownloadUrl {
  downloadUrl: string;
  expiresAt:   string;
}

// Accepted MIME types per API spec §7.1
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',                                                          // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',    // .docx
];

export function isAttachmentTypeAccepted(mimeType: string): boolean {
  return ACCEPTED_TYPES.includes(mimeType);
}

const MB = 1024 * 1024;
export const ATTACHMENT_MAX_BYTES = 25 * MB;

/**
 * Upload a file attachment to a subject via multipart/form-data.
 * Cannot use apiFetch (which sends application/json); uses native fetch directly.
 * Field name must be "file" per the API spec.
 */
export async function uploadAttachment(
  subjectId: string,
  file: { uri: string; name: string; type: string },
): Promise<ApiResult<ApiAttachment>> {
  if (!BASE_URL) throw new Error('API base URL not configured.');

  const token = await getAuthToken();
  const url   = `${BASE_URL}/subjects/${subjectId}/attachments`;

  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);

  const startedAt = Date.now();
  const response  = await fetch(url, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    form,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const code    = data?.error?.code    ?? 'UNKNOWN_ERROR';
    const message = data?.error?.message ?? `Upload failed (${response.status}).`;
    const err: any = new Error(message);
    err.name      = 'ApiError';
    err.code      = code;
    err.status    = response.status;
    err.requestId = data?.requestId;
    throw err;
  }

  return {
    data:       data as ApiAttachment,
    status:     response.status,
    requestId:  response.headers.get('x-request-id') ?? undefined,
    url,
    durationMs: Date.now() - startedAt,
  };
}

export function deleteAttachment(id: string): Promise<ApiResult<undefined>> {
  return apiFetch<undefined>(`/attachments/${id}`, {
    method: 'DELETE',
    tag:    'attachments.delete',
  });
}

/**
 * Get a short-lived signed download URL for an attachment.
 * The URL expires in 15 minutes — call Linking.openURL immediately.
 * Only students with an approved enrollment in the parent course may call this.
 */
export function getAttachmentDownloadUrl(
  attachmentId: string,
): Promise<ApiResult<AttachmentDownloadUrl>> {
  return apiFetch<AttachmentDownloadUrl>(`/attachments/${attachmentId}/download-url`, {
    method: 'GET',
    tag:    'attachments.downloadUrl',
  });
}
