// Authentication business logic helpers
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { User } from "@/models/user";
import { Organization } from "@/models/organization";

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

export const hasRole = (user, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(user.role);
};

export const hasPermission = (user, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) {
    requiredPermissions = [requiredPermissions];
  }

  const userPermissions = user.permissions || [];
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
};

export const checkUserExists = async (
  email,
  conflictMessage = "USER_EXISTS"
) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return { error: true, code: conflictMessage, status: 409 };
  }
  return null;
};

export const validateOrganizationExists = async (currentUser) => {
  if (!currentUser.organizationId) {
    return { error: true, code: "ORGANIZATION_NOT_FOUND", status: 404 };
  }

  const organization = await Organization.findById(
    currentUser.organizationId
  ).select("-__v");
  if (!organization) {
    return { error: true, code: "ORGANIZATION_NOT_FOUND", status: 404 };
  }

  return organization;
};

export const validateOrganizationAccess = (user, organizationId) => {
  if (user.role === "super_admin") {
    return true;
  }

  if (!user.organizationId) {
    throw new Error("ORGANIZATION_NOT_FOUND");
  }

  if (user.organizationId.toString() !== organizationId.toString()) {
    throw new Error("INSUFFICIENT_PERMISSIONS");
  }

  return true;
};
