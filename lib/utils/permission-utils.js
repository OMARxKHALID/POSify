// Permission utilities for user permissions and navigation filtering
import { DEFAULT_PERMISSIONS } from "@/constants";

export function getUserPermissions(user) {
  if (!user) return [];

  // Custom permissions take precedence over role permissions
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions;
  }

  // Fall back to role-based permissions
  return DEFAULT_PERMISSIONS[user.role] || [];
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
      // Super admin gets access to everything (unless they have custom permissions)
      if (user?.role === "super_admin" && !user.permissions?.length) {
        return true;
      }

      // Check permissions and roles
      const hasPermission = hasAnyPermission(user, item.permissions);
      const hasRole = hasAllowedRole(user, item.roles);

      return hasPermission && hasRole;
    });

    // Only include section if it has items
    if (filteredItems.length > 0) {
      filtered[section] = filteredItems;
    }
  });

  return filtered;
}
