import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";

/**
 * Counter schema - this is it
 * Aligns with the Mongoose Counter model
 */
export const counterSchema = organizationBaseSchema.extend({
  // Required fields
  name: z.string().min(1, "Counter name is required"),

  // Optional fields
  seq: z.number().min(0).default(0),
});
