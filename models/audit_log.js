import mongoose from "mongoose";
import { baseSchemaOptions } from "@/schemas/base-schema.js";

const { Schema } = mongoose;

/**
 * Audit Log Schema
 * Tracks all system activities and changes for compliance and debugging
 */
const AuditLogSchema = new Schema(
  {
    // Required fields
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    userRole: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional fields
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      // Required only if the actor is not a super_admin
      required: function () {
        return this.userRole !== "super_admin";
      },
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
    },
    description: {
      type: String,
      trim: true,
    },
    metadata: {
      sessionId: {
        type: String,
        trim: true,
      },
      requestId: {
        type: String,
        trim: true,
      },
    },
  },
  baseSchemaOptions
);

// ============================================================================
// INDEXES
// ============================================================================

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

// ============================================================================
// VIRTUAL PROPERTIES
// ============================================================================

/**
 * Virtuals = computed fields, not stored in DB.
 * Here: checks if the action was performed by a super_admin.
 */
AuditLogSchema.virtual("isSuperAdminOperation").get(function () {
  return this.userRole === "super_admin";
});

// ============================================================================
// EXPORT
// ============================================================================

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
