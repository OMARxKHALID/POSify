import mongoose from "mongoose";
import {
  DEFAULT_PREP_TIME,
  DEFAULT_INVENTORY_UNIT,
  DEFAULT_LOW_STOCK_THRESHOLD,
} from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Menu Schema
 * Represents menu items/products that can be ordered
 */
const MenuSchema = new Schema(
  {
    // Required fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Optional fields
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: Number,
      default: DEFAULT_PREP_TIME,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Inventory tracking
    inventory: {
      trackStock: {
        type: Boolean,
        default: false,
      },
      stockQuantity: {
        type: Number,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: DEFAULT_LOW_STOCK_THRESHOLD,
      },
      unit: {
        type: String,
        trim: true,
        default: DEFAULT_INVENTORY_UNIT,
      },
    },

    // Bulk pricing options
    bulkPricing: [
      {
        minQuantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

MenuSchema.index({ organizationId: 1, category: 1, available: 1 });
MenuSchema.index(
  { organizationId: 1, name: 1, description: 1 },
  { name: "text" }
);
MenuSchema.index({ organizationId: 1, price: 1 });
MenuSchema.index({ organizationId: 1, "inventory.stockQuantity": 1 });
MenuSchema.index({ organizationId: 1, isSpecial: 1 });
MenuSchema.index({ organizationId: 1, tags: 1 });

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Virtuals = computed fields, not stored in DB.
 * Here: returns a readable stock status.
 */
MenuSchema.virtual("stockStatus").get(function () {
  if (!this.inventory.trackStock) return "not-tracked";
  if (this.inventory.stockQuantity <= 0) return "out-of-stock";
  if (this.inventory.stockQuantity <= this.inventory.lowStockThreshold)
    return "low-stock";
  return "in-stock";
});

// ============================================================================
// INSTANCE METHODS
// ============================================================================

/**
 * Methods = reusable logic tied to documents.
 * Here: adjusts stock levels and availability.
 */
MenuSchema.methods.updateStock = function (quantity, type = "subtract") {
  if (!this.inventory.trackStock) return;

  this.inventory.stockQuantity =
    type === "subtract"
      ? Math.max(0, this.inventory.stockQuantity - quantity)
      : this.inventory.stockQuantity + quantity;

  this.available = this.inventory.stockQuantity > 0;
};

// ============================================================================
// EXPORT
// ============================================================================

export const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
