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

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refund", label: "Refund" },
  { value: "partial refund", label: "Partial Refund" },
];

export const REFUND_STATUSES = ["none", "partial", "full"];

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

export const TAX_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed" },
];

export const SERVICE_CHARGE_APPLY_ON = ["subtotal", "total"];

export const SERVICE_CHARGE_APPLY_ON_OPTIONS = [
  { value: "subtotal", label: "Subtotal" },
  { value: "total", label: "Total (after discounts)" },
];
