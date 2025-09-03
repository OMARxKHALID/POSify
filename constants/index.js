// BUSINESS & ORGANIZATION
export const BUSINESS_TYPES = [
  "restaurant",
  "cafe",
  "bakery",
  "bar",
  "food-truck",
  "retail",
];

export const SUBSCRIPTION_PLANS = ["free", "basic", "premium", "enterprise"]; // subscription tiers
export const SUBSCRIPTION_STATUSES = [
  "active",
  "inactive",
  "trialing",
  "past_due",
  "canceled",
];
export const ORGANIZATION_STATUSES = ["active", "inactive"]; // org active/inactive

// USERS & SECURITY

export const USER_ROLES = ["super_admin", "admin", "staff", "pending"]; // roles
export const USER_STATUSES = ["active", "inactive", "suspended"]; // account lifecycle
export const SALT_ROUNDS = 12; // bcrypt salt

// LOCALIZATION
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

// ORDERS & PAYMENTS

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
export const REFUND_STATUSES = ["none", "partial", "full"];
export const ORDER_SOURCES = ["web", "mobile", "pos", "api"];

export const DELIVERY_TYPES = ["dine-in", "takeaway", "delivery"];
export const DELIVERY_STATUSES = [
  "pending",
  "preparing",
  "out-for-delivery",
  "delivered",
  "failed",
];

export const PAYMENT_METHODS = ["cash", "card", "wallet"];
export const TAX_TYPES = ["percentage", "fixed"];
export const SERVICE_CHARGE_APPLY_ON = ["subtotal", "total"];

// SETTINGS & CONFIG
export const RECEIPT_TEMPLATES = ["default", "minimal", "detailed"];
export const SYNC_MODES = ["auto", "manual"];

// DEFAULTS

export const DEFAULT_CUSTOMER_NAME = "Guest"; // walk-in customer
export const DEFAULT_RECEIPT_FOOTER = "Thank you for your business!";
export const DEFAULT_ORDER_NUMBER_FORMAT = "ORD-{seq}";

export const DEFAULT_LOW_STOCK_THRESHOLD = 5; // inventory alert
export const DEFAULT_MAX_DISCOUNT_PERCENTAGE = 50; // prevent abuse
export const DEFAULT_SUGGESTED_TIP_PERCENTAGES = [10, 15, 20]; // tip presets
export const DEFAULT_PREP_TIME = 15; // default preparation time in minutes
export const DEFAULT_MAX_TABLES = 20; // default maximum tables
export const DEFAULT_ESTIMATED_DELIVERY_TIME = 45; // default delivery time in minutes
export const DEFAULT_STORE_NAME = "My Store"; // default store name
export const DEFAULT_MANAGER_APPROVAL_THRESHOLD = 100; // default manager approval threshold

// Org default limits
export const DEFAULT_ORGANIZATION_LIMITS = {
  users: 2,
  menuItems: 50,
  ordersPerMonth: 100,
  locations: 1,
};

// Org usage snapshot
export const DEFAULT_ORGANIZATION_USAGE = {
  currentUsers: 0,
  currentMenuItems: 0,
  ordersThisMonth: 0,
  lastResetDate: new Date(),
};

// Org trial subscription
export const DEFAULT_ORGANIZATION_SUBSCRIPTION = {
  plan: "free",
  status: "trialing",
};
// Default permissions
export const DEFAULT_PERMISSIONS = {
  super_admin: [
    "users:manage",
    "organizations:manage",
    "reports:view",
    "audit:view",
  ],
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
