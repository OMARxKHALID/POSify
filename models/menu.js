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
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category", // links the item to a category (e.g., Drinks, Starters)
      required: true,
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
      default: false, // highlights item as "chef’s special" or featured
    },
    displayOrder: {
      type: Number,
      default: 0, // for custom sorting in menu views
    },
    tags: [
      {
        type: String,
        trim: true, // labels like "vegan", "spicy", "gluten-free"
      },
    ],
  },
  baseSchemaOptions
);

// INDEXES (optimizes queries)

MenuSchema.index({ organizationId: 1, category: 1, available: 1 }); // filter by org, category, and availability
MenuSchema.index(
  { organizationId: 1, name: 1, description: 1 },
  { name: "text" } // enables text search on name/description
);
MenuSchema.index({ organizationId: 1, isSpecial: 1 }); // quick lookup for specials
MenuSchema.index({ organizationId: 1, tags: 1 }); // filtering by tags (e.g., vegan dishes)

// Additional indexes for common query patterns
MenuSchema.index({ organizationId: 1, price: 1 }); // price range queries
MenuSchema.index({ organizationId: 1, createdAt: -1 }); // recent items
MenuSchema.index({ organizationId: 1, displayOrder: 1 }); // menu ordering

// EXPORT

export const Menu = mongoose.models.Menu || mongoose.model("Menu", MenuSchema);
