import { z } from "zod";
import { organizationBaseSchema } from "@/schemas/base.schema";
import { DEFAULT_PREP_TIME } from "@/features/menu/constants/menu-categories.constants";


export const menuFormSchema = z.object({

  categoryId: z
    .string()
    .optional()
    .transform((val) => {

      return val === "uncategorized" ? undefined : val;
    }),
  name: z.string().min(1, "Menu item name is required").trim(),
  price: z.coerce.number().min(0, "Price must be non-negative"),


  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  available: z.boolean().default(true),
  prepTime: z.coerce
    .number()
    .min(0, "Preparation time must be non-negative")
    .default(DEFAULT_PREP_TIME),
  isSpecial: z.boolean().default(false),
  stockQuantity: z.coerce.number().min(0).default(100),
  lowStockThreshold: z.coerce.number().min(0).default(10),

  organizationId: z.string().optional(), 
});


export const itemDetailFormSchema = z.object({
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(99, "Maximum quantity is 99"),
});


export const menuSchema = organizationBaseSchema.extend({

  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  name: z.string().min(1, "Menu item name is required").trim(),
  price: z.coerce.number().min(0, "Price must be non-negative"),


  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  available: z.boolean().default(true),
  prepTime: z.coerce
    .number()
    .min(0, "Preparation time must be non-negative")
    .default(DEFAULT_PREP_TIME),
  isSpecial: z.boolean().default(false),
  stockQuantity: z.coerce.number().min(0).default(100),
  lowStockThreshold: z.coerce.number().min(0).default(10),

});
