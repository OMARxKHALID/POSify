import { z } from "zod";
import {
  organizationBaseSchema,
  createSchema,
  updateSchema,
  querySchema,
  singleItemResponseSchema,
} from "./base-schema.js";

/**
 * Counter schema
 * Aligns with the Mongoose Counter model
 */
export const counterSchema = organizationBaseSchema.extend({
  // Required fields
  _id: z.string().min(1, "Counter ID is required"),
  name: z.string().min(1, "Counter name is required"),

  // Optional fields
  seq: z.number().min(0).default(0),
});

/**
 * Create counter schema
 */
export const createCounterSchema = createSchema(counterSchema).omit({
  seq: true,
});

/**
 * Update counter schema
 */
export const updateCounterSchema = updateSchema(counterSchema);

/**
 * Counter query schema
 */
export const counterQuerySchema = querySchema({
  name: z.string().optional(),
});

/**
 * Counter response schema
 */
export const counterResponseSchema = counterSchema;

/**
 * Counter single response schema
 */
export const counterSingleResponseSchema = singleItemResponseSchema(
  counterResponseSchema
);

/**
 * Get next sequence schema
 */
export const getNextSequenceSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Counter name is required"),
});

/**
 * Get next sequence response schema
 */
export const getNextSequenceResponseSchema = z.object({
  sequence: z.number(),
  counter: counterResponseSchema,
});

/**
 * Reset counter schema
 */
export const resetCounterSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Counter name is required"),
  value: z.number().min(0).default(0),
});

/**
 * Reset counter response schema
 */
export const resetCounterResponseSchema = z.object({
  success: z.boolean(),
  previousValue: z.number(),
  newValue: z.number(),
  counter: counterResponseSchema,
});

/**
 * Increment counter schema
 */
export const incrementCounterSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  name: z.string().min(1, "Counter name is required"),
  increment: z.number().min(1).default(1),
});

/**
 * Increment counter response schema
 */
export const incrementCounterResponseSchema = z.object({
  success: z.boolean(),
  previousValue: z.number(),
  newValue: z.number(),
  counter: counterResponseSchema,
});

/**
 * Counter statistics schema
 */
export const counterStatsSchema = z.object({
  totalCounters: z.number(),
  countersByOrganization: z.record(z.number()),
  mostUsedCounters: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
    })
  ),
});

/**
 * Bulk counter operations schema
 */
export const bulkCounterSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  counters: z.array(
    z.object({
      name: z.string().min(1, "Counter name is required"),
      seq: z.number().min(0).optional(),
    })
  ),
});

/**
 * Counter initialization schema
 */
export const counterInitSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  counters: z.array(z.string().min(1, "Counter name is required")),
  startValue: z.number().min(0).default(0),
});

/**
 * Counter initialization response schema
 */
export const counterInitResponseSchema = z.object({
  success: z.boolean(),
  initialized: z.array(z.string()),
  skipped: z.array(z.string()),
  errors: z.array(z.string()),
});

/**
 * Counter cleanup schema
 */
export const counterCleanupSchema = z.object({
  organizationId: z.string().optional(),
  dryRun: z.boolean().default(true),
});

/**
 * Counter cleanup response schema
 */
export const counterCleanupResponseSchema = z.object({
  deletedCount: z.number(),
  totalCounters: z.number(),
  remainingCounters: z.number(),
});
