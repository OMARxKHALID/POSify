import { z } from "zod";
import {
  organizationBaseSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
  bulkOperationSchema,
} from "./base-schema.js";

/**
 * Category schema
 * Aligns with the Mongoose Category model
 */
export const categorySchema = organizationBaseSchema.extend({
  // Required fields
  name: z.string().min(1, "Category name is required").trim(),

  // Optional fields
  items: z.array(z.string()).default([]), // Array of Menu item IDs
  icon: z.string().trim().default(""),
  image: z.string().trim().default(""),
  description: z.string().trim().default(""),
  displayOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/**
 * Create category schema
 */
export const createCategorySchema = createSchema(categorySchema).omit({
  items: true,
});

/**
 * Update category schema
 */
export const updateCategorySchema = updateSchema(categorySchema);

/**
 * Category query schema
 */
export const categoryQuerySchema = querySchema({
  isActive: z.boolean().optional(),
});

/**
 * Category response schema
 */
export const categoryResponseSchema = categorySchema;

/**
 * Category list response schema
 */
export const categoryListResponseSchema = paginatedResponseSchema(
  categoryResponseSchema
);

/**
 * Category single response schema
 */
export const categorySingleResponseSchema = singleItemResponseSchema(
  categoryResponseSchema
);

/**
 * Category with menu items schema
 */
export const categoryWithItemsSchema = categoryResponseSchema.extend({
  menuItems: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
        price: z.number(),
        description: z.string().optional(),
        image: z.string().optional(),
        available: z.boolean(),
      })
    )
    .optional(),
});

/**
 * Category statistics schema
 */
export const categoryStatsSchema = z.object({
  categoryId: z.string(),
  name: z.string(),
  totalItems: z.number(),
  activeItems: z.number(),
  totalOrders: z.number(),
  totalRevenue: z.number(),
});

/**
 * Bulk category operations schema
 */
export const bulkCategorySchema = bulkOperationSchema(createCategorySchema);

/**
 * Category reorder schema
 */
export const categoryReorderSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  categories: z.array(
    z.object({
      _id: z.string(),
      displayOrder: z.number(),
    })
  ),
});
