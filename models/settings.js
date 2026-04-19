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

const TaxSettingsSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    rate: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
    type: { type: String, enum: TAX_TYPES, default: "percentage" },
  },
  { _id: false },
);

const ReceiptSettingsSchema = new Schema(
  {
    template: { type: String, enum: RECEIPT_TEMPLATES, default: "default" },
    footer: { type: String, trim: true, default: DEFAULT_RECEIPT_FOOTER },
    header: { type: String, trim: true, default: "" },
    printLogo: { type: Boolean, default: true },
    showTaxBreakdown: { type: Boolean, default: true },
    showItemDiscounts: { type: Boolean, default: true },
    showOrderNumber: { type: Boolean, default: true },
    showServerName: { type: Boolean, default: true },
    autoPrint: { type: Boolean, default: false },
  },
  { _id: false },
);

const OperationalSettingsSchema = new Schema(
  {
    orderManagement: {
      defaultStatus: { type: String, enum: ORDER_STATUSES, default: "pending" },
    },
    demoMode: { type: Boolean, default: true },
  },
  { _id: false },
);

const BusinessConfigSchema = new Schema(
  {
    serviceCharge: {
      enabled: { type: Boolean, default: false },
      percentage: { type: Number, default: 0 },
      applyOn: {
        type: String,
        enum: SERVICE_CHARGE_APPLY_ON,
        default: "subtotal",
      },
    },
    tipping: {
      enabled: { type: Boolean, default: true },
      suggestedPercentages: {
        type: [Number],
        default: DEFAULT_SUGGESTED_TIP_PERCENTAGES,
      },
      allowCustomTip: { type: Boolean, default: true },
    },
  },
  { _id: false },
);

const SettingsSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    taxes: { type: [TaxSettingsSchema], default: [] },
    receipt: { type: ReceiptSettingsSchema, default: () => ({}) },
    operational: { type: OperationalSettingsSchema, default: () => ({}) },
    business: { type: BusinessConfigSchema, default: () => ({}) },

    currency: { type: String, uppercase: true, default: "USD" },
  },
  baseSchemaOptions,
);

SettingsSchema.index({ organizationId: 1, updatedAt: -1 });

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
