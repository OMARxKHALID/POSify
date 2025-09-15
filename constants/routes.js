/**
 * Route Constants
 * Centralized route definitions for the application
 */

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: "/admin/login",
  REGISTER: "/register",
  HOME: "/",
};

// Admin Routes
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
  REPORTS: "/admin/dashboard/reports",
  NOTIFICATIONS: "/admin/dashboard/notifications",
};

// Organization Routes
export const ORG_ROUTES = {
  REGISTER: "/organization/register",
};

// API Routes
export const API_ROUTES = {
  AUTH: "/api/auth",
  ORGANIZATIONS: "/api/organizations",
  REGISTER: "/api/register",
};

// Public Routes (don't require authentication)
export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.HOME,
  ORG_ROUTES.REGISTER,
  API_ROUTES.AUTH,
];

// Default Redirects
export const DEFAULT_REDIRECTS = {
  AFTER_LOGIN: ADMIN_ROUTES.ANALYTICS,
  AFTER_LOGOUT: AUTH_ROUTES.LOGIN,
  FALLBACK: ADMIN_ROUTES.ANALYTICS,
};
