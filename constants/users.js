/**
 * User & Security Constants
 */

export const USER_ROLES = ["super_admin", "admin", "staff", "pending"];

export const USER_STATUSES = ["active", "inactive", "suspended"];

export const SALT_ROUNDS = 12;

export const DEFAULT_PERMISSIONS = {
  super_admin: ["users:manage", "organizations:manage", "audit:view"],
  admin: [
    "organizations:manage",
    "dashboard:view",
    "menu:manage",
    "category:manage",
    "orders:manage",
    "users:manage",
    "settings:manage",
    "pos:access",
    "audit:view",
  ],
  staff: ["dashboard:view", "orders:manage", "pos:access"],
  pending: [],
};
