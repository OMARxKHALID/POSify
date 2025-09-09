/**
 * Error Handlers
 * Handles various types of errors and converts them to consistent API responses
 */

import {
  apiError,
  badRequest,
  validationError,
  mongooseValidationError,
} from "./api-response.js";

/**
 * Universal error handler for API routes
 * Handles all common error types (MongoDB, Mongoose, etc.)
 */
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

/**
 * Handle validation-specific errors
 */
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

/**
 * Handle authentication/authorization errors
 */
export const handleAuthError = (error, defaultCode = "UNAUTHORIZED") => {
  if (error.name === "JsonWebTokenError") {
    return apiError("INVALID_TOKEN", 401);
  }

  if (error.name === "TokenExpiredError") {
    return apiError("TOKEN_EXPIRED", 401);
  }

  return apiError(defaultCode, 401);
};

/**
 * Handle database-specific errors
 */
export const handleDatabaseError = (error, defaultCode = "DB_ERROR") => {
  if (error.code === 11000) {
    return apiError("DUPLICATE_KEY", 409);
  }

  if (error.name === "CastError") {
    return badRequest("CAST_ERROR");
  }

  return apiError(defaultCode, 500);
};
