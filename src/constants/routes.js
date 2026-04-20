export const AUTH_ROUTES = {
  LOGIN: "/admin/login",
  REGISTER: "/register",
  HOME: "/",
};

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  OVERVIEW: "/admin/dashboard/overview",
  ANALYTICS: "/admin/dashboard/analytics",
  SETTINGS: "/admin/dashboard/settings",
  ORGANIZATION: "/admin/dashboard/organization",
  USERS: "/admin/dashboard/users",
  AUDIT_LOGS: "/admin/dashboard/audit-logs",
  MENU: "/admin/dashboard/menu",
  CATEGORIES: "/admin/dashboard/categories",
  ORDERS: "/admin/dashboard/orders",
  TRANSACTIONS: "/admin/dashboard/transactions",
  REPORTS: "/admin/dashboard/reports",
  NOTIFICATIONS: "/admin/dashboard/notifications",
};

export const ORG_ROUTES = {
  REGISTER: "/organization/register",
};

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.HOME,
  ORG_ROUTES.REGISTER,
];

export const DEFAULT_REDIRECTS = {
  AFTER_LOGIN: ADMIN_ROUTES.ANALYTICS,
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
  FALLBACK: ADMIN_ROUTES.ANALYTICS,
};

export const ROLE_DEFAULT_ROUTES = {
  super_admin: ADMIN_ROUTES.USERS,
  admin: ADMIN_ROUTES.OVERVIEW,
  staff: "/pos",
};

export const getDefaultRouteForRole = (role) => {
  return ROLE_DEFAULT_ROUTES[role] || ADMIN_ROUTES.OVERVIEW;
};
