/**
 * Redirect Helper Functions
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
    currentPath === ORG_ROUTES.REGISTER &&
    organizationId &&
    onboardingCompleted
  ) {
    return ADMIN_ROUTES.ANALYTICS;
  }

  // Rule 2: Users without organization → org register page
  if (!organizationId && currentPath !== ORG_ROUTES.REGISTER) {
    return ORG_ROUTES.REGISTER;
  }

  // Rule 3: Users with organization but incomplete onboarding → org register
  if (
    organizationId &&
    !onboardingCompleted &&
    currentPath !== ORG_ROUTES.REGISTER
  ) {
    return ORG_ROUTES.REGISTER;
  }

  // Rule 4: Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate page based on role
    if (role === "super_admin") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    if (role === "admin" || role === "staff") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    return ORG_ROUTES.REGISTER;
  }

  // Rule 5: Super admin → analytics (default)
  if (role === "super_admin") {
    return ADMIN_ROUTES.ANALYTICS;
  }

  // Rule 6: Admin/Staff with organization → analytics
  if ((role === "admin" || role === "staff") && organizationId) {
    return ADMIN_ROUTES.ANALYTICS;
  }

  // Default fallback
  return null;
}
