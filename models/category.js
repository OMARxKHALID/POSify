import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema";

const { Schema } = mongoose;

/**
 * Category Schema
 * Used to group menu items inside an organization
 */
const CategorySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true, // category always belongs to an org
    },
    name: {
      type: String,
      required: true,
      trim: true, // category name
    },

    // Optional fields
    icon: { type: String, trim: true, default: "" }, // small icon
    image: { type: String, trim: true, default: "" }, // banner image
    description: { type: String, trim: true, default: "" }, // optional details
    isActive: { type: Boolean, default: true }, // category enabled/disabled
  },
  baseSchemaOptions
);

// Indexes for faster lookups & uniqueness
CategorySchema.index({ organizationId: 1, name: 1 }, { unique: true });
CategorySchema.index({ organizationId: 1, isActive: 1 });

// Export model
export const Category =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
