import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Category Schema
 * Represents menu categories for organizing menu items
 */
const CategorySchema = new Schema(
  {
    // Required fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional fields
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Menu",
      },
    ],
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

CategorySchema.index({ organizationId: 1, name: 1 }, { unique: true });
CategorySchema.index({ organizationId: 1, displayOrder: 1 });
CategorySchema.index({ organizationId: 1, isActive: 1 });

// ============================================================================
// EXPORT
// ============================================================================

export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
