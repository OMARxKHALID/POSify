import { z } from "zod";
import { organizationBaseSchema } from "./base-schema";

export const counterSchema = organizationBaseSchema.extend({
  name: z.string().min(1, "Counter name is required"),
  seq: z.number().min(0).default(0),
});
