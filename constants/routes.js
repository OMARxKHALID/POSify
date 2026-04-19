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

export const API_ROUTES = {
  AUTH: "/api/auth",
  ORGANIZATIONS: "/api/organizations",
  REGISTER: "/api/register",
};

export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.HOME,
  ORG_ROUTES.REGISTER,
  API_ROUTES.AUTH,
];

export const DEFAULT_REDIRECTS = {
  AFTER_LOGIN: ADMIN_ROUTES.ANALYTICS,
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
  FALLBACK: ADMIN_ROUTES.ANALYTICS,
};
