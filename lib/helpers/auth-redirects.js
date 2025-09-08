/**
 * Authentication Redirect Helper
 * Centralized redirect logic for user authentication flows
 */

import { AUTH_ROUTES, ADMIN_ROUTES, ORG_ROUTES } from "@/constants";

/**
 * Get the appropriate redirect path based on user state
 */
export function getRedirectPath(user, currentPath, allowedRoles = []) {
  if (!user) return null;

  const { role, organizationId, onboardingCompleted } = user;

  // Special case: If user is on login page, always redirect to appropriate page
  if (currentPath === AUTH_ROUTES.LOGIN) {
    if (role === "super_admin") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    if (!organizationId) {
      return ORG_ROUTES.REGISTER;
    }
    if (!onboardingCompleted) {
      return ORG_ROUTES.REGISTER;
    }
    return ADMIN_ROUTES.ANALYTICS;
  }

  // Rule 1: Users with completed onboarding on org register page → analytics
  if (
    role === "admin" &&
    organizationId &&
    onboardingCompleted &&
    currentPath === ORG_ROUTES.REGISTER
  ) {
    return ADMIN_ROUTES.ANALYTICS;
  }

  // Rule 2: Users without organization → org register (if not already there)
  if (
    (role === "pending" || role === "admin") &&
    !organizationId &&
    currentPath !== ORG_ROUTES.REGISTER
  ) {
    return ORG_ROUTES.REGISTER;
  }

  // Rule 3: Users with incomplete onboarding → org register (if not already there)
  if (
    role === "admin" &&
    organizationId &&
    !onboardingCompleted &&
    currentPath !== ORG_ROUTES.REGISTER
  ) {
    return ORG_ROUTES.REGISTER;
  }

  // Rule 4: Users with wrong role for this page → appropriate page
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return role === "pending" ? ORG_ROUTES.REGISTER : ADMIN_ROUTES.ANALYTICS;
  }

  return null;
}

/**
 * Check if user should be redirected
 */
export function shouldRedirect(user, currentPath, allowedRoles = []) {
  return getRedirectPath(user, currentPath, allowedRoles) !== null;
}
