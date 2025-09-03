import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Audit Log Model
 * Tracks user/system actions for compliance, debugging, and history
 */
const AuditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true }, // action performed
    resource: { type: String, required: true, trim: true }, // entity type (e.g., User, Order)
    resourceId: { type: Schema.Types.ObjectId, required: true }, // target entity ID
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // actor
    userEmail: { type: String, required: true, trim: true }, // actor's email
    userRole: { type: String, required: true, trim: true }, // actor's role

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: function () {
        return this.userRole !== "super_admin"; // org required unless super_admin
      },
    },

    ipAddress: { type: String, trim: true }, // request IP
    userAgent: { type: String, trim: true }, // device/browser info
    changes: {
      before: Schema.Types.Mixed, // state before change
      after: Schema.Types.Mixed, // state after change
    },
    description: { type: String, trim: true }, // human-readable summary
    metadata: {
      sessionId: { type: String, trim: true }, // session reference
      requestId: { type: String, trim: true }, // request trace ID
    },
  },
  baseSchemaOptions
);

// Indexes for faster querying
AuditLogSchema.index({ organizationId: 1, resource: 1, resourceId: 1 });
AuditLogSchema.index({ organizationId: 1, userId: 1 });
AuditLogSchema.index({ organizationId: 1, action: 1 });
AuditLogSchema.index({ organizationId: 1, userRole: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index(
  { organizationId: 1, userEmail: 1, description: 1 },
  { name: "text" }
);

// Virtual: check if actor was a super_admin
AuditLogSchema.virtual("isSuperAdminOperation").get(function () {
  return this.userRole === "super_admin";
});

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
