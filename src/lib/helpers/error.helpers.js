const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED:
    "You need to be signed in to continue. Please log in.",
  INVALID_CREDENTIALS: "Incorrect email or password. Please try again.",
  INACTIVE_ACCOUNT: "Your account is inactive. Contact support for assistance.",

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

  USER_NOT_FOUND: "No matching user found. Please check your details.",
  USER_EXISTS:
    "This email is already in use. Please use a different email address.",
  SUPER_ADMIN_EXISTS: "A super admin already exists in the system.",
  INVALID_USER_ID: "The user ID provided is not valid.",
  INVALID_ROLE_FOR_ADMIN: "Admins can only create staff accounts.",
  INVALID_FIELDS_FOR_STAFF: "Staff accounts can only update their password.",
  CANNOT_EDIT_ADMIN: "Admins cannot edit other admin accounts.",
  CANNOT_DEACTIVATE_SELF: "You cannot deactivate your own account.",
  CANNOT_DELETE_ADMIN: "Admin accounts cannot be deleted.",
  CANNOT_DELETE_SELF: "You cannot delete your own account.",
  CANNOT_DELETE_ORG_OWNER_NO_STAFF:
    "Cannot delete organization owner. No staff members available to transfer ownership. Please create a staff member first, then promote them to admin before deleting this user.",
  CANNOT_DELETE_ORG_OWNER_HAS_STAFF:
    "Cannot delete organization owner. Please transfer ownership to an existing staff member first, then delete this user.",
  INVALID_NEW_OWNER:
    "The selected user must be a staff member in the same organization.",
  INACTIVE_NEW_OWNER:
    "The selected user account is inactive and cannot receive ownership.",
  CANNOT_TRANSFER_TO_SELF: "You cannot transfer ownership to yourself.",
  ORGANIZATION_INACTIVE:
    "The organization is inactive and ownership cannot be transferred.",
  OWNERSHIP_ALREADY_TRANSFERRED:
    "Organization ownership has already been transferred by another user.",
  TRANSFER_FAILED: "We couldn't transfer ownership. Please try again.",
  UPDATE_FAILED: "We couldn't update the user. Please try again.",
  DELETE_FAILED: "We couldn't delete the user. Please try again.",

  ORGANIZATION_NOT_FOUND: "Organization not found. Please contact support.",
  ORGANIZATION_EXISTS:
    "An organization with this name already exists. Choose a different name.",
  USER_ALREADY_HAS_ORGANIZATION:
    "This user already belongs to an organization.",
  ORGANIZATION_REQUIRED:
    "An organization is required for admin and staff accounts.",
  NO_ORGANIZATION_FOUND: "No organization is linked to this user.",
  NO_ORGANIZATION_OVERVIEW: "No organization overview available.",

  VALIDATION_ERROR: "Some inputs are invalid. Please check and try again.",
  INVALID_JSON: "The data format is invalid. Please try again.",
  DB_CONNECTION_ERROR:
    "We couldn't connect to the database. Please try again later.",
  INVALID_TIME_RANGE: "Invalid time range. Allowed values: 7d, 30d, 90d.",

  INSUFFICIENT_PERMISSIONS: "You don't have permission to perform this action.",

  LOGIN_FAILED: "We couldn't log you in. Please try again.",
  REGISTRATION_FAILED: "We couldn't complete registration. Please try again.",
  OPERATION_FAILED: "The operation failed. Please try again.",
  FETCH_FAILED: "We couldn't load the data. Please try again.",
  USER_CREATION_FAILED: "We couldn't create the user. Please try again.",
  ANALYTICS_FETCH_FAILED: "We couldn't load analytics data. Please try again.",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",

  MENU_ITEM_CREATION_FAILED:
    "We couldn't create the menu item. Please try again.",
  MENU_ITEM_NAME_EXISTS: "A menu item with this name already exists.",
  CATEGORY_NOT_FOUND: "The selected category was not found.",
  CATEGORY_NOT_IN_ORGANIZATION:
    "The selected category doesn't belong to your organization.",
  MENU_ITEM_NOT_FOUND: "The menu item was not found.",
  MENU_ITEM_HAS_ORDERS: "Cannot delete menu item that has been ordered.",
  INVALID_MENU_ITEM_ID: "Invalid menu item ID provided.",

  ORDER_CREATION_FAILED: "We couldn't create the order. Please try again.",
  ORDER_NOT_FOUND: "The order was not found.",
  ORDER_UPDATE_FAILED: "We couldn't update the order. Please try again.",
  ORDER_DELETE_FAILED: "We couldn't delete the order. Please try again.",
  ORDER_STATUS_UPDATE_FAILED:
    "We couldn't update the order status. Please try again.",
  ORDER_REFUND_FAILED: "We couldn't process the refund. Please try again.",
  INVALID_ORDER_ID: "Invalid order ID provided.",
  ORDERS_RETRIEVAL_FAILED: "We couldn't load orders. Please try again.",

  TRANSACTION_CREATION_FAILED:
    "We couldn't create the transaction. Please try again.",
  TRANSACTION_NOT_FOUND: "The transaction was not found.",
  TRANSACTION_UPDATE_FAILED:
    "We couldn't update the transaction. Please try again.",
  TRANSACTION_DELETE_FAILED:
    "We couldn't delete the transaction. Please try again.",
  TRANSACTION_RETRIEVAL_FAILED:
    "We couldn't load transactions. Please try again.",
  TRANSACTION_STATS_RETRIEVAL_FAILED:
    "We couldn't load transaction statistics. Please try again.",
  INVALID_TRANSACTION_ID: "Invalid transaction ID provided.",
  INVALID_TRANSACTION_TYPE: "Invalid transaction type provided.",
  INVALID_TRANSACTION_AMOUNT: "Transaction amount must be greater than 0.",
  TRANSACTION_NUMBER_EXISTS: "A transaction with this number already exists.",
};

