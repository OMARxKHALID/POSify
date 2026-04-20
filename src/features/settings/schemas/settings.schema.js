import { z } from "zod";
import { organizationBaseSchema, updateSchema } from "@/schemas/base.schema";
import { DEFAULT_RECEIPT_FOOTER } from "@/features/pos/constants/receipt.constants";
import { DEFAULT_SUGGESTED_TIP_PERCENTAGES } from "@/features/pos/constants/orders.constants";
import { SERVICE_CHARGE_APPLY_ON } from "@/features/pos/constants/orders.constants";
import { RECEIPT_TEMPLATES } from "@/features/pos/constants/receipt.constants";
import { TAX_TYPES } from "@/features/pos/constants/orders.constants";
import { ORDER_STATUSES } from "@/features/pos/constants/orders.constants";

export const taxSettingsSchema = z.object({
  _id: z.string().min(1, "Tax ID is required").trim(),
  name: z.string().min(1, "Tax name is required").trim(),
  rate: z.coerce
    .number()
    .min(0, "Tax rate must be non-negative")
    .max(100, "Tax rate cannot exceed 100"),
  enabled: z.boolean().default(true),
  type: z.enum(TAX_TYPES).default("percentage"),
});

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

export const orderManagementSchema = z.object({
  defaultStatus: z.enum(ORDER_STATUSES).default("pending"),
});

export const operationalSettingsSchema = z.object({
  orderManagement: orderManagementSchema.default({}),
  demoMode: z.boolean().default(true),
});

export const serviceChargeSchema = z.object({
  enabled: z.boolean().default(false),
  percentage: z.coerce
    .number()
    .min(0, "Percentage must be non-negative")
    .max(100, "Percentage cannot exceed 100")
    .default(0),
  applyOn: z.enum(SERVICE_CHARGE_APPLY_ON).default("subtotal"),
});

export const tippingSchema = z.object({
  enabled: z.boolean().default(true),
  suggestedPercentages: z
    .array(z.number())
    .default(DEFAULT_SUGGESTED_TIP_PERCENTAGES),
  allowCustomTip: z.boolean().default(true),
});

export const businessConfigSchema = z.object({
  serviceCharge: serviceChargeSchema.default({}),
  tipping: tippingSchema.default({}),
});

export const settingsSchema = organizationBaseSchema.extend({
  taxes: z.array(taxSettingsSchema).default([]),
  receipt: receiptSettingsSchema.default({}),
  operational: operationalSettingsSchema.default({}),
  business: businessConfigSchema.default({}),
  currency: z.string().default("USD"),
});

export const updateSettingsSchema = updateSchema(settingsSchema);
