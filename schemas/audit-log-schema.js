import { z } from "zod";
import { baseSchema } from "./base-schema.js";

/**
 * Changes schema for audit log
 */
export const changesSchema = z.object({
  before: z.any().optional(),
  after: z.any().optional(),
});

/**
 * Metadata schema for audit log
 */
export const metadataSchema = z.object({
  sessionId: z.string().trim().optional(),
  requestId: z.string().trim().optional(),
});

/**
 * Audit log schema - this is it
 * Aligns with the Mongoose AuditLog model
 */
export const auditLogSchema = baseSchema.extend({
  // Required fields
  action: z.string().min(1, "Action is required").trim(),
  resource: z.string().min(1, "Resource is required").trim(),
  resourceId: z.string().min(1, "Resource ID is required"),
  userId: z.string().min(1, "User ID is required"),
  userEmail: z.string().email("Invalid email format").trim(),
  userRole: z.string().min(1, "User role is required").trim(),

  // Optional fields
  organizationId: z.string().optional(),
  ipAddress: z.string().trim().optional(),
  userAgent: z.string().trim().optional(),
  changes: changesSchema.optional(),
  description: z.string().trim().optional(),
  metadata: metadataSchema.optional(),
});
