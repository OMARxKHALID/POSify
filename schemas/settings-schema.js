import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";
import {
  TAX_TYPES,
  RECEIPT_TEMPLATES,
  ORDER_STATUSES,
  SERVICE_CHARGE_APPLY_ON,
  DEFAULT_RECEIPT_FOOTER,
  DEFAULT_SUGGESTED_TIP_PERCENTAGES,
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
 * Order management schema
 */
export const orderManagementSchema = z.object({
  defaultStatus: z.enum(ORDER_STATUSES).default("pending"),
});

/**
 * Operational settings schema
 */
export const operationalSettingsSchema = z.object({
  orderManagement: orderManagementSchema.default({}),
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
 * Business config schema
 */
export const businessConfigSchema = z.object({
  serviceCharge: serviceChargeSchema.default({}),
  tipping: tippingSchema.default({}),
});

/**
 * Settings schema - simplified to only essential settings
 * Aligns with the Mongoose Settings model
 */
export const settingsSchema = organizationBaseSchema.extend({
  // Tax configuration
  taxes: z.array(taxSettingsSchema).default([]),

  // Receipt configuration
  receipt: receiptSettingsSchema.default({}),

  // Operational settings
  operational: operationalSettingsSchema.default({}),

  // Business configuration
  business: businessConfigSchema.default({}),

  // Currency
  currency: z.string().default("USD"),
});
