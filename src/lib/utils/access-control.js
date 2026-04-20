import { DEFAULT_PERMISSIONS } from "@/features/users/constants/users.constants";

export function getUserPermissions(user) {
  if (!user) return [];
  const rolePermissions = DEFAULT_PERMISSIONS[user.role] || [];
  const customPermissions = user.permissions || [];
  return Array.from(new Set([...rolePermissions, ...customPermissions]));
}

export function hasAnyPermission(user, permissions) {
  if (!permissions || permissions.length === 0) return true;
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
}

export function hasAllowedRole(user, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(user.role);
}

export function filterNavigationByPermissions(navigation, user) {
  const filtered = {};

  Object.entries(navigation).forEach(([section, items]) => {
    const filteredItems = items.filter((item) => {
      if (user?.role === "super_admin" && !user.permissions?.length) {
        return true;
      }
      return (
        hasAnyPermission(user, item.permissions) &&
        hasAllowedRole(user, item.roles)
      );
    });

    if (filteredItems.length > 0) {
      filtered[section] = filteredItems;
    }
  });

  return filtered;
}

export const canEditUser = (currentUser, targetUser) => {
  const currentUserId = currentUser?._id || currentUser?.id;
  const targetUserId = targetUser?._id || targetUser?.id;
  const isCurrentUser = currentUserId && targetUserId && currentUserId === targetUserId;
  return (
    currentUser?.role === "super_admin" ||
    (currentUser?.role === "admin" && targetUser?.role === "staff") ||
    isCurrentUser
  );
};

export const canDeleteUser = (currentUser, targetUser) => {
  const currentUserId = currentUser?._id || currentUser?.id;
  const targetUserId = targetUser?._id || targetUser?.id;
  const isCurrentUser = currentUserId && targetUserId && currentUserId === targetUserId;
  return (
    (currentUser?.role === "super_admin" ||
      (currentUser?.role === "admin" && targetUser?.role === "staff")) &&
    !isCurrentUser
  );
};

export const canCreateUsers = (currentUser) => {
  return currentUser?.role === "admin";
};

export const canChangeRole = (currentUser, targetUser) => {
  return (
    currentUser?.role === "super_admin" ||
    (currentUser?.role === "admin" && targetUser?.role === "staff")
  );
};

export const canChangeStatus = (currentUser, targetUser) => {
  const currentUserId = currentUser?._id || currentUser?.id;
  const targetUserId = targetUser?._id || targetUser?.id;
  const isCurrentUser = currentUserId && targetUserId && currentUserId === targetUserId;
  return (
    (currentUser?.role === "super_admin" ||
      (currentUser?.role === "admin" && targetUser?.role === "staff")) &&
    !isCurrentUser
  );
};
