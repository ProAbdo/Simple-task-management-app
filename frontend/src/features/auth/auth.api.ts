import { httpClient } from '@/api/http-client';
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@/features/auth/auth.schemas';
import type {
  ApiSuccessResponse,
  AuthenticationPayload,
} from '@/features/auth/auth.types';

export async function loginUser(
  input: LoginFormValues,
): Promise<AuthenticationPayload> {
  const body = loginSchema.parse(input);
  const response = await httpClient.post<
    ApiSuccessResponse<AuthenticationPayload>
  >('/auth/login', body);

  return response.data.data;
}

export async function registerUser(
  input: RegisterFormValues,
): Promise<AuthenticationPayload> {
  const body = registerSchema.parse(input);
  const response = await httpClient.post<
    ApiSuccessResponse<AuthenticationPayload>
  >('/auth/register', body);

  return response.data.data;
}
