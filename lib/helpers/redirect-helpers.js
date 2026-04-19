

import { AUTH_ROUTES, ADMIN_ROUTES, ORG_ROUTES } from "@/constants";


export function getRedirectPath(user, currentPath, allowedRoles = []) {
  if (!user) return null;

  const { role, organizationId, onboardingCompleted } = user;


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


  if (
    currentPath === ORG_ROUTES.REGISTER &&
    organizationId &&
    onboardingCompleted
  ) {
    return ADMIN_ROUTES.ANALYTICS;
  }


  if (!organizationId && currentPath !== ORG_ROUTES.REGISTER) {
    return ORG_ROUTES.REGISTER;
  }


  if (
    organizationId &&
    !onboardingCompleted &&
    currentPath !== ORG_ROUTES.REGISTER
  ) {
    return ORG_ROUTES.REGISTER;
  }


  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {

    if (role === "super_admin") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    if (role === "admin" || role === "staff") {
      return ADMIN_ROUTES.ANALYTICS;
    }
    return ORG_ROUTES.REGISTER;
  }


  if (role === "super_admin") {
    return ADMIN_ROUTES.ANALYTICS;
  }


  if ((role === "admin" || role === "staff") && organizationId) {
    return ADMIN_ROUTES.ANALYTICS;
  }


  return null;
}
