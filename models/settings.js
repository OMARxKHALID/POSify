import mongoose from "mongoose";
import {
  TAX_TYPES,
  RECEIPT_TEMPLATES,
  ORDER_STATUSES,
  SERVICE_CHARGE_APPLY_ON,
  DEFAULT_RECEIPT_FOOTER,
  DEFAULT_SUGGESTED_TIP_PERCENTAGES,
} from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema";

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
 * Operational Settings Schema
 * Order management rules
 */
const OperationalSettingsSchema = new Schema(
  {
    orderManagement: {
      defaultStatus: { type: String, enum: ORDER_STATUSES, default: "pending" }, // new order status
    },
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
    receipt: { type: ReceiptSettingsSchema, default: () => ({}) }, // receipt config
    operational: { type: OperationalSettingsSchema, default: () => ({}) }, // ops rules
    business: { type: BusinessConfigSchema, default: () => ({}) }, // business rules

    // Currency
    currency: { type: String, uppercase: true, default: "USD" }, // store currency
  },
  baseSchemaOptions
);

// INDEXES

SettingsSchema.index({ organizationId: 1, updatedAt: -1 });

// EXPORT

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
