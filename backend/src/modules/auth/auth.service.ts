import {
  UserModel,
  type UserDocument,
} from "../users/user.model.js";
import { AuthErrors } from "./auth.errors.js";
import { createAccessToken } from "./jwt.service.js";
import {
  hashPassword,
  verifyPassword,
} from "./password.service.js";
import type {
  LoginBody,
  RegisterBody,
} from "./auth.validation.js";

interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthenticationPayload {
  user: PublicUser;
  accessToken: string;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function buildAuthenticationPayload(
  user: UserDocument,
): AuthenticationPayload {
  return {
    user: toPublicUser(user),
    accessToken: createAccessToken(user.id),
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function registerUser(
  input: RegisterBody,
): Promise<AuthenticationPayload> {
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return buildAuthenticationPayload(user);
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) {
      throw AuthErrors.emailAlreadyRegistered();
    }

    throw error;
  }
}

export async function loginUser(
  input: LoginBody,
): Promise<AuthenticationPayload> {
  const user = await UserModel.findOne({ email: input.email }).select(
    "+passwordHash",
  );

  if (!user) {
    throw AuthErrors.invalidCredentials();
  }

  const passwordMatches = await verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw AuthErrors.invalidCredentials();
  }

  return buildAuthenticationPayload(user);
}
