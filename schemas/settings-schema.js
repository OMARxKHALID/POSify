import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";
import {
  TAX_TYPES,
  PAYMENT_METHODS,
  RECEIPT_TEMPLATES,
  ORDER_STATUSES,
  SYNC_MODES,
  DATE_FORMATS,
  TIME_FORMATS,
  SERVICE_CHARGE_APPLY_ON,
  DEFAULT_RECEIPT_FOOTER,
  DEFAULT_MAX_DISCOUNT_PERCENTAGE,
  DEFAULT_SUGGESTED_TIP_PERCENTAGES,
  DEFAULT_ORDER_NUMBER_FORMAT,
  DEFAULT_MANAGER_APPROVAL_THRESHOLD,
} from "@/constants";

/**
 * Tax settings schema
 */
export const taxSettingsSchema = z.object({
  id: z.string().min(1, "Tax ID is required").trim(),
  name: z.string().min(1, "Tax name is required").trim(),
  rate: z.number().min(0, "Tax rate must be non-negative"),
  enabled: z.boolean().default(true),
  type: z.enum(TAX_TYPES).default("percentage"),
});

/**
 * Payment settings schema
 */
export const paymentSettingsSchema = z.object({
  defaultMethod: z.enum(PAYMENT_METHODS).default("cash"),
  preferredMethods: z.array(z.enum(PAYMENT_METHODS)).default(PAYMENT_METHODS),
  cashHandling: z
    .object({
      enableCashDrawer: z.boolean().default(true),
      requireExactChange: z.boolean().default(false),
    })
    .default({}),
});

/**
 * Receipt settings schema
 */
export const receiptSettingsSchema = z.object({
  template: z.enum(RECEIPT_TEMPLATES).default("default"),
  footer: z.string().trim().default(DEFAULT_RECEIPT_FOOTER),
  header: z.string().trim().default(""),
  printLogo: z.boolean().default(true),
  showTaxBreakdown: z.boolean().default(true),
  showItemDiscounts: z.boolean().default(true),
  showOrderNumber: z.boolean().default(true),
  showServerName: z.boolean().default(true),
  autoPrint: z.boolean().default(false),
});

/**
 * Customer preferences schema
 */
export const customerPreferencesSchema = z.object({
  requireCustomerPhone: z.boolean().default(false),
  requireCustomerName: z.boolean().default(false),
  allowGuestCheckout: z.boolean().default(true),
  enableCustomerDatabase: z.boolean().default(true),
});

/**
 * Order management schema
 */
export const orderManagementSchema = z.object({
  defaultStatus: z.enum(ORDER_STATUSES).default("pending"),
  orderNumberFormat: z.string().default(DEFAULT_ORDER_NUMBER_FORMAT),
  autoConfirmOrders: z.boolean().default(false),
});

/**
 * Operational settings schema
 */
export const operationalSettingsSchema = z.object({
  orderManagement: orderManagementSchema.default({}),
  syncMode: z.enum(SYNC_MODES).default("auto"),
});

/**
 * Service charge schema
 */
export const serviceChargeSchema = z.object({
  enabled: z.boolean().default(false),
  percentage: z.number().min(0).default(0),
  applyOn: z.enum(SERVICE_CHARGE_APPLY_ON).default("subtotal"),
});

/**
 * Tipping schema
 */
export const tippingSchema = z.object({
  enabled: z.boolean().default(true),
  suggestedPercentages: z
    .array(z.number())
    .default(DEFAULT_SUGGESTED_TIP_PERCENTAGES),
  allowCustomTip: z.boolean().default(true),
});

/**
 * Discount rules schema
 */
export const discountRulesSchema = z.object({
  maxDiscountPercentage: z
    .number()
    .min(0)
    .max(100)
    .default(DEFAULT_MAX_DISCOUNT_PERCENTAGE),
  staffDiscountPermission: z.boolean().default(false),
  requireManagerApproval: z.boolean().default(true),
  managerApprovalThreshold: z
    .number()
    .min(0)
    .default(DEFAULT_MANAGER_APPROVAL_THRESHOLD),
});

/**
 * Business config schema
 */
export const businessConfigSchema = z.object({
  serviceCharge: serviceChargeSchema.default({}),
  tipping: tippingSchema.default({}),
  discountRules: discountRulesSchema.default({}),
});

/**
 * Settings schema - this is it
 * Aligns with the Mongoose Settings model
 */
export const settingsSchema = organizationBaseSchema.extend({
  // Tax configuration
  taxes: z.array(taxSettingsSchema).default([]),

  // Payment configuration
  payment: paymentSettingsSchema.default({}),

  // Receipt configuration
  receipt: receiptSettingsSchema.default({}),

  // Customer preferences
  customerPreferences: customerPreferencesSchema.default({}),

  // Operational settings
  operational: operationalSettingsSchema.default({}),

  // Business configuration
  business: businessConfigSchema.default({}),

  // Localization
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  dateFormat: z.enum(DATE_FORMATS).default("MM/DD/YYYY"),
  timeFormat: z.enum(TIME_FORMATS).default("12h"),
});
