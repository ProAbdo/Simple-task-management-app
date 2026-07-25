import type { RequestHandler } from "express";
import type { z, ZodIssue } from "zod";

import { AppError } from "../errors/app-error.js";

function createValidationError(
  message: string,
  issues: ZodIssue[],
): AppError {
  return new AppError(
    400,
    "VALIDATION_ERROR",
    message,
    issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  );
}

export function validateBody(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(
        createValidationError(
          "The request body contains invalid data",
          result.error.issues,
        ),
      );
      return;
    }

    request.body = result.data;
    next();
  };
}

export function validateParams(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.params);

    if (!result.success) {
      next(
        createValidationError(
          "The route parameters contain invalid data",
          result.error.issues,
        ),
      );
      return;
    }

    request.params = result.data as typeof request.params;
    next();
  };
}

export function validateQuery(schema: z.ZodType): RequestHandler {
  return (request, response, next) => {
    const result = schema.safeParse(request.query);

    if (!result.success) {
      next(
        createValidationError(
          "The query parameters contain invalid data",
          result.error.issues,
        ),
      );
      return;
    }

    response.locals.validatedQuery = result.data;
    next();
  };
}
