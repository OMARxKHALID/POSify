/**
 * API Utilities Index
 * Main export file for all API-related utilities
 */

// API Response functions
export {
  apiError,
  apiSuccess,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  validationError,
  mongooseValidationError,
} from "./response-utils";

// Error handling
export {
  handleApiError,
  handleValidationError,
  handleAuthError,
  handleDatabaseError,
} from "./error-utils";

// HTTP method handling
export {
  createMethodHandler,
  createReadOnlyHandler,
  createWriteOnlyHandler,
  createCrudHandler,
  createCustomMethodHandler,
  validateHttpMethod,
} from "./method-utils";

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
} from "./route-utils";

// Authentication helpers (from helpers)
export {
  getAuthenticatedUser,
  hasRole,
  hasPermission,
  validateOrganizationAccess,
} from "../helpers/auth-helpers";

// API-specific authentication utilities
export { checkUserExists, validateOrganizationExists } from "./auth-utils";

// Response formatting helpers (from helpers)
export {
  formatUserData,
  formatAuditLogData,
  formatOrganizationData,
  cleanUserResponse,
} from "../helpers/format-helpers";
