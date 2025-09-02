import { z } from "zod";
import {
  organizationBaseSchema,
  createSchema,
  updateSchema,
  querySchema,
  paginatedResponseSchema,
  singleItemResponseSchema,
} from "./base-schema.js";
import {
  DEFAULT_PREP_TIME,
  DEFAULT_INVENTORY_UNIT,
  DEFAULT_LOW_STOCK_THRESHOLD,
} from "@/constants";

/**
 * Inventory tracking schema
 */
export const inventorySchema = z.object({
  trackStock: z.boolean().default(false),
  stockQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).default(DEFAULT_LOW_STOCK_THRESHOLD),
  unit: z.string().trim().default(DEFAULT_INVENTORY_UNIT),
});

/**
 * Bulk pricing schema
 */
export const bulkPricingSchema = z.object({
  minQuantity: z.number().min(1, "Minimum quantity must be at least 1"),
  price: z.number().min(0, "Price must be non-negative"),
});

/**
 * Menu schema
 * Aligns with the Mongoose Menu model
 */
export const menuSchema = organizationBaseSchema.extend({
  // Required fields
  category: z.string().min(1, "Category is required"), // Category ID
  name: z.string().min(1, "Menu item name is required").trim(),
  price: z.number().min(0, "Price must be non-negative"),

  // Optional fields
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  available: z.boolean().default(true),
  prepTime: z.number().min(0).default(DEFAULT_PREP_TIME),
  isSpecial: z.boolean().default(false),
  displayOrder: z.number().default(0),
  tags: z.array(z.string().trim()).default([]),

  // Inventory tracking
  inventory: inventorySchema.default({}),

  // Bulk pricing options
  bulkPricing: z.array(bulkPricingSchema).default([]),
});

/**
 * Create menu schema
 */
export const createMenuSchema = createSchema(menuSchema);

/**
 * Update menu schema
 */
export const updateMenuSchema = updateSchema(menuSchema);

/**
 * Menu query schema
 */
export const menuQuerySchema = querySchema({
  category: z.string().optional(),
  available: z.boolean().optional(),
  isSpecial: z.boolean().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * Menu response schema
 */
export const menuResponseSchema = menuSchema;

/**
 * Menu list response schema
 */
export const menuListResponseSchema =
  paginatedResponseSchema(menuResponseSchema);

/**
 * Menu single response schema
 */
export const menuSingleResponseSchema =
  singleItemResponseSchema(menuResponseSchema);

/**
 * Menu with category schema
 */
export const menuWithCategorySchema = menuResponseSchema.extend({
  category: z.object({
    _id: z.string(),
    name: z.string(),
    icon: z.string().optional(),
  }),
});

/**
 * Menu statistics schema
 */
export const menuStatsSchema = z.object({
  totalItems: z.number(),
  activeItems: z.number(),
  specialItems: z.number(),
  lowStockItems: z.number(),
  totalCategories: z.number(),
});

/**
 * Menu search schema
 */
export const menuSearchSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  query: z.string().min(1, "Search query is required"),
  category: z.string().optional(),
  available: z.boolean().optional(),
  limit: z.number().min(1).max(50).default(20),
});

/**
 * Menu bulk operations schema
 */
export const menuBulkSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  action: z.enum(["activate", "deactivate", "delete", "move"]),
  itemIds: z.array(z.string()),
  categoryId: z.string().optional(), // For move action
});
