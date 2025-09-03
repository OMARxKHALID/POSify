/**
 * API Response Utilities
 * Provides consistent response formats across all API endpoints
 */

/**
 * Success Response Helper
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export function apiSuccess(
  data = null,
  message = "Request successful",
  statusCode = 200
) {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error Response Helper
 * @param {string} message - Error message
 * @param {string} code - Error code for client handling
 * @param {Array} details - Detailed error information
 * @param {number} statusCode - HTTP status code (default: 400)
 */
export function apiError(
  message = "Request failed",
  code = "ERROR",
  details = [],
  statusCode = 400
) {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validation Error Response Helper
 * @param {Array} validationErrors - Zod or Mongoose validation errors
 * @param {number} statusCode - HTTP status code (default: 400)
 */
export function apiValidationError(validationErrors, statusCode = 400) {
  const details = validationErrors.map((error) => {
    // Handle Mongoose validation errors (error.path is a string)
    if (error.path && typeof error.path === "string") {
      return {
        field: error.path,
        issue: error.message,
      };
    }
    // Handle Zod validation errors (error.path is an array)
    else if (error.path && Array.isArray(error.path)) {
      return {
        field: error.path.join("."),
        issue: error.message,
      };
    }
    // Fallback for other error types
    else {
      return {
        field: error.field || "unknown",
        issue: error.issue || error.message || "Validation error",
      };
    }
  });

  return apiError("Validation failed", "VALIDATION_ERROR", details, statusCode);
}

/**
 * Not Found Error Response Helper
 * @param {string} resource - Resource that was not found
 */
export function apiNotFound(resource = "Resource") {
  return apiError(`${resource} not found`, "NOT_FOUND", [], 404);
}

/**
 * Unauthorized Error Response Helper
 * @param {string} message - Custom unauthorized message
 */
export function apiUnauthorized(message = "Unauthorized access") {
  return apiError(message, "UNAUTHORIZED", [], 401);
}

/**
 * Forbidden Error Response Helper
 * @param {string} message - Custom forbidden message
 */
export function apiForbidden(message = "Access forbidden") {
  return apiError(message, "FORBIDDEN", [], 403);
}

/**
 * Internal Server Error Response Helper
 * @param {string} message - Custom error message
 */
export function apiInternalError(message = "Internal server error") {
  return apiError(message, "INTERNAL_ERROR", [], 500);
}

/**
 * Conflict Error Response Helper
 * @param {string} message - Conflict message
 */
export function apiConflict(message = "Resource conflict") {
  return apiError(message, "CONFLICT", [], 409);
}
