// ============================================================================
// BUSINESS & ORGANIZATION CONSTANTS
// ============================================================================

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

// ============================================================================
// USER & ROLE CONSTANTS
// ============================================================================

export const USER_ROLES = ["super_admin", "admin", "staff"];
export const USER_STATUSES = ["invited", "active", "inactive", "suspended"];

// Security constants
export const SALT_ROUNDS = 12;

// ============================================================================
// LOCALIZATION CONSTANTS
// ============================================================================

export const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "CAD",
  "AUD",
  "SGD",
];
export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
];
export const LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ja",
  "zh",
  "ko",
  "ar",
];

export const DATE_FORMATS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
export const TIME_FORMATS = ["12h", "24h"];

// ============================================================================
// ORDER & PAYMENT CONSTANTS
// ============================================================================

export const ORDER_STATUSES = [
  "pending",
  "preparing",
  "ready",
  "served",
  "paid",
  "cancelled",
  "refund",
  "partial refund",
];
export const DELIVERY_TYPES = ["dine-in", "takeaway", "delivery"];
export const DELIVERY_STATUSES = [
  "pending",
  "assigned",
  "picked-up",
  "delivered",
];
export const REFUND_STATUSES = ["none", "partial", "full"];
export const ORDER_SOURCES = ["web", "mobile", "pos", "api"];

export const PAYMENT_METHODS = ["cash", "card", "wallet"];
export const TAX_TYPES = ["percentage", "fixed"];
export const SERVICE_CHARGE_APPLY_ON = ["subtotal", "total"];

// ============================================================================
// SETTINGS & CONFIGURATION CONSTANTS
// ============================================================================

export const RECEIPT_TEMPLATES = ["default", "minimal", "detailed"];
export const SYNC_MODES = ["auto", "manual"];

// ============================================================================
// DEFAULT VALUES
// ============================================================================

// Time defaults (in minutes)
export const DEFAULT_PREP_TIME = 15;
export const DEFAULT_ORDER_TIMEOUT = 30;
export const DEFAULT_ESTIMATED_DELIVERY_TIME = 30;
export const DEFAULT_MAX_TABLES = 20;
export const DEFAULT_MANAGER_APPROVAL_THRESHOLD = 20;

// String defaults
export const DEFAULT_CUSTOMER_NAME = "Guest";
export const DEFAULT_INVENTORY_UNIT = "piece";
export const DEFAULT_RECEIPT_FOOTER = "Thank you for your business!";
export const DEFAULT_STORE_NAME = "My Restaurant";
export const DEFAULT_ORDER_NUMBER_FORMAT = "ORD-{seq}";

// Business rule defaults
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
export const DEFAULT_MAX_DISCOUNT_PERCENTAGE = 50;
export const DEFAULT_SUGGESTED_TIP_PERCENTAGES = [10, 15, 20];

// Organization defaults
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
