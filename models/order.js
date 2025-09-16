import mongoose from "mongoose";
import { Settings } from "./settings";
import { Counter } from "./counter";
import {
  PAYMENT_METHODS,
  ORDER_STATUSES,
  DELIVERY_TYPES,
  DELIVERY_STATUSES,
  REFUND_STATUSES,
  TAX_TYPES,
  DEFAULT_PREP_TIME,
  DEFAULT_CUSTOMER_NAME,
} from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema";

const { Schema } = mongoose;

/**
 * Order Item Schema
 * Represents individual items in an order
 */
const OrderItemSchema = new Schema(
  {
    // Required fields
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "Menu",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    // Optional fields
    discount: {
      type: Number,
      default: 0,
    },
    prepTime: {
      type: Number,
      default: DEFAULT_PREP_TIME,
    },
  },
  { _id: false }
);

/**
 * Tax Schema
 * Represents tax information for an order
 */
const TaxSchema = new Schema(
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
    },
    type: {
      type: String,
      enum: TAX_TYPES,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Return Item Schema
 * Represents returned items from an order
 */
const ReturnItemSchema = new Schema(
  {
    // Required fields
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    // Optional fields
    reason: {
      type: String,
      trim: true,
    },
    returnedAt: {
      type: Date,
      default: Date.now,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

/**
 * Order Schema
 * Represents a complete order with items, customer info, and payment details
 */
const OrderSchema = new Schema(
  {
    // Required fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    orderNumber: {
      type: String,
      required: true,
      trim: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },

    // Optional fields
    customerName: {
      type: String,
      trim: true,
      default: DEFAULT_CUSTOMER_NAME,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    deliveryType: {
      type: String,
      enum: DELIVERY_TYPES,
      default: "dine-in",
    },
    servedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tax: {
      type: [TaxSchema],
      default: [],
    },
    discount: {
      type: Number,
      default: 0,
    },
    promoDiscount: {
      type: Number,
      default: 0,
    },
    serviceCharge: {
      type: Number,
      default: 0,
    },
    tip: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    returns: {
      type: [ReturnItemSchema],
      default: [],
    },
    refundStatus: {
      type: String,
      enum: REFUND_STATUSES,
      default: "none",
    },
    notes: {
      type: String,
      trim: true,
    },

    // Delivery information
    deliveryInfo: {
      address: {
        type: String,
        trim: true,
      },
      deliveryCharge: {
        type: Number,
        default: 0,
      },
      estimatedDeliveryTime: {
        type: Date,
      },
      deliveryStatus: {
        type: String,
        enum: DELIVERY_STATUSES,
        default: "pending",
      },
      deliveryPartner: {
        type: String,
        trim: true,
      },
    },

    idempotencyKey: {
      type: String,
      trim: true,
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

OrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ organizationId: 1, status: 1 });
OrderSchema.index({ organizationId: 1, servedBy: 1 });
OrderSchema.index({ organizationId: 1, deliveryType: 1 });
OrderSchema.index({ organizationId: 1, "deliveryInfo.deliveryStatus": 1 });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

// Additional indexes for common query patterns
OrderSchema.index({ organizationId: 1, createdAt: -1 }); // recent orders
OrderSchema.index({ organizationId: 1, isPaid: 1, status: 1 }); // payment queries
OrderSchema.index({ organizationId: 1, "items.menuItem": 1 }); // menu item analytics
OrderSchema.index({ organizationId: 1, totalAmount: 1 }); // revenue queries

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Calculate net total (subtotal minus discounts)
 */
OrderSchema.virtual("netTotal").get(function () {
  return this.subtotal - this.discount - this.promoDiscount;
});

/**
 * Calculate final tax amount
 */
OrderSchema.virtual("finalTaxAmount").get(function () {
  return this.tax.reduce((sum, t) => sum + (t.amount || 0), 0);
});

/**
 * Calculate total preparation time
 */
OrderSchema.virtual("totalPrepTime").get(function () {
  return this.items.reduce((max, item) => Math.max(max, item.prepTime || 0), 0);
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Calculate order totals including tax, discounts, and charges
 */
OrderSchema.methods.calculateTotals = function () {
  const subtotal = this.items.reduce(
    (sum, item) => sum + item.quantity * (item.price - (item.discount || 0)),
    0
  );
  const taxTotal = this.tax.reduce((sum, t) => sum + (t.amount || 0), 0);

  this.subtotal = parseFloat(subtotal.toFixed(2));
  this.total = parseFloat(
    Math.max(
      subtotal -
        this.discount -
        this.promoDiscount +
        this.serviceCharge +
        taxTotal +
        this.tip,
      0
    ).toFixed(2)
  );
};

// ============================================================================
// STATIC METHODS
// ============================================================================

/**
 * Create order with auto-generated order number
 * @param {ObjectId} organizationId - Organization ID
 * @param {Object} orderData - Order data
 * @returns {Promise<Order>} - Created order
 */
OrderSchema.statics.createWithOrderNumber = async function (
  organizationId,
  orderData
) {
  const settings = await Settings.findOne({ organizationId }).lean();
  const sequence = await Counter.getNextSequence(organizationId, "orderNumber");

  const format =
    settings?.operational?.orderManagement?.orderNumberFormat || "ORD-{seq}";
  const orderNumber = format.replace("{seq}", sequence);

  return this.create({
    ...orderData,
    organizationId,
    orderNumber,
  });
};

// ============================================================================
// EXPORT
// ============================================================================

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
