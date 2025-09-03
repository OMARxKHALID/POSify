import mongoose from "mongoose";
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
} from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

// SUB-SCHEMAS

/**
 * Tax Settings Schema
 * Defines tax rates and types
 */
const TaxSettingsSchema = new Schema(
  {
    id: { type: String, required: true, trim: true }, // tax ID
    name: { type: String, required: true, trim: true }, // tax name
    rate: { type: Number, required: true, min: 0 }, // tax %
    enabled: { type: Boolean, default: true }, // enable/disable tax
    type: { type: String, enum: TAX_TYPES, default: "percentage" }, // percentage or fixed
  },
  { _id: false }
);

/**
 * Payment Settings Schema
 * Configuration for payment methods and cash handling
 */
const PaymentSettingsSchema = new Schema(
  {
    defaultMethod: { type: String, enum: PAYMENT_METHODS, default: "cash" }, // default payment
    preferredMethods: { type: [String], default: PAYMENT_METHODS }, // available options
    cashHandling: {
      enableCashDrawer: { type: Boolean, default: true }, // open drawer
      requireExactChange: { type: Boolean, default: false }, // force exact cash
    },
  },
  { _id: false }
);

/**
 * Receipt Settings Schema
 * Receipt printing and formatting
 */
const ReceiptSettingsSchema = new Schema(
  {
    template: { type: String, enum: RECEIPT_TEMPLATES, default: "default" }, // receipt template
    footer: { type: String, trim: true, default: DEFAULT_RECEIPT_FOOTER }, // footer note
    header: { type: String, trim: true, default: "" }, // header note
    printLogo: { type: Boolean, default: true }, // show logo
    showTaxBreakdown: { type: Boolean, default: true }, // show tax details
    showItemDiscounts: { type: Boolean, default: true }, // show discounts
    showOrderNumber: { type: Boolean, default: true }, // show order ID
    showServerName: { type: Boolean, default: true }, // show staff
    autoPrint: { type: Boolean, default: false }, // auto print receipts
  },
  { _id: false }
);

/**
 * Customer Preferences Schema
 * Customer-related checkout rules
 */
const CustomerPreferencesSchema = new Schema(
  {
    requireCustomerPhone: { type: Boolean, default: false }, // enforce phone
    requireCustomerName: { type: Boolean, default: false }, // enforce name
    allowGuestCheckout: { type: Boolean, default: true }, // allow guest
    enableCustomerDatabase: { type: Boolean, default: true }, // store customer data
  },
  { _id: false }
);

/**
 * Operational Settings Schema
 * Order, sync, and prep rules
 */
const OperationalSettingsSchema = new Schema(
  {
    orderManagement: {
      defaultStatus: { type: String, enum: ORDER_STATUSES, default: "pending" }, // new order status
      orderNumberFormat: { type: String, default: DEFAULT_ORDER_NUMBER_FORMAT }, // order ID format
      autoConfirmOrders: { type: Boolean, default: false }, // auto-confirm orders
    },
    syncMode: { type: String, enum: SYNC_MODES, default: "auto" }, // sync mode
  },
  { _id: false }
);

/**
 * Business Config Schema
 * Discounts, service charge, tipping
 */
const BusinessConfigSchema = new Schema(
  {
    serviceCharge: {
      enabled: { type: Boolean, default: false }, // enable service charge
      percentage: { type: Number, default: 0 }, // % applied
      applyOn: {
        type: String,
        enum: SERVICE_CHARGE_APPLY_ON,
        default: "subtotal",
      }, // apply rule
    },
    tipping: {
      enabled: { type: Boolean, default: true }, // enable tips
      suggestedPercentages: {
        type: [Number],
        default: DEFAULT_SUGGESTED_TIP_PERCENTAGES,
      }, // tip options
      allowCustomTip: { type: Boolean, default: true }, // allow custom tip
    },
    discountRules: {
      maxDiscountPercentage: {
        type: Number,
        default: DEFAULT_MAX_DISCOUNT_PERCENTAGE,
      }, // max % discount
    },
  },
  { _id: false }
);

// MAIN SCHEMA

/**
 * Settings Schema
 * Holds all configuration for an organization
 */
const SettingsSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    }, // linked org

    taxes: { type: [TaxSettingsSchema], default: [] }, // tax config
    payment: { type: PaymentSettingsSchema, default: () => ({}) }, // payment config
    receipt: { type: ReceiptSettingsSchema, default: () => ({}) }, // receipt config
    customerPreferences: {
      type: CustomerPreferencesSchema,
      default: () => ({}),
    }, // customer rules
    operational: { type: OperationalSettingsSchema, default: () => ({}) }, // ops rules
    business: { type: BusinessConfigSchema, default: () => ({}) }, // business rules

    // Localization
    currency: { type: String, uppercase: true, default: "USD" }, // store currency
    timezone: { type: String, trim: true, default: "UTC" }, // store timezone
    language: { type: String, trim: true, default: "en" }, // language
    dateFormat: { type: String, enum: DATE_FORMATS, default: "MM/DD/YYYY" }, // date format
    timeFormat: { type: String, enum: TIME_FORMATS, default: "12h" }, // time format
  },
  baseSchemaOptions
);

// INDEXES

SettingsSchema.index({ organizationId: 1, updatedAt: -1 });

// EXPORT

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
