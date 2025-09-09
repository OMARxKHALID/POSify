/**
 * Authentication Constants
 * Centralized authentication-related constants
 */

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

// Registration Types
export const REGISTRATION_TYPES = {
  USER: "user",
  SUPER_ADMIN: "super_admin",
  ORGANIZATION: "organization",
};

// Note: Error messages are now centralized in lib/helpers/error-messages.js
// Import getAuthErrorMessages from there instead of using this duplicate
