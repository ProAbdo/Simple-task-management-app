export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthenticationPayload {
  user: AuthenticatedUser;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export type AuthSession = AuthenticationPayload;

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}
