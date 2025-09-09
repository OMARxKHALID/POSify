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
} from "./api-response.js";

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
} from "./route-helpers";

// Authentication helpers
export {
  getAuthenticatedUser,
  hasRole,
  hasPermission,
  validateOrganizationAccess,
} from "./auth-helpers";

// Response helpers
export {
  formatUserData,
  formatAuditLogData,
  formatOrganizationData,
  cleanUserResponse,
} from "./response-helpers";

// ResponseBuilder removed - use Next.js NextResponse.json() directly
