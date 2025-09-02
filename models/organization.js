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

/**
 * Organization Information Schema
 * Contains business/store details
 */
const OrganizationInfoSchema = new Schema(
  {
    // Required fields
    legalName: {
      type: String,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    }, // What shows on receipts, POS, etc.

    // Optional fields
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: {
      type: String,
      trim: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
    },
    logoUrl: {
      type: String,
      trim: true,
    }, // Stored in cloud storage
    taxId: {
      type: String,
      trim: true,
    }, // VAT / GST number if needed
    currency: {
      type: String,
      enum: CURRENCIES,
      default: "USD",
    },
    timezone: {
      type: String,
      enum: TIMEZONES,
      default: "UTC",
    },
    language: {
      type: String,
      enum: LANGUAGES,
      default: "en",
    },
  },
  { _id: false }
);

/**
 * Organization Schema
 * Represents a business/organization using the POS system
 */
const OrganizationSchema = new Schema(
  {
    // Required fields
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional fields
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    domain: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ORGANIZATION_STATUSES,
      default: "active",
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
      default: "restaurant",
    },

    // Business/store information
    information: {
      type: OrganizationInfoSchema,
      default: () => ({}),
    },

    // Subscription management
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

    // Usage limits
    limits: {
      users: {
        type: Number,
        default: DEFAULT_ORGANIZATION_LIMITS.users,
      },
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

    // Current usage tracking
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

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

OrganizationSchema.index({ domain: 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true });

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Pre-save middleware: Generate slug from name or domain
 */
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

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Check if subscription is active
 */
OrganizationSchema.virtual("isSubscriptionActive").get(function () {
  return ["active", "trialing"].includes(this.subscription.status);
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Check if organization can add a new user
 * @returns {boolean} - True if user limit not reached
 */
OrganizationSchema.methods.canAddUser = function () {
  return this.usage.currentUsers < this.limits.users;
};

/**
 * Check if organization can add a new menu item
 * @returns {boolean} - True if menu item limit not reached
 */
OrganizationSchema.methods.canAddMenuItem = function () {
  return this.usage.currentMenuItems < this.limits.menuItems;
};

/**
 * Check if organization can create a new order
 * @returns {boolean} - True if order limit not reached
 */
OrganizationSchema.methods.canCreateOrder = function () {
  return this.usage.ordersThisMonth < this.limits.ordersPerMonth;
};

// ============================================================================
// EXPORT
// ============================================================================

export const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);
