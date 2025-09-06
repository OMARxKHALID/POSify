/**
 * Authentication Redirect Helper
 * Centralized redirect logic to avoid duplication
 */

/**
 * Get the appropriate redirect path based on user state
 */
export function getRedirectPath(user, currentPath, allowedRoles = []) {
  if (!user) return null;

  const { role, organizationId, onboardingCompleted } = user;

  // Rule 1: Users with completed onboarding on org register page → dashboard
  if (
    role === "admin" &&
    organizationId &&
    onboardingCompleted &&
    currentPath === "/organization/register"
  ) {
    return "/admin/dashboard";
  }

  // Rule 2: Users without organization → org register (if not already there)
  if (
    (role === "pending" || role === "admin") &&
    !organizationId &&
    currentPath !== "/organization/register"
  ) {
    return "/organization/register";
  }

  // Rule 3: Users with incomplete onboarding → org register (if not already there)
  if (
    role === "admin" &&
    organizationId &&
    !onboardingCompleted &&
    currentPath !== "/organization/register"
  ) {
    return "/organization/register";
  }

  // Rule 4: Users with wrong role for this page → appropriate page
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return role === "pending" ? "/organization/register" : "/admin/dashboard";
  }

  return null;
}

/**
 * Check if user should be redirected
 */
export function shouldRedirect(user, currentPath, allowedRoles = []) {
  return getRedirectPath(user, currentPath, allowedRoles) !== null;
}
