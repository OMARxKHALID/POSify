import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";


export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  icon: z.string().trim().default(""),
  image: z.string().trim().default(""),
  description: z.string().trim().default(""),
  isActive: z.boolean().default(true),
});


export const categorySchema = organizationBaseSchema.extend({
  name: z.string().min(1, "Category name is required").trim(),
  icon: z.string().trim().default(""),
  image: z.string().trim().default(""),
  description: z.string().trim().default(""),
  isActive: z.boolean().default(true),
});
