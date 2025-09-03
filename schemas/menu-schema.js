import { z } from "zod";
import { organizationBaseSchema } from "./base-schema.js";
import { DEFAULT_PREP_TIME } from "@/constants";

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
});
