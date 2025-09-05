/**
 * Authentication Error Message Helper
 * Maps NextAuth error codes to user-friendly messages
 */

export function getAuthErrorMessage(error) {
  switch (error) {
    case "INVALID_CREDENTIALS":
      return "Invalid email or password. Please try again.";

    case "INACTIVE_ACCOUNT":
      return "Your account is inactive. Please contact support.";

    case "VALIDATION_ERROR":
      return "Please check your email and password format.";

    case "LOGIN_FAILED":
      return "Login failed. Please try again.";

    case "CREDENTIALS_SIGNIN":
      return "Invalid email or password. Please try again.";

    case "CALLBACK_ROUTE_ERROR":
      return "Authentication failed. Please check your credentials.";

    case "CONFIGURATION":
      return "There is a problem with the server configuration.";

    case "ACCESS_DENIED":
      return "Access denied. You do not have permission to sign in.";

    case "VERIFICATION":
      return "The verification token has expired or has already been used.";

    default:
      return "An error occurred during authentication. Please try again.";
  }
}
