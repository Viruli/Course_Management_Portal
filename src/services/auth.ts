import { apiFetch, ApiResult } from './api';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export function registerStudent(payload: RegisterPayload): Promise<ApiResult<RegisterResponse>> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    tag: 'auth.register',
    redactFields: ['password'],
  });
}
