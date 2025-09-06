import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Counter Schema
 * Handles auto-increment sequences (e.g., order numbers) per organization
 */
const CounterSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true, // counter always tied to an org
    },
    name: {
      type: String,
      required: true, // counter type (e.g., "order", "invoice")
    },
    seq: {
      type: Number,
      default: 0, // current sequence value
    },
  },
  baseSchemaOptions
);

// Index for quick lookup per org + counter name
CounterSchema.index({ organizationId: 1, name: 1 });

// Static method for getting next sequence
CounterSchema.statics.getNextSequence = async function (
  organizationId,
  counterName
) {
  const result = await this.findOneAndUpdate(
    { organizationId, name: counterName },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
  return result.seq;
};

// Export model
export const Counter =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
