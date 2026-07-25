import type { ErrorRequestHandler, RequestHandler } from "express";

import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

function isMalformedJsonError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  );
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isMalformedJsonError(error)) {
    return new AppError(
      400,
      "MALFORMED_JSON",
      "The request body contains invalid JSON",
    );
  }

  return new AppError(
    500,
    "INTERNAL_SERVER_ERROR",
    "An unexpected error occurred",
  );
}

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new AppError(
      404,
      "ROUTE_NOT_FOUND",
      `Cannot ${request.method} ${request.originalUrl}`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const appError = toAppError(error);

  if (!(error instanceof AppError) && !isMalformedJsonError(error)) {
    console.error(error);
  }

  response.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details === undefined
        ? {}
        : { details: appError.details }),
      ...(env.NODE_ENV === "development" && appError.stack
        ? { stack: appError.stack }
        : {}),
    },
  });
};
