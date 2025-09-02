import { z } from "zod";
import {
  organizationBaseSchema,
  addressSchema,
  createSchema,
  updateSchema,
  querySchema,
  singleItemResponseSchema,
} from "./base-schema.js";
import {
  TAX_TYPES,
  PAYMENT_METHODS,
  RECEIPT_TEMPLATES,
  ORDER_STATUSES,
  SYNC_MODES,
  DATE_FORMATS,
  TIME_FORMATS,
  SERVICE_CHARGE_APPLY_ON,
  DEFAULT_ORDER_TIMEOUT,
  DEFAULT_MAX_TABLES,
  DEFAULT_ESTIMATED_DELIVERY_TIME,
  DEFAULT_PREP_TIME,
  DEFAULT_MANAGER_APPROVAL_THRESHOLD,
  DEFAULT_RECEIPT_FOOTER,
  DEFAULT_MAX_DISCOUNT_PERCENTAGE,
  DEFAULT_SUGGESTED_TIP_PERCENTAGES,
  DEFAULT_STORE_NAME,
  DEFAULT_ORDER_NUMBER_FORMAT,
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
  orderTimeout: z.number().min(1).default(DEFAULT_ORDER_TIMEOUT),
});

/**
 * Table management schema
 */
export const tableManagementSchema = z.object({
  enableTableService: z.boolean().default(true),
  maxTables: z.number().min(1).default(DEFAULT_MAX_TABLES),
  requireTableNumber: z.boolean().default(false),
});

/**
 * Delivery settings schema
 */
export const deliverySettingsSchema = z.object({
  enableDelivery: z.boolean().default(false),
  deliveryCharge: z.number().min(0).default(0),
  freeDeliveryThreshold: z.number().min(0).default(0),
  estimatedDeliveryTime: z
    .number()
    .min(1)
    .default(DEFAULT_ESTIMATED_DELIVERY_TIME),
});

/**
 * Kitchen display schema
 */
export const kitchenDisplaySchema = z.object({
  defaultPrepTime: z.number().min(0).default(DEFAULT_PREP_TIME),
  showCustomerInfo: z.boolean().default(true),
  soundAlerts: z.boolean().default(true),
});

/**
 * Operational settings schema
 */
export const operationalSettingsSchema = z.object({
  orderManagement: orderManagementSchema.default({}),
  tableManagement: tableManagementSchema.default({}),
  deliverySettings: deliverySettingsSchema.default({}),
  kitchenDisplay: kitchenDisplaySchema.default({}),
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
 * Store information schema
 */
export const storeInformationSchema = z.object({
  storeName: z.string().trim().default(DEFAULT_STORE_NAME),
  logoUrl: z.string().trim().default(""),
  address: addressSchema.default({}),
  phone: z.string().trim().default(""),
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim()
    .default(""),
  adminName: z.string().trim().default(""),
  website: z.string().trim().default(""),
});

/**
 * Features schema
 */
export const featuresSchema = z.object({
  inventory: z.boolean().default(false),
  customerDatabase: z.boolean().default(true),
  delivery: z.boolean().default(false),
  tableService: z.boolean().default(true),
  kitchenDisplay: z.boolean().default(false),
  reports: z.boolean().default(true),
  analytics: z.boolean().default(false),
  integrations: z.boolean().default(false),
});

/**
 * Localization schema
 */
export const localizationSchema = z.object({
  dateFormat: z.enum(DATE_FORMATS).default("MM/DD/YYYY"),
  timeFormat: z.enum(TIME_FORMATS).default("12h"),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  currency: z.string().default("USD"),
});

/**
 * Settings schema
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

  // Store information
  storeInformation: storeInformationSchema.default({}),

  // Features
  features: z
    .object({
      inventoryTracking: z.boolean().default(false),
      advancedReporting: z.boolean().default(false),
      multiLocation: z.boolean().default(false),
      loyaltyProgram: z.boolean().default(false),
      onlineOrdering: z.boolean().default(false),
    })
    .default({}),

  // Localization
  currency: z.string().default("USD"),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
  dateFormat: z.enum(DATE_FORMATS).default("MM/DD/YYYY"),
  timeFormat: z.enum(TIME_FORMATS).default("12h"),
});

/**
 * Create settings schema
 */
export const createSettingsSchema = createSchema(settingsSchema);

/**
 * Update settings schema
 */
export const updateSettingsSchema = updateSchema(settingsSchema);

/**
 * Settings query schema
 */
export const settingsQuerySchema = querySchema({});

/**
 * Settings response schema
 */
export const settingsResponseSchema = settingsSchema;

/**
 * Settings single response schema
 */
export const settingsSingleResponseSchema = singleItemResponseSchema(
  settingsResponseSchema
);

/**
 * Tax update schema
 */
export const taxUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  taxes: z.array(taxSettingsSchema),
});

/**
 * Payment update schema
 */
export const paymentUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  payments: paymentSettingsSchema,
});

/**
 * Receipt update schema
 */
export const receiptUpdateSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  receipts: receiptSettingsSchema,
});

/**
 * Feature toggle schema
 */
export const featureToggleSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  feature: z.string().min(1, "Feature name is required"),
  enabled: z.boolean(),
});
