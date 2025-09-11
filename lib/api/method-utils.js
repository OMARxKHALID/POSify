// API method utilities
import { apiError } from "./response-utils";

export const createMethodHandler = (allowedMethods = ["GET"]) => {
  const handler = {};

  ["GET", "POST", "PUT", "DELETE", "PATCH"].forEach((method) => {
    if (!allowedMethods.includes(method)) {
      handler[method] = () => apiError("METHOD_NOT_ALLOWED", 405);
    }
  });

  return handler;
};

export const createReadOnlyHandler = () => createMethodHandler(["GET"]);

export const createWriteOnlyHandler = () => createMethodHandler(["POST"]);

export const createCrudHandler = () =>
  createMethodHandler(["GET", "POST", "PUT", "DELETE"]);

export const createCustomMethodHandler = (allowedMethods) => {
  if (!Array.isArray(allowedMethods) || allowedMethods.length === 0) {
    throw new Error("INVALID_METHODS_ARRAY");
  }

  return createMethodHandler(allowedMethods);
};

export const validateHttpMethod = (allowedMethods) => {
  return (request) => {
    const method = request.method;
    if (!allowedMethods.includes(method)) {
      return apiError("METHOD_NOT_ALLOWED", 405);
    }
    return null; // Continue to next handler
  };
};
