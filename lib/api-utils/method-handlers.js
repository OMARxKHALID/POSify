/**
 * HTTP Method Handlers
 * Handles unsupported HTTP methods with consistent error responses
 */

import { apiError } from "./api-response.js";

/**
 * Universal HTTP method handler for unsupported methods
 * Creates handlers for all unsupported HTTP methods
 */
export const createMethodHandler = (allowedMethods = ["GET"]) => {
  const handler = {};

  ["GET", "POST", "PUT", "DELETE", "PATCH"].forEach((method) => {
    if (!allowedMethods.includes(method)) {
      handler[method] = () => apiError("METHOD_NOT_ALLOWED", 405);
    }
  });

  return handler;
};

/**
 * Create a read-only API (GET only)
 */
export const createReadOnlyHandler = () => createMethodHandler(["GET"]);

/**
 * Create a write-only API (POST only)
 */
export const createWriteOnlyHandler = () => createMethodHandler(["POST"]);

/**
 * Create a CRUD API (GET, POST, PUT, DELETE)
 */
export const createCrudHandler = () =>
  createMethodHandler(["GET", "POST", "PUT", "DELETE"]);

/**
 * Create a custom method handler with specific allowed methods
 */
export const createCustomMethodHandler = (allowedMethods) => {
  if (!Array.isArray(allowedMethods) || allowedMethods.length === 0) {
    throw new Error("INVALID_METHODS_ARRAY");
  }

  return createMethodHandler(allowedMethods);
};

/**
 * Middleware to check if HTTP method is allowed
 */
export const validateHttpMethod = (allowedMethods) => {
  return (request) => {
    const method = request.method;
    if (!allowedMethods.includes(method)) {
      return apiError("METHOD_NOT_ALLOWED", 405);
    }
    return null; // Continue to next handler
  };
};
