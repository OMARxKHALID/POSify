import { ADMIN_ROUTES, AUTH_ROUTES, ORG_ROUTES } from "@/constants";

export function getRedirectPath(user, currentPath, allowedRoles = []) {
  if (!user) return null;

  const { role, organizationId, onboardingCompleted } = user;
  const isSuperAdmin = role === "super_admin";
  const needsOnboarding = !organizationId || !onboardingCompleted;

  if (currentPath === AUTH_ROUTES.LOGIN) {
    if (isSuperAdmin) return ADMIN_ROUTES.ANALYTICS;
    if (needsOnboarding) return ORG_ROUTES.REGISTER;
    return ADMIN_ROUTES.ANALYTICS;
  }

  if (currentPath === ORG_ROUTES.REGISTER) {
    if (isSuperAdmin || !needsOnboarding) return ADMIN_ROUTES.ANALYTICS;
    return null;
  }

  if (!isSuperAdmin && needsOnboarding) {
    return ORG_ROUTES.REGISTER;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (isSuperAdmin || role === "admin" || role === "staff") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    return ORG_ROUTES.REGISTER;
  }

  return null;
}
