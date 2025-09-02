import { z } from "zod";
import {
  baseSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";

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
 * Audit log schema
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

/**
 * Create audit log schema
 */
export const createAuditLogSchema = auditLogSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Audit log query schema
 */
export const auditLogQuerySchema = querySchema({
  userId: z.string().optional(),
  userRole: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  userEmail: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).omit({
  organizationId: true, // Audit logs can be queried without organizationId
});

/**
 * Audit log response schema
 */
export const auditLogResponseSchema = auditLogSchema;

/**
 * Audit log list response schema
 */
export const auditLogListResponseSchema = paginatedResponseSchema(
  auditLogResponseSchema
);

/**
 * Audit log single response schema
 */
export const auditLogSingleResponseSchema = singleItemResponseSchema(
  auditLogResponseSchema
);

/**
 * Audit log statistics schema
 */
export const auditLogStatsSchema = z.object({
  totalLogs: z.number(),
  logsByAction: z.record(z.number()),
  logsByResource: z.record(z.number()),
  logsByUserRole: z.record(z.number()),
  logsByDate: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
});

/**
 * Audit log export schema
 */
export const auditLogExportSchema = z.object({
  organizationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  format: z.enum(["csv", "json", "pdf"]).default("csv"),
  filters: z.record(z.any()).optional(),
});

/**
 * Audit log cleanup schema
 */
export const auditLogCleanupSchema = z.object({
  organizationId: z.string().optional(),
  olderThan: z.number().min(1, "Days must be at least 1").default(90),
  dryRun: z.boolean().default(true),
});

/**
 * Audit log cleanup response schema
 */
export const auditLogCleanupResponseSchema = z.object({
  deletedCount: z.number(),
  totalSize: z.number(),
  estimatedSavings: z.number(),
});

/**
 * Audit log search schema
 */
export const auditLogSearchSchema = z.object({
  organizationId: z.string().optional(),
  query: z.string().min(1, "Search query is required"),
  fields: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * Audit log by user schema
 */
export const auditLogByUserSchema = z.object({
  organizationId: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

/**
 * Audit log by resource schema
 */
export const auditLogByResourceSchema = z.object({
  organizationId: z.string().optional(),
  resource: z.string().min(1, "Resource is required"),
  resourceId: z.string().min(1, "Resource ID is required"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

/**
 * Audit log activity summary schema
 */
export const auditLogActivitySummarySchema = z.object({
  organizationId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

/**
 * Audit log activity summary response schema
 */
export const auditLogActivitySummaryResponseSchema = z.object({
  period: z.string(),
  totalActions: z.number(),
  uniqueUsers: z.number(),
  topActions: z.array(
    z.object({
      action: z.string(),
      count: z.number(),
    })
  ),
  topUsers: z.array(
    z.object({
      userId: z.string(),
      userEmail: z.string(),
      count: z.number(),
    })
  ),
});
