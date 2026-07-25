import { AppError } from "../../shared/errors/app-error.js";

export const AuthErrors = {
  emailAlreadyRegistered: () =>
    new AppError(
      409,
      "EMAIL_ALREADY_REGISTERED",
      "An account with this email already exists",
    ),

  invalidCredentials: () =>
    new AppError(
      401,
      "INVALID_CREDENTIALS",
      "The email or password is incorrect",
    ),

  missingAccessToken: () =>
    new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Provide a Bearer access token",
    ),

  missingAuthenticationContext: () =>
    new AppError(
      401,
      "AUTHENTICATION_REQUIRED",
      "Authentication is required",
    ),

  tokenExpired: () =>
    new AppError(
      401,
      "TOKEN_EXPIRED",
      "The access token has expired",
    ),

  invalidToken: () =>
    new AppError(
      401,
      "INVALID_TOKEN",
      "The access token is invalid",
    ),
};

