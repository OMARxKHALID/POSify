/**
 * Response Builder Class
 * Handles building consistent API responses
 */

export class ResponseBuilder {
  /**
   * Build success response
   */
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

  /**
   * Build error response
   */
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

  /**
   * Build validation error from Zod
   */
  static fromZod(error, statusCode = 400) {
    // Check if it's a Zod error by looking for the errors property
    if (!error.errors || !Array.isArray(error.errors)) {
      return this.internal("Invalid Zod error");
    }

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

  /**
   * Build validation error from Mongoose
   */
  static fromMongoose(error, statusCode = 400) {
    if (error.name !== "ValidationError") {
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

  /**
   * Build generic validation error
   */
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

  // ============================================================================
  // COMMON ERROR SHORTCUTS
  // ============================================================================

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

  static badRequest(message = "Bad request") {
    return this.error({ message, code: "BAD_REQUEST", statusCode: 400 });
  }

  static methodNotAllowed(message = "Method not allowed") {
    return this.error({ message, code: "METHOD_NOT_ALLOWED", statusCode: 405 });
  }
}
