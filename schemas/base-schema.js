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

// ============================================================================
// MONGOOSE OPTIONS
// ============================================================================

/**
 * Base Mongoose schema options for all models
 */
export const baseSchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  versionKey: false,
};
