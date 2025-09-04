/**
 * Organization Model
 * -------------------
 * - Represents a business using the POS system
 * - Each Organization has exactly ONE Admin (owner)
 * - Multiple Staff can belong to an Organization
 * - Super Admins do NOT belong to any Organization
 */

import mongoose from "mongoose";
import {
  BUSINESS_TYPES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  ORGANIZATION_STATUSES,
  DEFAULT_ORGANIZATION_LIMITS,
  DEFAULT_ORGANIZATION_USAGE,
  DEFAULT_ORGANIZATION_SUBSCRIPTION,
  CURRENCIES,
  TIMEZONES,
  LANGUAGES,
} from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

// Sub-schema: Business/store details
const OrganizationInfoSchema = new Schema(
  {
    legalName: { type: String, trim: true },
    displayName: { type: String, trim: true }, // shown on POS/receipts
    orgPhone: { type: String, trim: true },
    orgEmail: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    logoUrl: { type: String, trim: true },
    taxId: { type: String, trim: true }, // VAT / GST number
    currency: { type: String, enum: CURRENCIES, default: "USD" },
    timezone: { type: String, enum: TIMEZONES, default: "UTC" },
    language: { type: String, enum: LANGUAGES, default: "en" },
  },
  { _id: false }
);

// Main schema
const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true }, // org name
    slug: { type: String, trim: true, lowercase: true }, // URL-friendly name
    domain: { type: String, trim: true, lowercase: true }, // optional custom domain
    status: { type: String, enum: ORGANIZATION_STATUSES, default: "active" },

    businessType: { type: String, enum: BUSINESS_TYPES, default: "restaurant" },
    information: { type: OrganizationInfoSchema, default: () => ({}) },

    owner: { type: Schema.Types.ObjectId, ref: "User", required: true }, // the Admin of this org

    subscription: {
      plan: {
        type: String,
        enum: SUBSCRIPTION_PLANS,
        default: DEFAULT_ORGANIZATION_SUBSCRIPTION.plan,
      },
      status: {
        type: String,
        enum: SUBSCRIPTION_STATUSES,
        default: DEFAULT_ORGANIZATION_SUBSCRIPTION.status,
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      trialEnd: Date,
    },

    limits: {
      users: { type: Number, default: DEFAULT_ORGANIZATION_LIMITS.users },
      menuItems: {
        type: Number,
        default: DEFAULT_ORGANIZATION_LIMITS.menuItems,
      },
      ordersPerMonth: {
        type: Number,
        default: DEFAULT_ORGANIZATION_LIMITS.ordersPerMonth,
      },
      locations: {
        type: Number,
        default: DEFAULT_ORGANIZATION_LIMITS.locations,
      },
    },

    usage: {
      currentUsers: {
        type: Number,
        default: DEFAULT_ORGANIZATION_USAGE.currentUsers,
      },
      currentMenuItems: {
        type: Number,
        default: DEFAULT_ORGANIZATION_USAGE.currentMenuItems,
      },
      ordersThisMonth: {
        type: Number,
        default: DEFAULT_ORGANIZATION_USAGE.ordersThisMonth,
      },
      lastResetDate: {
        type: Date,
        default: DEFAULT_ORGANIZATION_USAGE.lastResetDate,
      },
    },

    onboardingCompleted: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // created by admin
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" }, // updated by admin
  },
  baseSchemaOptions
);

// Indexes
OrganizationSchema.index({ domain: 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Pre-save: auto-generate slug from name/domain
OrganizationSchema.pre("save", async function (next) {
  if (!this.slug && (this.name || this.domain)) {
    this.slug = (this.domain || this.name)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Virtuals
OrganizationSchema.virtual("isSubscriptionActive").get(function () {
  return ["active", "trialing"].includes(this.subscription.status);
});

// Instance methods
OrganizationSchema.methods.canAddUser = function () {
  return this.usage.currentUsers < this.limits.users;
};
OrganizationSchema.methods.canAddMenuItem = function () {
  return this.usage.currentMenuItems < this.limits.menuItems;
};
OrganizationSchema.methods.canCreateOrder = function () {
  return this.usage.ordersThisMonth < this.limits.ordersPerMonth;
};

export const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
