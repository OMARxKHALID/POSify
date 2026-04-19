import mongoose from "mongoose";
import { DEFAULT_PREP_TIME } from "@/constants";
import { baseSchemaOptions } from "@/schemas/base-schema";

const { Schema } = mongoose;

/**
 * Menu Schema
 * Represents menu items/products that can be ordered in a restaurant
 */
const MenuSchema = new Schema(
  {
    // Required fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization", // each menu item belongs to one organization
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category", // links the item to a category (e.g., Drinks, Starters)
      required: false, // Make optional until category system is implemented
      default: null, // Explicitly set default to null
    },
    name: {
      type: String,
      required: true,
      trim: true, // menu item name
    },
    price: {
      type: Number,
      required: true,
      min: 0, // must be non-negative
    },

    // Optional fields
    description: {
      type: String,
      trim: true, // short item description
    },
    image: {
      type: String,
      trim: true, // menu image (URL/path)
    },
    icon: {
      type: String,
      trim: true, // optional small icon for UI
    },
    available: {
      type: Boolean,
      default: true, // toggle availability (in/out of menu)
    },
    prepTime: {
      type: Number,
      default: DEFAULT_PREP_TIME, // estimated preparation time in minutes
    },
    isSpecial: {
      type: Boolean,
      default: false, // highlights item as "chef's special" or featured
    },
    stockQuantity: {
      type: Number,
      default: 100, // current quantity in stock
    },
    lowStockThreshold: {
      type: Number,
      default: 10, // threshold below which a "low stock" alert is triggered
    },
  },
  baseSchemaOptions
);

// INDEXES (optimizes queries)

MenuSchema.index({ organizationId: 1, categoryId: 1, available: 1 }); // filter by org, category, and availability
// Enable text search on name and description
MenuSchema.index({ name: "text", description: "text" });
MenuSchema.index({ organizationId: 1, isSpecial: 1 }); // quick lookup for specials

// Additional indexes for common query patterns
MenuSchema.index({ organizationId: 1, price: 1 }); // price range queries
MenuSchema.index({ organizationId: 1, createdAt: -1 }); // recent items

// STATIC METHODS

/**
 * Decrement stock for multiple items atomically
 */
MenuSchema.statics.decrementStock = async function (organizationId, items) {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.menuItem, organizationId },
      update: { $inc: { stockQuantity: -item.quantity } },
    },
  }));

  if (operations.length > 0) {
    return this.bulkWrite(operations);
  }
};

/**
 * Increment stock for multiple items atomically
 */
MenuSchema.statics.incrementStock = async function (organizationId, items) {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.menuItem, organizationId },
      update: { $inc: { stockQuantity: item.quantity } },
    },
  }));

  if (operations.length > 0) {
    return this.bulkWrite(operations);
  }
};

// EXPORT

export const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
