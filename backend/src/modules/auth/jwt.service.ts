import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  type JwtPayload,
  type SignOptions,
} from "jsonwebtoken";

import { env } from "../../config/env.js";
import { AuthErrors } from "./auth.errors.js";

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
}

export function createAccessToken(userId: string): string {
  const options: SignOptions = {
    algorithm: "HS256",
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >,
  };

  return jwt.sign({}, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      payload.sub.length === 0
    ) {
      throw new JsonWebTokenError("Token subject is missing");
    }

    return { ...payload, sub: payload.sub };
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw AuthErrors.tokenExpired();
    }

    throw AuthErrors.invalidToken();
  }
}
