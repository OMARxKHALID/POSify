/**
 * Authentication Helpers
 * Centralized authentication utilities for API routes
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";

/**
 * Get authenticated user from session
 * Centralized function to avoid duplication across API routes
 */
export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("AUTHENTICATION_REQUIRED");
  }

  const currentUser = await User.findById(session.user.id).select(
    "-password -inviteToken -__v"
  );

  if (!currentUser) {
    throw new Error("USER_NOT_FOUND");
  }

  return currentUser;
};

/**
 * Check if user has required role
 */
export const hasRole = (user, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(user.role);
};

/**
 * Check if user has required permissions
 */
export const hasPermission = (user, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }

  const userPermissions = user.permissions || [];
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

/**
 * Validate user can access organization
 */
export const validateOrganizationAccess = (user, organizationId) => {
  if (user.role === "super_admin") {
    return true; // Super admin can access any organization
  }

  if (!user.organizationId) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  if (user.organizationId.toString() !== organizationId.toString()) {
    throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  return true;
};