const SUCCESS_MESSAGES = {
  LOGIN_SUCCESSFUL: "Login successful! Redirecting...",

  USER_REGISTERED_SUCCESSFULLY: "User registered successfully!",
  SUPER_ADMIN_REGISTERED_SUCCESSFULLY: "Super admin registered successfully!",
  USER_CREATED_SUCCESSFULLY: "User created successfully!",
  USER_UPDATED_SUCCESSFULLY: "User updated successfully!",
  USER_DELETED_SUCCESSFULLY: "User deleted successfully!",

  ORGANIZATION_REGISTERED_SUCCESSFULLY: "Organization registered successfully!",
  OWNERSHIP_TRANSFERRED_SUCCESSFULLY: "Ownership transferred successfully!",

  MENU_ITEM_CREATED_SUCCESSFULLY: "Menu item created successfully!",
  MENU_ITEM_UPDATED_SUCCESSFULLY: "Menu item updated successfully!",
  MENU_ITEM_DELETED_SUCCESSFULLY: "Menu item deleted successfully!",

  ORDER_CREATED_SUCCESSFULLY: "Order created successfully!",
  ORDER_UPDATED_SUCCESSFULLY: "Order updated successfully!",
  ORDER_DELETED_SUCCESSFULLY: "Order deleted successfully!",
  ORDER_STATUS_UPDATED_SUCCESSFULLY: "Order status updated successfully!",
  ORDER_REFUND_PROCESSED_SUCCESSFULLY: "Refund processed successfully!",

  TRANSACTION_CREATED_SUCCESSFULLY: "Transaction created successfully!",
  TRANSACTION_UPDATED_SUCCESSFULLY: "Transaction updated successfully!",
  TRANSACTION_DELETED_SUCCESSFULLY: "Transaction deleted successfully!",

  SETTINGS_UPDATED_SUCCESSFULLY: "Settings updated successfully!",
};

const DEFAULT_MESSAGES = {
  auth: "An authentication error occurred. Please try again.",
  api: "Something went wrong. Please try again later.",
};

export function getErrorMessage(errorCode, context = "api") {
  return (
    ERROR_MESSAGES[errorCode] ||
    DEFAULT_MESSAGES[context] ||
    DEFAULT_MESSAGES.api
  );
}

export function getSuccessMessage(successCode) {
  return SUCCESS_MESSAGES[successCode] || "Operation completed successfully!";
}

export { ERROR_MESSAGES, SUCCESS_MESSAGES };
