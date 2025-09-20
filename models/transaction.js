import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema";
import { PAYMENT_METHODS } from "@/constants";
import { Counter } from "./counter";
import { Organization } from "./organization";

const { Schema } = mongoose;

/**
 * Transaction Schema
 * Records payments, refunds, and adjustments associated with an organization
 */
const TransactionSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    transactionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["payment", "refund", "adjustment", "cash_drawer"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "cancelled"],
      default: "completed",
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    receiptNumber: {
      type: String,
      trim: true,
      default: null,
    },
  },
  baseSchemaOptions
);

// Indexes for common queries
TransactionSchema.index({ organizationId: 1, processedAt: -1 });
TransactionSchema.index({ organizationId: 1, type: 1, status: 1 });
TransactionSchema.index({ organizationId: 1, paymentMethod: 1 });
TransactionSchema.index({ organizationId: 1, processedBy: 1 });
TransactionSchema.index({ orderId: 1 }, { sparse: true });
TransactionSchema.index(
  { organizationId: 1, transactionNumber: 1 },
  { unique: true }
);

// Virtuals
TransactionSchema.virtual("signedAmount").get(function () {
  const multiplier = this.type === "refund" ? -1 : 1;
  return multiplier * (this.amount || 0);
});

// Ensure virtuals are included in JSON output
TransactionSchema.set("toJSON", { virtuals: true });
TransactionSchema.set("toObject", { virtuals: true });

// Static helper to create with auto-generated transactionNumber
TransactionSchema.statics.createWithTransactionNumber = async function (
  organizationId,
  transactionData
) {
  const sequence = await Counter.getNextSequence(
    organizationId,
    "transactionNumber"
  );
  const org = await Organization.findById(organizationId).lean();
  const orgCode = (org?.name || "ORG")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
  const transactionNumber = `TXN-${orgCode}-${sequence}`;

  let receiptNumber = null;
  if (transactionData?.type === "payment") {
    const receiptSeq = await Counter.getNextSequence(
      organizationId,
      "receiptNumber"
    );
    receiptNumber = `RCP-${orgCode}-${receiptSeq}`;
  }

  return this.create({
    ...transactionData,
    organizationId,
    transactionNumber,
    receiptNumber,
  });
};

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
