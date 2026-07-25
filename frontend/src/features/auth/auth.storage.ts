import { authSessionSchema } from '@/features/auth/auth.schemas';
import type { AuthSession } from '@/features/auth/auth.types';

const AUTH_STORAGE_KEY = 'taskflow.auth-session';

function isAccessTokenExpired(accessToken: string): boolean {
  const encodedPayload = accessToken.split('.')[1];

  if (!encodedPayload) {
    return true;
  }

  try {
    const base64Payload = encodedPayload
      .replaceAll('-', '+')
      .replaceAll('_', '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const payload: unknown = JSON.parse(window.atob(base64Payload));

    return !(
      typeof payload === 'object' &&
      payload !== null &&
      'exp' in payload &&
      typeof payload.exp === 'number' &&
      payload.exp > Date.now() / 1000
    );
  } catch {
    return true;
  }
}

export function loadAuthSession(): AuthSession | null {
  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const result = authSessionSchema.safeParse(JSON.parse(storedSession));

    if (result.success && !isAccessTokenExpired(result.data.accessToken)) {
      return result.data;
    }
  } catch {
    // Corrupted client storage should behave like a signed-out session.
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

export function saveAuthSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
