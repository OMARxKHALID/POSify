/**
 * Authentication Constants
 * Centralized authentication-related constants
 */

// Form Defaults
export const FORM_DEFAULTS = {
  LOGIN: {
    email: "",
    password: "",
  },
  REGISTER: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
};

// Session Configuration
export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60, // 1 day in seconds
  UPDATE_AGE: 60 * 60, // 1 hour in seconds
  REFETCH_INTERVAL: 0, // Disable automatic refetch
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_WHEN_OFFLINE: false,
  REFETCH_ON_MOUNT: true,
};

// Cookie Configuration
export const COOKIE_CONFIG = {
  SESSION_TOKEN: {
    name: "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },
};

// Error Messages
export const AUTH_ERROR_MESSAGES = {
  VALIDATION_ERROR: "Please check your input and try again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  INACTIVE_ACCOUNT: "Your account is inactive. Please contact support.",
  ORGANIZATION_NOT_FOUND: "Organization not found.",
  LOGIN_FAILED: "Login failed. Please try again.",
};
