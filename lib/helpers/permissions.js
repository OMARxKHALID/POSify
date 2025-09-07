/**
 * Permission Helper Functions
 * Handles user permission checking and navigation filtering
 */

import { DEFAULT_PERMISSIONS } from "@/constants";

/**
 * Get user permissions (custom permissions override role-based permissions)
 */
export function getUserPermissions(user) {
  if (!user) return [];

  // Custom permissions take precedence over role permissions
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions;
  }

  // Fall back to role-based permissions
  return DEFAULT_PERMISSIONS[user.role] || [];
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(user, permissions) {
  if (!permissions || permissions.length === 0) return true;
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Check if user role is allowed
 */
export function hasAllowedRole(user, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(user.role);
}

/**
 * Filter navigation items based on user permissions
 */
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
