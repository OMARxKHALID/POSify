// API Response Utilities
// Works with Zod, Mongoose, and generic errors

import { ZodError } from "zod";
import mongoose from "mongoose";

class ResponseBuilder {
  static success({
    data = null,
    message = "Request successful",
    statusCode = 200,
    meta = {},
  } = {}) {
    return {
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }

  static error({
    message = "Request failed",
    code = "ERROR",
    details = [],
    statusCode = 400,
  } = {}) {
    return {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
      statusCode,
    };
  }

  static fromZod(error, statusCode = 400) {
    if (!(error instanceof ZodError)) return this.internal("Invalid Zod error");

    const details = error.errors.map((e) => ({
      field: e.path.join("."),
      issue: e.message,
    }));

    return this.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  static fromMongoose(error, statusCode = 400) {
    if (!(error instanceof mongoose.Error.ValidationError)) {
      return this.internal("Invalid Mongoose validation error");
    }

    const details = Object.values(error.errors).map((err) => ({
      field: err.path,
      issue: err.message,
    }));

    return this.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  static validationError(errors = [], statusCode = 400) {
    const details = errors.map((e) => {
      if (Array.isArray(e.path))
        return { field: e.path.join("."), issue: e.message }; // Zod
      if (typeof e.path === "string")
        return { field: e.path, issue: e.message }; // Mongoose
      return {
        field: e.field || "unknown",
        issue: e.message || "Validation error",
      };
    });

    return this.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  // Common error shortcuts
  static notFound(resource = "Resource") {
    return this.error({
      message: `${resource} not found`,
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  static unauthorized(message = "Unauthorized access") {
    return this.error({ message, code: "UNAUTHORIZED", statusCode: 401 });
  }

  static forbidden(message = "Access forbidden") {
    return this.error({ message, code: "FORBIDDEN", statusCode: 403 });
  }

  static internal(message = "Internal server error") {
    return this.error({ message, code: "INTERNAL_ERROR", statusCode: 500 });
  }

  static conflict(message = "Resource conflict") {
    return this.error({ message, code: "CONFLICT", statusCode: 409 });
  }
}

// Exports
export const apiSuccess = ResponseBuilder.success;
export const apiError = ResponseBuilder.error;
export const apiValidationError = ResponseBuilder.validationError;
export const apiFromZod = ResponseBuilder.fromZod;
export const apiFromMongoose = ResponseBuilder.fromMongoose;
export const apiNotFound = ResponseBuilder.notFound;
export const apiUnauthorized = ResponseBuilder.unauthorized;
export const apiForbidden = ResponseBuilder.forbidden;
export const apiInternalError = ResponseBuilder.internal;
export const apiConflict = ResponseBuilder.conflict;

export default ResponseBuilder;
