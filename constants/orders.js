/**
 * Orders & Payments Constants
 */

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
