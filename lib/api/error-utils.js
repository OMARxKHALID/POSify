// API error handling utilities
import {
  apiError,
  badRequest,
  validationError,
  mongooseValidationError,
} from "./response-utils";

export const handleApiError = (error, defaultCode = "INTERNAL_ERROR") => {
  // Duplicate key errors (MongoDB)
  if (error.code === 11000) {
    return apiError("DUPLICATE_KEY", 409);
  }

  // Mongoose validation errors
  if (error.name === "ValidationError") {
    return mongooseValidationError(error);
  }

  // Invalid object IDs (Mongoose CastError)
  if (error.name === "CastError") {
    return badRequest("CAST_ERROR");
  }

  // Database connection errors
  if (
    error.name === "MongoNetworkError" ||
    error.name === "MongoServerSelectionError"
  ) {
    return apiError("DB_CONNECTION_ERROR", 503);
  }

  // Timeout errors
  if (error.message && error.message.includes("timed out")) {
    return apiError("DB_TIMEOUT", 504);
  }

  // Unexpected errors
  return apiError(defaultCode, 500);
};

export const handleValidationError = (
  error,
  defaultCode = "VALIDATION_ERROR"
) => {
  if (error.constructor.name === "ZodError") {
    return validationError(error);
  }

  if (error.name === "ValidationError") {
    return mongooseValidationError(error);
  }

  return badRequest(defaultCode);
};

export const handleAuthError = (error, defaultCode = "UNAUTHORIZED") => {
  if (error.name === "JsonWebTokenError") {
    return apiError("INVALID_TOKEN", 401);
  }

  if (error.name === "TokenExpiredError") {
    return apiError("TOKEN_EXPIRED", 401);
  }

  return apiError(defaultCode, 401);
};

export const handleDatabaseError = (error, defaultCode = "DB_ERROR") => {
  if (error.code === 11000) {
    return apiError("DUPLICATE_KEY", 409);
  }

  if (error.name === "CastError") {
    return badRequest("CAST_ERROR");
  }

  return apiError(defaultCode, 500);
};
