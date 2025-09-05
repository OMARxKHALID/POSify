import { z } from "zod";

/**
 * Base password validation schema
 */
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: passwordSchema,
});
