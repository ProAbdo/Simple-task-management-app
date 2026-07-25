import type { Request, Response } from "express";

import { env } from "../../config/env.js";
import {
  loginUser,
  registerUser,
  type AuthenticationPayload,
} from "./auth.service.js";
import type {
  LoginBody,
  RegisterBody,
} from "./auth.validation.js";

function buildAuthenticationResponse(
  authentication: AuthenticationPayload,
) {
  return {
    ...authentication,
    tokenType: "Bearer" as const,
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

export async function register(
  request: Request<unknown, unknown, RegisterBody>,
  response: Response,
): Promise<void> {
  const authentication = await registerUser(request.body);

  response.status(201).json({
    success: true,
    data: buildAuthenticationResponse(authentication),
  });
}

export async function login(
  request: Request<unknown, unknown, LoginBody>,
  response: Response,
): Promise<void> {
  const authentication = await loginUser(request.body);

  response.status(200).json({
    success: true,
    data: buildAuthenticationResponse(authentication),
  });
}
