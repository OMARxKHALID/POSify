/**
 * Authentication Hooks Index
 * Centralized exports for all authentication-related hooks
 */

// Main registration hook
export {
  useRegistration,
  REGISTRATION_TYPES,
  useUserRegistration,
  useSuperAdminRegistration,
  useOrganizationRegistration,
} from "./use-registration.js";

// Re-export for convenience
export { useRegistration as default } from "./use-registration.js";
