/**
 * Error Handlers
 * Handles various types of errors and converts them to consistent API responses
 */

import { ResponseBuilder } from "./response-builder";

/**
 * Universal error handler for API routes
 * Handles all common error types (MongoDB, Mongoose, etc.)
 */
export const handleApiError = (
  error,
  defaultMessage = "An unexpected error occurred"
) => {
  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return ResponseBuilder.error({
      message: `${field} already exists`,
      code: "DUPLICATE_KEY",
      details: [{ field, issue: `${field} must be unique` }],
      statusCode: 409,
    });
  }

  // Handle mongoose validation errors
  if (error.name === "ValidationError") {
    return ResponseBuilder.fromMongoose(error);
  }

  // Handle invalid object IDs
  if (error.name === "CastError") {
    return ResponseBuilder.error({
      message: "Invalid resource identifier",
      code: "CAST_ERROR",
      statusCode: 400,
    });
  }

  // Handle database connection errors
  if (
    error.name === "MongoNetworkError" ||
    error.name === "MongoServerSelectionError"
  ) {
    return ResponseBuilder.error({
      message: "Database connection failed",
      code: "DB_CONNECTION_ERROR",
      statusCode: 503,
    });
  }

  // Handle timeout errors
  if (error.message && error.message.includes("timed out")) {
    return ResponseBuilder.error({
      message: "Database request timed out",
      code: "DB_TIMEOUT",
      statusCode: 504,
    });
  }

  // Handle unexpected errors
  return ResponseBuilder.internal(defaultMessage);
};

/**
 * Handle specific error types with custom messages
 */
export const handleValidationError = (
  error,
  customMessage = "Validation failed"
) => {
  if (error.constructor.name === "ZodError") {
    return ResponseBuilder.fromZod(error);
  }

  if (error.name === "ValidationError") {
    return ResponseBuilder.fromMongoose(error);
  }

  return ResponseBuilder.badRequest(customMessage);
};

/**
 * Handle authentication/authorization errors
 */
export const handleAuthError = (
  error,
  customMessage = "Authentication failed"
) => {
  if (error.name === "JsonWebTokenError") {
    return ResponseBuilder.unauthorized("Invalid token");
  }

  if (error.name === "TokenExpiredError") {
    return ResponseBuilder.unauthorized("Token expired");
  }

  return ResponseBuilder.unauthorized(customMessage);
};

/**
 * Handle database-specific errors
 */
export const handleDatabaseError = (
  error,
  customMessage = "Database operation failed"
) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return ResponseBuilder.conflict(`${field} already exists`);
  }

  if (error.name === "CastError") {
    return ResponseBuilder.badRequest("Invalid resource identifier");
  }

  return ResponseBuilder.internal(customMessage);
};
