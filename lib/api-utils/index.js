/**
 * API Utilities Index
 * Main export file for all API-related utilities
 */

// Core response building
export { ResponseBuilder } from "./response-builder.js";

// Error handling
export {
  handleApiError,
  handleValidationError,
  handleAuthError,
  handleDatabaseError,
} from "./error-handlers.js";

// HTTP method handling
export {
  createMethodHandler,
  createReadOnlyHandler,
  createWriteOnlyHandler,
  createCrudHandler,
  createCustomMethodHandler,
  validateHttpMethod,
} from "./method-handlers.js";

// Route helpers
export {
  parseRequestBody,
  parseQueryParams,
  validateWithZod,
  connectDB,
  createRouteHandler,
  createGetHandler,
  createPostHandler,
  createPutHandler,
  createDeleteHandler,
  createGetRouteHandler,
} from "./route-helpers";

// Import ResponseBuilder for convenience exports
import { ResponseBuilder } from "./response-builder";

// Convenience exports for backward compatibility
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
export const apiBadRequest = ResponseBuilder.badRequest;
export const apiMethodNotAllowed = ResponseBuilder.methodNotAllowed;

// Default export
export default ResponseBuilder;
