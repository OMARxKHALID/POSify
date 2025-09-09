/**
 * Comprehensive Error Message Helper
 * Maps error codes to user-friendly messages across the application
 */

const ERROR_MESSAGES = {
  // Authentication
  AUTHENTICATION_REQUIRED:
    "You need to be signed in to continue. Please log in.",
  INVALID_CREDENTIALS: "Incorrect email or password. Please try again.",
  INACTIVE_ACCOUNT: "Your account is inactive. Contact support for assistance.",
  CREDENTIALS_SIGNIN: "Incorrect email or password. Please try again.",

  // NextAuth specific error codes
  SIGNIN: "Sign-in failed. Try again with a different account.",
  OAUTH_SIGNIN: "Unable to sign in. Try again with a different account.",
  OAUTH_CALLBACK: "Sign-in failed. Try again with a different account.",
  OAUTH_CREATE_ACCOUNT:
    "Unable to create an account. Try again with a different account.",
  EMAIL_CREATE_ACCOUNT:
    "Unable to create an account. Try again with a different email.",
  CALLBACK: "Sign-in failed. Try again with a different account.",
  OAUTH_ACCOUNT_NOT_LINKED:
    "Please sign in with the same account you originally used.",
  EMAIL_SIGNIN: "Check your email inbox for the sign-in link.",
  SESSION_REQUIRED: "Your session has expired. Please sign in again.",

  // User management
  USER_NOT_FOUND: "No matching user found. Please check your details.",
  USER_EXISTS:
    "This email is already in use. Please use a different email address.",
  SUPER_ADMIN_EXISTS: "A super admin already exists in the system.",
  INACTIVE_USER: "This account is inactive. Contact support for assistance.",
  TARGET_USER_NOT_FOUND: "No matching user found. Please check your details.",
  INVALID_USER_ID: "The user ID provided is not valid.",
  INVALID_ROLE_FOR_ADMIN: "Admins can only create staff accounts.",
  INVALID_FIELDS_FOR_STAFF: "Staff accounts can only update their password.",
  CANNOT_EDIT_ADMIN: "Admins cannot edit other admin accounts.",
  CANNOT_DEACTIVATE_SELF: "You cannot deactivate your own account.",
  EMAIL_ALREADY_EXISTS:
    "This email is already in use. Please use a different one.",
  CANNOT_DELETE_ADMIN: "Admin accounts cannot be deleted.",
  CANNOT_DELETE_SELF: "You cannot delete your own account.",
  CANNOT_DELETE_ORG_OWNER_NO_STAFF:
    "Cannot delete organization owner. No staff members available to transfer ownership. Please create a staff member first, then promote them to admin before deleting this user.",
  CANNOT_DELETE_ORG_OWNER_HAS_STAFF:
    "Cannot delete organization owner. Please transfer ownership to an existing staff member first, then delete this user.",
  INVALID_NEW_OWNER:
    "The selected user must be a staff member in the same organization.",
  TRANSFER_FAILED: "We couldn't transfer ownership. Please try again.",
  UPDATE_FAILED: "We couldn't update the user. Please try again.",
  DELETE_FAILED: "We couldn't delete the user. Please try again.",

  // Organization management
  ORGANIZATION_NOT_FOUND: "Organization not found. Please contact support.",
  ORGANIZATION_EXISTS:
    "An organization with this name already exists. Choose a different name.",
  USER_ALREADY_HAS_ORGANIZATION:
    "This user already belongs to an organization.",
  ORGANIZATION_REQUIRED:
    "An organization is required for admin and staff accounts.",
  NO_ORGANIZATION_FOUND: "No organization is linked to this user.",
  NO_ORGANIZATION_OVERVIEW: "No organization overview available.",

  // Validation & System errors
  VALIDATION_ERROR: "Some inputs are invalid. Please check and try again.",
  INVALID_JSON: "The data format is invalid. Please try again.",
  DB_CONNECTION_ERROR:
    "We couldn’t connect to the database. Please try again later.",
  INVALID_TIME_RANGE: "Invalid time range. Allowed values: 7d, 30d, 90d.",

  // Permission errors
  INSUFFICIENT_PERMISSIONS: "You don’t have permission to perform this action.",

  // Generic errors
  LOGIN_FAILED: "We couldn’t log you in. Please try again.",
  REGISTRATION_FAILED: "We couldn’t complete registration. Please try again.",
  OPERATION_FAILED: "The operation failed. Please try again.",
  FETCH_FAILED: "We couldn’t load the data. Please try again.",
};

/**
 * Default error messages for different contexts
 */
const DEFAULT_MESSAGES = {
  auth: "An authentication error occurred. Please try again.",
  api: "Something went wrong. Please try again later.",
};

/**
 * Get error message by code with fallback
 */
export function getErrorMessage(errorCode, context = "api") {
  return ERROR_MESSAGES[errorCode] || DEFAULT_MESSAGES[context];
}

/**
 * Export error message constants for direct access
 */
export { ERROR_MESSAGES };
