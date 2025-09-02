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
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Tax Settings Schema
 * Configuration for tax rates and types
 */
const TaxSettingsSchema = new Schema(
  {
    // Required fields
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional fields
    enabled: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: TAX_TYPES,
      default: "percentage",
    },
  },
  { _id: false }
);

/**
 * Payment Settings Schema
 * Configuration for payment methods and cash handling
 */
const PaymentSettingsSchema = new Schema(
  {
    // Required fields
    defaultMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "cash",
    },

    // Optional fields
    preferredMethods: {
      type: [String],
      default: PAYMENT_METHODS,
    },
    cashHandling: {
      enableCashDrawer: {
        type: Boolean,
        default: true,
      },
      requireExactChange: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false }
);

/**
 * Receipt Settings Schema
 * Configuration for receipt printing and formatting
 */
const ReceiptSettingsSchema = new Schema(
  {
    // Required fields
    template: {
      type: String,
      enum: RECEIPT_TEMPLATES,
      default: "default",
    },

    // Optional fields
    footer: {
      type: String,
      trim: true,
      default: DEFAULT_RECEIPT_FOOTER,
    },
    header: {
      type: String,
      trim: true,
      default: "",
    },
    printLogo: {
      type: Boolean,
      default: true,
    },
    showTaxBreakdown: {
      type: Boolean,
      default: true,
    },
    showItemDiscounts: {
      type: Boolean,
      default: true,
    },
    showOrderNumber: {
      type: Boolean,
      default: true,
    },
    showServerName: {
      type: Boolean,
      default: true,
    },
    autoPrint: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/**
 * Customer Preferences Schema
 * Settings for customer interaction and checkout
 */
const CustomerPreferencesSchema = new Schema(
  {
    // Optional fields
    requireCustomerPhone: {
      type: Boolean,
      default: false,
    },
    requireCustomerName: {
      type: Boolean,
      default: false,
    },
    allowGuestCheckout: {
      type: Boolean,
      default: true,
    },
    enableCustomerDatabase: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

/**
 * Operational Settings Schema
 * Day-to-day operational configurations
 */
const OperationalSettingsSchema = new Schema(
  {
    // Order management
    orderManagement: {
      defaultStatus: {
        type: String,
        enum: ORDER_STATUSES,
        default: "pending",
      },
      orderNumberFormat: {
        type: String,
        default: DEFAULT_ORDER_NUMBER_FORMAT,
      },
      autoConfirmOrders: {
        type: Boolean,
        default: false,
      },
      orderTimeout: {
        type: Number,
        default: DEFAULT_ORDER_TIMEOUT,
      },
    },

    // Table management
    tableManagement: {
      enableTableService: {
        type: Boolean,
        default: true,
      },
      maxTables: {
        type: Number,
        default: DEFAULT_MAX_TABLES,
      },
      requireTableNumber: {
        type: Boolean,
        default: false,
      },
    },

    // Delivery settings
    deliverySettings: {
      enableDelivery: {
        type: Boolean,
        default: false,
      },
      deliveryCharge: {
        type: Number,
        default: 0,
      },
      freeDeliveryThreshold: {
        type: Number,
        default: 0,
      },
      estimatedDeliveryTime: {
        type: Number,
        default: DEFAULT_ESTIMATED_DELIVERY_TIME,
      },
    },

    // Kitchen display
    kitchenDisplay: {
      defaultPrepTime: {
        type: Number,
        default: DEFAULT_PREP_TIME,
      },
      showCustomerInfo: {
        type: Boolean,
        default: true,
      },
      soundAlerts: {
        type: Boolean,
        default: true,
      },
    },
    syncMode: {
      type: String,
      enum: SYNC_MODES,
      default: "auto",
    },
  },
  { _id: false }
);

/**
 * Business Config Schema
 * Business rules and configurations
 */
const BusinessConfigSchema = new Schema(
  {
    // Service charge
    serviceCharge: {
      enabled: {
        type: Boolean,
        default: false,
      },
      percentage: {
        type: Number,
        default: 0,
      },
      applyOn: {
        type: String,
        enum: SERVICE_CHARGE_APPLY_ON,
        default: "subtotal",
      },
    },

    // Tipping
    tipping: {
      enabled: {
        type: Boolean,
        default: true,
      },
      suggestedPercentages: {
        type: [Number],
        default: DEFAULT_SUGGESTED_TIP_PERCENTAGES,
      },
      allowCustomTip: {
        type: Boolean,
        default: true,
      },
    },

    // Discount rules
    discountRules: {
      maxDiscountPercentage: {
        type: Number,
        default: DEFAULT_MAX_DISCOUNT_PERCENTAGE,
      },
      staffDiscountPermission: {
        type: Boolean,
        default: false,
      },
      requireManagerApproval: {
        type: Boolean,
        default: true,
      },
      managerApprovalThreshold: {
        type: Number,
        default: DEFAULT_MANAGER_APPROVAL_THRESHOLD,
      },
    },
  },
  { _id: false }
);

/**
 * Store Information Schema
 * Basic store details and contact information
 */
const StoreInformationSchema = new Schema(
  {
    // Required fields
    storeName: {
      type: String,
      trim: true,
      default: DEFAULT_STORE_NAME,
    },

    // Optional fields
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      street: {
        type: String,
        trim: true,
        default: "",
      },
      city: {
        type: String,
        trim: true,
        default: "",
      },
      state: {
        type: String,
        trim: true,
        default: "",
      },
      zipCode: {
        type: String,
        trim: true,
        default: "",
      },
      country: {
        type: String,
        trim: true,
        default: "",
      },
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    adminName: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

/**
 * Settings Schema
 * Main settings document containing all configuration options
 */
const SettingsSchema = new Schema(
  {
    // Required fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // Optional fields
    storeInformation: {
      type: StoreInformationSchema,
      default: () => ({}),
    },
    taxes: {
      type: [TaxSettingsSchema],
      default: [],
    },
    payment: {
      type: PaymentSettingsSchema,
      default: () => ({}),
    },
    receipt: {
      type: ReceiptSettingsSchema,
      default: () => ({}),
    },
    customerPreferences: {
      type: CustomerPreferencesSchema,
      default: () => ({}),
    },
    operational: {
      type: OperationalSettingsSchema,
      default: () => ({}),
    },
    business: {
      type: BusinessConfigSchema,
      default: () => ({}),
    },
    currency: {
      type: String,
      uppercase: true,
      default: "USD",
    },
    timezone: {
      type: String,
      trim: true,
      default: "UTC",
    },
    language: {
      type: String,
      trim: true,
      default: "en",
    },
    dateFormat: {
      type: String,
      enum: DATE_FORMATS,
      default: "MM/DD/YYYY",
    },
    timeFormat: {
      type: String,
      enum: TIME_FORMATS,
      default: "12h",
    },
    features: {
      inventoryTracking: {
        type: Boolean,
        default: false,
      },
      advancedReporting: {
        type: Boolean,
        default: false,
      },
      multiLocation: {
        type: Boolean,
        default: false,
      },
      loyaltyProgram: {
        type: Boolean,
        default: false,
      },
      onlineOrdering: {
        type: Boolean,
        default: false,
      },
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

SettingsSchema.index({ organizationId: 1, updatedAt: -1 });

// ============================================================================
// EXPORT
// ============================================================================

export const Settings =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
