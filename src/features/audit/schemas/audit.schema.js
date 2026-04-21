import { z } from "zod";

export const auditLogSchema = z.object({
  _id: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  userEmail: z.string().email().optional(),
  userRole: z.string().optional(),
  description: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export const auditLogsResponseSchema = z.object({
  auditLogs: z.array(auditLogSchema),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    })
    .optional(),
  filters: z.record(z.unknown()).optional(),
});