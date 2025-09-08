import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";

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
