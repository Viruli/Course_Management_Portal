import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getAuthToken } from './getAuthToken';
import { debug } from '../store/debugStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  requestId?: string;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, string[]>;
  requestId?: string;

  constructor(
    message: string,
    opts: {
      code: string;
      status: number;
      details?: Record<string, string[]>;
      requestId?: string;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
    this.requestId = opts.requestId;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
  tag?: string;
  redactFields?: string[];
}

export interface ApiResult<T> {
  data: T;
  status: number;
  requestId?: string;
  url: string;
  durationMs: number;
}

function redact(body: unknown, fields?: string[]): unknown {
  if (!fields || !fields.length || !body || typeof body !== 'object') return body;
  const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const f of fields) {
    if (f in clone) clone[f] = '••••••••';
  }
  return clone;
}

// Called when the server tells us the session has been revoked.
// Imported lazily to avoid a circular dependency at module load time.
function handleRevoked(): void {
  signOut(auth).catch(() => null);
  // Defer the store reset so we don't call React state setters during a
  // non-React async context synchronously.
  setTimeout(() => {
    // Dynamic import avoids circular: api → appStore → (nothing)
    import('../store/appStore').then(({ useAppStore }) => {
      useAppStore.getState().setRole('public');
    });
  }, 0);
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  if (!BASE_URL) {
    throw new ApiError(
      'API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL in your .env file.',
      { code: 'CONFIG_ERROR', status: 0 },
    );
  }

  const { method = 'GET', body, timeoutMs = 15000, tag, redactFields } = options;
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  const requestBodyForLog = redact(body, redactFields);

  // Auto-attach Firebase token if the user is signed in.
  const token = await getAuthToken();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const aborted = (err as Error).name === 'AbortError';
    const apiErr = new ApiError(
      aborted
        ? 'The request timed out. Please check your connection and try again.'
        : "Couldn't reach the server. Please check your connection and try again.",
      { code: aborted ? 'TIMEOUT' : 'NETWORK_ERROR', status: 0 },
    );
    if (tag) {
      debug.log({
        tag,
        outcome: 'error',
        timestamp: new Date().toISOString(),
        method,
        url,
        status: 0,
        durationMs: Date.now() - startedAt,
        requestBody: requestBodyForLog,
        errorCode: apiErr.code,
        errorMessage: apiErr.message,
      });
    }
    throw apiErr;
  }
  clearTimeout(timeoutId);

  const durationMs = Date.now() - startedAt;
  const requestId = response.headers.get('x-request-id') ?? undefined;
  const timestamp = new Date().toISOString();

  if (response.status === 204) {
    if (tag) {
      debug.log({
        tag, outcome: 'success', timestamp, method, url,
        status: response.status, durationMs, requestId,
        requestBody: requestBodyForLog, responseBody: null,
      });
    }
    return { data: undefined as T, status: response.status, requestId, url, durationMs };
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const envelope = data as ApiErrorEnvelope | null;
    const errorCode = envelope?.error?.code ?? 'UNKNOWN_ERROR';
    const apiErr = new ApiError(envelope?.error?.message ?? `Request failed (${response.status}).`, {
      code: errorCode,
      status: response.status,
      details: envelope?.error?.details,
      requestId: envelope?.requestId ?? requestId,
    });

    if (tag) {
      debug.log({
        tag,
        outcome: 'error',
        timestamp,
        method,
        url,
        status: response.status,
        durationMs,
        requestId: apiErr.requestId,
        requestBody: requestBodyForLog,
        responseBody: data,
        errorCode: apiErr.code,
        errorMessage: apiErr.message,
      });
    }

    // Global handler: force sign-out when the server revokes the session.
    if (response.status === 401 && (errorCode === 'TOKEN_REVOKED' || errorCode === 'INVALID_TOKEN')) {
      handleRevoked();
    }

    throw apiErr;
  }

  if (tag) {
    debug.log({
      tag, outcome: 'success', timestamp, method, url,
      status: response.status, durationMs, requestId,
      requestBody: requestBodyForLog, responseBody: data,
    });
  }
  return { data: data as T, status: response.status, requestId, url, durationMs };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
