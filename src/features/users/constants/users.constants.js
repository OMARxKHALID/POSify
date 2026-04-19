export const USER_ROLES = ["super_admin", "admin", "staff", "pending"];

export const USER_STATUSES = ["active", "inactive", "suspended"];

export const SALT_ROUNDS = 12;

export const DEFAULT_PERMISSIONS = {
  super_admin: [
    "dashboard:view",
    "users:manage",
    "organizations:manage",
    "audit:view",
    "menu:manage",
    "category:manage",
    "orders:manage",
    "transactions:manage",
    "settings:manage",
    "pos:access",
    "reports:view",
  ],
  admin: [
    "organizations:manage",
    "dashboard:view",
    "menu:manage",
    "category:manage",
    "orders:manage",
    "transactions:manage",
    "users:manage",
    "settings:manage",
    "pos:access",
    "audit:view",
    "reports:view",
  ],
  staff: [
    "dashboard:view",
    "orders:manage",
    "transactions:manage",
    "pos:access",
  ],
  pending: [],
};
