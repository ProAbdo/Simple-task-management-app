import type { RequestHandler } from "express";

import { AuthErrors } from "../../modules/auth/auth.errors.js";
import { verifyAccessToken } from "../../modules/auth/jwt.service.js";

export const authenticate: RequestHandler = (request, _response, next) => {
  const authorization = request.header("authorization");
  const [scheme, token, ...extraParts] = authorization?.split(" ") ?? [];

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token ||
    extraParts.length > 0
  ) {
    next(AuthErrors.missingAccessToken());
    return;
  }

  const payload = verifyAccessToken(token);
  request.auth = Object.freeze({ userId: payload.sub });
  next();
};

interface RequestWithAuthentication {
  auth?: Readonly<{
    userId: string;
  }>;
}

export function getAuthenticatedUserId(
  request: RequestWithAuthentication,
): string {
  if (!request.auth) {
    throw AuthErrors.missingAuthenticationContext();
  }

  return request.auth.userId;
}
