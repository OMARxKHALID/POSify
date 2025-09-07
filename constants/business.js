/**
 * Business & Organization Constants
 */

export const BUSINESS_TYPES = [
  "restaurant",
  "cafe",
  "bakery",
  "bar",
  "food-truck",
  "retail",
];

export const SUBSCRIPTION_PLANS = ["free", "basic", "premium", "enterprise"];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "inactive",
  "trialing",
  "past_due",
  "canceled",
];

export const ORGANIZATION_STATUSES = ["active", "inactive"];

export const DEFAULT_ORGANIZATION_LIMITS = {
  users: 2,
  menuItems: 50,
  ordersPerMonth: 100,
  locations: 1,
};

export const DEFAULT_ORGANIZATION_USAGE = {
  currentUsers: 0,
  currentMenuItems: 0,
  ordersThisMonth: 0,
  lastResetDate: new Date(),
};

export const DEFAULT_ORGANIZATION_SUBSCRIPTION = {
  plan: "free",
  status: "trialing",
};
