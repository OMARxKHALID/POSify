import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";
import { DEFAULT_PREP_TIME } from "@/constants";

/**
 * Menu schema for form validation (organizationId is optional - set automatically)
 */
export const menuFormSchema = z.object({
  // Required fields
  categoryId: z
    .string()
    .optional()
    .transform((val) => {
      // Transform "uncategorized" to undefined so it's not included in the data
      return val === "uncategorized" ? undefined : val;
    }),
  name: z.string().min(1, "Menu item name is required").trim(),
  price: z.coerce.number().min(0, "Price must be non-negative"),

  // Optional fields
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  available: z.boolean().default(true),
  prepTime: z.coerce
    .number()
    .min(0, "Preparation time must be non-negative")
    .default(DEFAULT_PREP_TIME),
  isSpecial: z.boolean().default(false),
  organizationId: z.string().optional(), // Set automatically on backend
});

/**
 * Item detail form schema for ItemDetailModal
 */
export const itemDetailFormSchema = z.object({
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(99, "Maximum quantity is 99"),
});

/**
 * Menu schema for API validation (with organizationId)
 * Aligns with the Mongoose Menu model
 */
export const menuSchema = organizationBaseSchema.extend({
  // Required fields
  categoryId: z.string().optional(), // Category ID (optional until category system is implemented)
  name: z.string().min(1, "Menu item name is required").trim(),
  price: z.coerce.number().min(0, "Price must be non-negative"),

  // Optional fields
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  available: z.boolean().default(true),
  prepTime: z.coerce
    .number()
    .min(0, "Preparation time must be non-negative")
    .default(DEFAULT_PREP_TIME),
  isSpecial: z.boolean().default(false),
});
