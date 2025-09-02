import { z } from "zod";

/**
 * Base schema with common fields for all models
 */
export const baseSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Base schema for organization-scoped models
 */
export const organizationBaseSchema = baseSchema.extend({
  organizationId: z.string().min(1, "Organization ID is required"),
});

/**
 * Base schema for audit fields
 */
export const auditSchema = z.object({
  createdBy: z.string().optional(),
  lastModifiedBy: z.string().optional(),
});

/**
 * Base schema for address information
 */
export const addressSchema = z.object({
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

/**
 * Base schema for pagination
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Base schema for search filters
 */
export const searchSchema = z.object({
  search: z.string().trim().optional(),
  filters: z.record(z.any()).optional(),
});

/**
 * Base schema for date range
 */
export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

/**
 * Base schema for common response patterns
 */
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Base schema for paginated responses
 */
export const paginatedResponseSchema = (itemSchema) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  });

/**
 * Base schema for single item responses
 */
export const singleItemResponseSchema = (itemSchema) =>
  z.object({
    data: itemSchema,
  });

/**
 * Base schema for create operations
 */
export const createSchema = (baseSchema) =>
  baseSchema.omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  });

/**
 * Base schema for update operations
 */
export const updateSchema = (baseSchema) =>
  baseSchema.partial().omit({
    _id: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true,
  });

/**
 * Base schema for query operations
 */
export const querySchema = (additionalFields = {}) =>
  z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    search: z.string().trim().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    ...additionalFields,
  });

/**
 * Base schema for bulk operations
 */
export const bulkOperationSchema = (itemSchema) =>
  z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    items: z.array(itemSchema),
  });

/**
 * Base schema for bulk operation responses
 */
export const bulkOperationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  total: z.number(),
  successful: z.number(),
  failed: z.number(),
  errors: z.array(z.string()).optional(),
  results: z
    .array(
      z.object({
        id: z.string(),
        success: z.boolean(),
        message: z.string(),
      })
    )
    .optional(),
});
