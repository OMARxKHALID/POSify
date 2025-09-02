import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Counter Schema
 * Manages auto-incrementing sequences for order numbers and other entities
 */
const CounterSchema = new Schema(
  {
    // Required fields
    _id: {
      type: String,
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    // Optional fields
    seq: {
      type: Number,
      default: 0,
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

CounterSchema.index({ organizationId: 1, name: 1 });

// ============================================================================
// EXPORT
// ============================================================================

export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
