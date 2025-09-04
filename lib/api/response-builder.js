/**
 * Response Builder Utility
 * Provides consistent API responses across the stack
 */
export class ResponseBuilder {
  // ============================================================================
  // SUCCESS RESPONSE
  // ============================================================================
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

  // ============================================================================
  // GENERIC ERROR RESPONSE
  // ============================================================================
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

  // ============================================================================
  // FRAMEWORK-SPECIFIC HANDLERS
  // ============================================================================

  /**
   * Zod validation error
   */
  static fromZod(error, statusCode = 400) {
    if (!error?.errors || !Array.isArray(error.errors)) {
      return ResponseBuilder.internal("Invalid Zod error");
    }

    const details = error.errors.map((e) => ({
      field: e.path.join("."),
      issue: e.message,
    }));

    return ResponseBuilder.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  /**
   * Mongoose validation error
   */
  static fromMongoose(error, statusCode = 400) {
    if (error?.name !== "ValidationError") {
      return ResponseBuilder.internal("Invalid Mongoose validation error");
    }

    const details = Object.values(error.errors).map((err) => ({
      field: err.path,
      issue: err.message,
    }));

    return ResponseBuilder.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  /**
   * Next.js (or generic JS) error
   */
  static fromNext(error, statusCode = 500) {
    if (!error) {
      return ResponseBuilder.internal("Unknown server error");
    }

    return ResponseBuilder.error({
      message: error.message || "Internal server error",
      code: error.code || "NEXT_ERROR",
      details: error.stack ? [{ issue: error.stack }] : [],
      statusCode,
    });
  }

  /**
   * Generic validation error (catch-all)
   */
  static validationError(errors = [], statusCode = 400) {
    const details = errors.map((e) => {
      if (Array.isArray(e.path)) {
        return { field: e.path.join("."), issue: e.message }; // Zod
      }
      if (typeof e.path === "string") {
        return { field: e.path, issue: e.message }; // Mongoose
      }
      return {
        field: e.field || "unknown",
        issue: e.message || "Validation error",
      };
    });

    return ResponseBuilder.error({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details,
      statusCode,
    });
  }

  // ============================================================================
  // COMMON ERROR SHORTCUTS
  // ============================================================================

  static notFound(resource = "Resource") {
    return ResponseBuilder.error({
      message: `${resource} not found`,
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }

  static unauthorized(message = "Unauthorized access") {
    return ResponseBuilder.error({
      message,
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
  }

  static forbidden(message = "Access forbidden") {
    return ResponseBuilder.error({
      message,
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }

  static internal(message = "Internal server error") {
    return ResponseBuilder.error({
      message,
      code: "INTERNAL_ERROR",
      statusCode: 500,
    });
  }

  static conflict(message = "Resource conflict") {
    return ResponseBuilder.error({
      message,
      code: "CONFLICT",
      statusCode: 409,
    });
  }

  static badRequest(message = "Bad request") {
    return ResponseBuilder.error({
      message,
      code: "BAD_REQUEST",
      statusCode: 400,
    });
  }

  static methodNotAllowed(message = "Method not allowed") {
    return ResponseBuilder.error({
      message,
      code: "METHOD_NOT_ALLOWED",
      statusCode: 405,
    });
  }
}
