import { isAxiosError } from 'axios';

interface ApiErrorResponse {
  error?: {
    message?: string;
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  if (error.code === 'ECONNABORTED') {
    return 'The request took too long. Please try again.';
  }

  if (!error.response) {
    return 'We could not reach the server. Check your connection and try again.';
  }

  return error.response.data?.error?.message ?? fallbackMessage;
}

export function isUnauthorizedApiError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}
