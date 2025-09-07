/**
 * Comprehensive Error Message Helper
 * Maps error codes to user-friendly messages across the application
 */

/**
 * Error message constants - Single source of truth
 */
const ERROR_MESSAGES = {
  // Authentication
  AUTHENTICATION_REQUIRED:
    "Authentication required. Please log in to continue.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  INACTIVE_ACCOUNT: "Your account is inactive. Please contact support.",
  CREDENTIALS_SIGNIN: "Invalid email or password. Please try again.",
  CALLBACK_ROUTE_ERROR: "Authentication failed. Please check your credentials.",
  CONFIGURATION: "There is a problem with the server configuration.",
  ACCESS_DENIED: "Access denied. You do not have permission to sign in.",
  VERIFICATION: "The verification token has expired or has already been used.",

  // User management
  USER_NOT_FOUND: "User not found. Please check your credentials.",
  USER_EXISTS:
    "A user with this email already exists. Please use a different email.",
  SUPER_ADMIN_EXISTS: "A super admin already exists in the system.",
  INACTIVE_USER: "User account is inactive. Please contact support.",

  // Organization management
  ORGANIZATION_NOT_FOUND: "Organization not found. Please contact support.",
  ORGANIZATION_EXISTS:
    "An organization with this name already exists. Please choose a different name.",
  USER_ALREADY_HAS_ORGANIZATION: "User already belongs to an organization.",

  // Validation & System errors
  VALIDATION_ERROR: "Please check your input and try again.",
  INVALID_JSON: "Invalid data format. Please try again.",
  DB_CONNECTION_ERROR: "Database connection failed. Please try again later.",

  // Generic errors
  LOGIN_FAILED: "Login failed. Please try again.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  OPERATION_FAILED: "Operation failed. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
};

/**
 * Default error messages for different contexts
 */
const DEFAULT_MESSAGES = {
  auth: "An error occurred during authentication. Please try again.",
  api: "An unexpected error occurred. Please try again.",
};

/**
 * Get error message by code with fallback
 */
function getErrorMessage(errorCode, context = "api") {
  return ERROR_MESSAGES[errorCode] || DEFAULT_MESSAGES[context];
}

/**
 * Authentication Error Messages
 * Maps NextAuth and authentication error codes to user-friendly messages
 */
export function getAuthErrorMessages(error) {
  return getErrorMessage(error, "auth");
}

/**
 * API Error Messages
 * Maps API error codes to user-friendly messages
 */
export function getApiErrorMessages(error) {
  return getErrorMessage(error, "api");
}

/**
 * User-friendly error messages for frontend display
 * Returns appropriate error messages based on error type
 */
export function getUserFriendlyErrorMessage(error, context = "api") {
  return getErrorMessage(error, context);
}

/**
 * Export error message constants for direct access
 */
export { ERROR_MESSAGES };
