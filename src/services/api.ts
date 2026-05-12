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
  token?: string;
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

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  if (!BASE_URL) {
    throw new ApiError(
      'API base URL is not configured. Set EXPO_PUBLIC_API_BASE_URL in your .env file.',
      { code: 'CONFIG_ERROR', status: 0 },
    );
  }

  const { method = 'GET', body, token, timeoutMs = 15000, tag, redactFields } = options;
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();
  const requestBodyForLog = redact(body, redactFields);

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
    const apiErr = new ApiError(envelope?.error?.message ?? `Request failed (${response.status}).`, {
      code: envelope?.error?.code ?? 'UNKNOWN_ERROR',
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
